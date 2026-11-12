package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"coletaviva-api/internal/models"
)

func (h *Handler) GetProfile(c *gin.Context) {
	ctx := c.Request.Context()

	var profile models.ResidentProfile
	query := `SELECT id, name, address, phone, notifications_enabled, updated_at FROM resident_profiles ORDER BY updated_at DESC LIMIT 1`
	err := h.DB.Pool.QueryRow(ctx, query).Scan(
		&profile.ID,
		&profile.Name,
		&profile.Address,
		&profile.Phone,
		&profile.NotificationsEnabled,
		&profile.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

type UpdateProfileInput struct {
	Name                 string `json:"name" binding:"required"`
	Address              string `json:"address" binding:"required"`
	Phone                string `json:"phone" binding:"required"`
	NotificationsEnabled *bool  `json:"notificationsEnabled"`
}

func (h *Handler) SaveProfile(c *gin.Context) {
	ctx := c.Request.Context()

	var input UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Campos inválidos", "details": err.Error()})
		return
	}

	notifEnabled := true
	if input.NotificationsEnabled != nil {
		notifEnabled = *input.NotificationsEnabled
	}

	query := `
		INSERT INTO resident_profiles (id, name, address, phone, notifications_enabled, updated_at)
		VALUES ('default', $1, $2, $3, $4, NOW())
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			address = EXCLUDED.address,
			phone = EXCLUDED.phone,
			notifications_enabled = EXCLUDED.notifications_enabled,
			updated_at = NOW()
		RETURNING id, name, address, phone, notifications_enabled, updated_at;
	`

	var profile models.ResidentProfile
	err := h.DB.Pool.QueryRow(ctx, query, input.Name, input.Address, input.Phone, notifEnabled).Scan(
		&profile.ID,
		&profile.Name,
		&profile.Address,
		&profile.Phone,
		&profile.NotificationsEnabled,
		&profile.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar perfil", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

type ToggleNotificationInput struct {
	Enabled bool `json:"enabled"`
}

func (h *Handler) UpdateNotificationPreference(c *gin.Context) {
	ctx := c.Request.Context()

	var input ToggleNotificationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Entrada inválida"})
		return
	}

	query := `
		UPDATE resident_profiles
		SET notifications_enabled = $1, updated_at = NOW()
		WHERE id = 'default'
		RETURNING id, name, address, phone, notifications_enabled, updated_at;
	`

	var profile models.ResidentProfile
	err := h.DB.Pool.QueryRow(ctx, query, input.Enabled).Scan(
		&profile.ID,
		&profile.Name,
		&profile.Address,
		&profile.Phone,
		&profile.NotificationsEnabled,
		&profile.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar preferência"})
		return
	}

	c.JSON(http.StatusOK, profile)
}
