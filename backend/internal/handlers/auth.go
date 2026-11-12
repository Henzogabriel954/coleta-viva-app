package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"coletaviva-api/internal/models"
)

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"required"`
	Address  string `json:"address" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *Handler) Register(c *gin.Context) {
	ctx := c.Request.Context()

	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos", "details": err.Error()})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	// Check if email already registered
	var existingID string
	err := h.DB.Pool.QueryRow(ctx, "SELECT id FROM users WHERE email = $1", input.Email).Scan(&existingID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Este e-mail já está cadastrado"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha"})
		return
	}

	userID := fmt.Sprintf("usr-%s", uuid.New().String()[:8])
	now := time.Now()

	query := `
		INSERT INTO users (id, name, email, phone, address, password_hash, notifications_enabled, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8)
		RETURNING id, name, email, phone, address, notifications_enabled, created_at, updated_at;
	`

	var user models.User
	err = h.DB.Pool.QueryRow(ctx, query, userID, input.Name, input.Email, input.Phone, input.Address, string(hashedPassword), now, now).Scan(
		&user.ID, &user.Name, &user.Email, &user.Phone, &user.Address, &user.NotificationsEnabled, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar usuário", "details": err.Error()})
		return
	}

	// Create session token
	token := uuid.New().String()
	_, err = h.DB.Pool.Exec(ctx, "INSERT INTO sessions (token, user_id) VALUES ($1, $2)", token, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao iniciar sessão"})
		return
	}

	// Also sync with resident_profiles table for legacy compatibility
	_, _ = h.DB.Pool.Exec(ctx, `
		INSERT INTO resident_profiles (id, name, address, phone, notifications_enabled, updated_at)
		VALUES ($1, $2, $3, $4, true, NOW())
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			address = EXCLUDED.address,
			phone = EXCLUDED.phone,
			updated_at = NOW();
	`, user.ID, user.Name, user.Address, user.Phone)

	c.JSON(http.StatusCreated, models.AuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *Handler) Login(c *gin.Context) {
	ctx := c.Request.Context()

	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "E-mail e senha são obrigatórios"})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	var user models.User
	var passwordHash string

	query := `
		SELECT id, name, email, phone, address, password_hash, notifications_enabled, created_at, updated_at
		FROM users
		WHERE email = $1;
	`
	err := h.DB.Pool.QueryRow(ctx, query, input.Email).Scan(
		&user.ID, &user.Name, &user.Email, &user.Phone, &user.Address, &passwordHash, &user.NotificationsEnabled, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "E-mail ou senha incorretos"})
		return
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "E-mail ou senha incorretos"})
		return
	}

	// Create new session token
	token := uuid.New().String()
	_, err = h.DB.Pool.Exec(ctx, "INSERT INTO sessions (token, user_id) VALUES ($1, $2)", token, user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar sessão"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *Handler) GetCurrentUser(c *gin.Context) {
	ctx := c.Request.Context()
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token não fornecido"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	var user models.User
	query := `
		SELECT u.id, u.name, u.email, u.phone, u.address, u.notifications_enabled, u.created_at, u.updated_at
		FROM users u
		INNER JOIN sessions s ON s.user_id = u.id
		WHERE s.token = $1 AND s.expires_at > NOW();
	`
	err := h.DB.Pool.QueryRow(ctx, query, token).Scan(
		&user.ID, &user.Name, &user.Email, &user.Phone, &user.Address, &user.NotificationsEnabled, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Sessão inválida ou expirada"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *Handler) Logout(c *gin.Context) {
	ctx := c.Request.Context()
	authHeader := c.GetHeader("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		token := strings.TrimPrefix(authHeader, "Bearer ")
		_, _ = h.DB.Pool.Exec(ctx, "DELETE FROM sessions WHERE token = $1", token)
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Desconectado com sucesso"})
}
