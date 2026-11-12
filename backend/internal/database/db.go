package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct {
	Pool *pgxpool.Pool
}

func Connect(connString string) (*DB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("falha ao analisar configuração do PostgreSQL: %w", err)
	}

	config.MaxConns = 15
	config.MinConns = 2
	config.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("falha ao criar pool do PostgreSQL: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("falha no ping do PostgreSQL: %w", err)
	}

	db := &DB{Pool: pool}
	if err := db.migrate(ctx); err != nil {
		return nil, fmt.Errorf("falha nas migrações do banco: %w", err)
	}

	if err := db.seed(ctx); err != nil {
		log.Printf("[Database] Aviso ao semear dados iniciais: %v", err)
	}

	return db, nil
}

func (db *DB) Close() {
	if db.Pool != nil {
		db.Pool.Close()
	}
}

func (db *DB) migrate(ctx context.Context) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id VARCHAR(64) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			phone VARCHAR(50) NOT NULL,
			address TEXT NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			notifications_enabled BOOLEAN NOT NULL DEFAULT true,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS sessions (
			token VARCHAR(128) PRIMARY KEY,
			user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
		);`,
		`CREATE TABLE IF NOT EXISTS resident_profiles (
			id VARCHAR(64) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			address TEXT NOT NULL,
			phone VARCHAR(50) NOT NULL,
			notifications_enabled BOOLEAN NOT NULL DEFAULT true,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS trucks (
			id VARCHAR(64) PRIMARY KEY,
			label VARCHAR(255) NOT NULL,
			service VARCHAR(255) NOT NULL,
			distance_meters INT NOT NULL,
			eta_minutes INT NOT NULL,
			map_x DOUBLE PRECISION NOT NULL,
			map_y DOUBLE PRECISION NOT NULL,
			color VARCHAR(30) NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS reports (
			id VARCHAR(64) PRIMARY KEY,
			category VARCHAR(100) NOT NULL,
			description TEXT NOT NULL,
			address TEXT NOT NULL,
			image_uri TEXT,
			image_tone VARCHAR(30) NOT NULL DEFAULT 'amber',
			status VARCHAR(50) NOT NULL DEFAULT 'pendente',
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS report_updates (
			id BIGSERIAL PRIMARY KEY,
			report_id VARCHAR(64) NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			detail TEXT NOT NULL,
			at VARCHAR(100) NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		`CREATE TABLE IF NOT EXISTS notices (
			id VARCHAR(64) PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			body TEXT NOT NULL,
			time VARCHAR(100) NOT NULL,
			kind VARCHAR(50) NOT NULL DEFAULT 'route',
			read BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);`,
		// Remove qualquer perfil mockado prévio
		`DELETE FROM resident_profiles WHERE id = 'default' AND name = 'Mariana Costa';`,
	}

	for _, q := range queries {
		if _, err := db.Pool.Exec(ctx, q); err != nil {
			return err
		}
	}

	log.Println("✅ Tabelas migradas com sucesso no PostgreSQL!")
	return nil
}

func (db *DB) seed(ctx context.Context) error {
	// (Não semeamos usuário mockado — o usuário deve se cadastrar ou logar)

	// Seed Trucks
	var truckCount int
	if err := db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM trucks").Scan(&truckCount); err == nil && truckCount == 0 {
		_, _ = db.Pool.Exec(ctx, `
			INSERT INTO trucks (id, label, service, distance_meters, eta_minutes, map_x, map_y, color)
			VALUES 
				('truck-21', 'Caminhão 04 — Vila Verde', 'Coleta seletiva', 500, 7, 72.0, 31.0, '#7FB69E'),
				('truck-18', 'Caminhão 02 — Centro/Sul', 'Coleta domiciliar', 1200, 16, 21.0, 68.0, '#47745B')
		`)
	}

	// Seed Reports
	var reportCount int
	if err := db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM reports").Scan(&reportCount); err == nil && reportCount == 0 {
		_, _ = db.Pool.Exec(ctx, `
			INSERT INTO reports (id, category, description, address, image_tone, status, created_at)
			VALUES 
				('den-1042', 'Descarte irregular', 'Sacos e restos de material descartados próximo à praça.', 'Praça das Acácias, Vila Verde', 'amber', 'andamento', '2026-08-24 11:00:00+00'),
				('den-0978', 'Entulho', 'Restos de obra foram deixados na calçada.', 'Rua do Ipê, 41 — Vila Verde', 'sage', 'resolvido', '2026-08-11 15:40:00+00'),
				('den-0911', 'Lixo doméstico', 'Acúmulo de resíduos fora do horário de coleta.', 'Alameda dos Lírios, 92 — Vila Verde', 'sand', 'pendente', '2026-08-03 08:20:00+00')
		`)

		_, _ = db.Pool.Exec(ctx, `
			INSERT INTO report_updates (report_id, title, detail, at)
			VALUES 
				('den-1042', 'Denúncia recebida', 'Encaminhamos seu relato para a equipe responsável.', '24 ago, 11:00'),
				('den-1042', 'Vistoria programada', 'Uma equipe está prevista para passar pelo local.', '25 ago, 09:30'),
				('den-0978', 'Denúncia recebida', 'Sua solicitação foi registrada.', '11 ago, 15:40'),
				('den-0978', 'Coleta concluída', 'O material foi removido pela equipe de coleta.', '13 ago, 14:10'),
				('den-0911', 'Denúncia recebida', 'Estamos analisando as informações enviadas.', '03 ago, 08:20')
		`)
	}

	// Seed Notices
	var noticeCount int
	if err := db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM notices").Scan(&noticeCount); err == nil && noticeCount == 0 {
		_, _ = db.Pool.Exec(ctx, `
			INSERT INTO notices (id, title, body, time, kind, read)
			VALUES 
				('not-1', 'Caminhão a 500 m de você', 'A coleta de recicláveis está se aproximando da Rua das Palmeiras.', 'Agora', 'route', false),
				('not-2', 'Coleta concluída na sua rua', 'A rota de resíduos orgânicos foi finalizada às 09:45.', 'Hoje, 09:45', 'success', false),
				('not-3', 'Atualização na sua denúncia', 'A vistoria da Praça das Acácias foi programada.', 'Ontem, 16:20', 'report', true)
		`)
	}

	return nil
}
