package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"coletaviva-api/internal/database"
)

type Handler struct {
	DB *database.DB
}

func NewHandler(db *database.DB) *Handler {
	return &Handler{DB: db}
}

func (h *Handler) HealthCheck(c *gin.Context) {
	ctx := c.Request.Context()
	dbStatus := "connected"
	if err := h.DB.Pool.Ping(ctx); err != nil {
		dbStatus = "error: " + err.Error()
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "coleta-viva-api",
		"database":  dbStatus,
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
