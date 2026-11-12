package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"coletaviva-api/internal/models"
)

func (h *Handler) GetNotices(c *gin.Context) {
	ctx := c.Request.Context()

	query := `SELECT id, title, body, time, kind, read, created_at FROM notices ORDER BY created_at DESC;`
	rows, err := h.DB.Pool.Query(ctx, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar avisos", "details": err.Error()})
		return
	}
	defer rows.Close()

	notices := make([]models.Notice, 0)
	for rows.Next() {
		var n models.Notice
		if err := rows.Scan(&n.ID, &n.Title, &n.Body, &n.Time, &n.Kind, &n.Read, &n.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar dados", "details": err.Error()})
			return
		}
		notices = append(notices, n)
	}

	c.JSON(http.StatusOK, notices)
}

func (h *Handler) MarkAllNoticesRead(c *gin.Context) {
	ctx := c.Request.Context()

	query := `UPDATE notices SET read = true WHERE read = false;`
	_, err := h.DB.Pool.Exec(ctx, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao marcar avisos como lidos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Todos os avisos foram marcados como lidos"})
}

type CreateNoticeInput struct {
	Title string `json:"title" binding:"required"`
	Body  string `json:"body" binding:"required"`
	Kind  string `json:"kind"` // "route", "success", "report"
}

func (h *Handler) CreateNotice(c *gin.Context) {
	ctx := c.Request.Context()

	var input CreateNoticeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Campos obrigatórios ausentes"})
		return
	}

	kind := "route"
	if input.Kind != "" {
		kind = input.Kind
	}

	id := fmt.Sprintf("not-%d", time.Now().UnixMilli())
	query := `
		INSERT INTO notices (id, title, body, time, kind, read, created_at)
		VALUES ($1, $2, $3, 'Agora', $4, false, NOW())
		RETURNING id, title, body, time, kind, read, created_at;
	`

	var notice models.Notice
	err := h.DB.Pool.QueryRow(ctx, query, id, input.Title, input.Body, kind).Scan(
		&notice.ID, &notice.Title, &notice.Body, &notice.Time, &notice.Kind, &notice.Read, &notice.CreatedAt,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar aviso", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, notice)
}
