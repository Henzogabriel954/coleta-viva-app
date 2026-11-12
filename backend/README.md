# 🚚 Coleta Viva — Backend API (Go + PostgreSQL)

API REST e WebSocket de alta performance desenvolvida em **Go (Golang)** com banco de dados **PostgreSQL 16**.

---

## 🗄️ Conexão com o Banco de Dados

- **Host:** `p2.hcraft.online`
- **Porta:** `5432`
- **Database:** `hybrid_db`
- **Usuário:** `postgres`
- **URL de Conexão:** `postgres://postgres:ro8765post@p2.hcraft.online:5432/hybrid_db?sslmode=disable`

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Go 1.22+ instalado
- Variáveis no arquivo `.env` (ou variáveis de ambiente do sistema)

### 2. Rodar em desenvolvimento
```bash
cd backend
go run cmd/server/main.go
```

### 3. Compilar binário de produção
```bash
cd backend
go build -o bin/server cmd/server/main.go
./bin/server
```

O servidor iniciará em `http://localhost:8080`.

---

## 📡 Endpoints da API

### 🏥 Health Check
- `GET /health` — Status da API e teste de ping com o PostgreSQL.

### 👤 Perfil do Morador
- `GET /api/profile` — Obtém os dados cadastrais do morador.
- `POST /api/profile` — Cadastra ou atualiza nome, endereço e telefone.
- `PATCH /api/profile/notifications` — Ativa ou desativa a preferência de avisos.

### 🚛 Caminhões & Rastreamento
- `GET /api/trucks` — Retorna as posições atuais dos caminhões e o mais próximo.
- `POST /api/trucks/tick` — Avança manualmente a posição e distância da rota.
- `GET /ws/trucks` — **WebSocket** para streaming de telemetria dos caminhões em tempo real (atualização a cada 4s).

### 📋 Denúncias de Descarte
- `GET /api/reports` — Lista todas as denúncias com o histórico de atendimento.
- `GET /api/reports/:id` — Detalhes e linha do tempo de uma denúncia específica.
- `POST /api/reports` — Cria uma nova denúncia com categoria, descrição, endereço e foto opcional.

### 🔔 Avisos & Notificações
- `GET /api/notices` — Lista os avisos operacionais da coleta.
- `POST /api/notices/read-all` — Marca todos os avisos como lidos.
- `POST /api/notices` — Cria um novo aviso para os moradores.

---

## 🧱 Tabelas Criadas Automaticamente (Auto-Migration)

1. `resident_profiles` — Dados do morador e preferências.
2. `trucks` — Posição e telemetria dos caminhões.
3. `reports` — Denúncias de descarte irregular registradas.
4. `report_updates` — Linha do tempo de triagem, vistoria e resolução.
5. `notices` — Notificações e alertas da coleta.
