package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"coletaviva-api/internal/models"
)

func (h *Handler) GetReports(c *gin.Context) {
	ctx := c.Request.Context()

	query := `
		SELECT id, category, description, address, COALESCE(image_uri, ''), image_tone, status, created_at
		FROM reports
		ORDER BY created_at DESC;
	`
	rows, err := h.DB.Pool.Query(ctx, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar denúncias", "details": err.Error()})
		return
	}
	defer rows.Close()

	reports := make([]models.Report, 0)
	for rows.Next() {
		var r models.Report
		var imgURI string
		if err := rows.Scan(&r.ID, &r.Category, &r.Description, &r.Address, &imgURI, &r.ImageTone, &r.Status, &r.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar dados", "details": err.Error()})
			return
		}
		if imgURI != "" {
			r.ImageURI = imgURI
		}
		reports = append(reports, r)
	}

	// Fetch updates for each report
	for i := range reports {
		reports[i].Updates = h.fetchReportUpdates(ctx, reports[i].ID)
	}

	c.JSON(http.StatusOK, reports)
}

func (h *Handler) GetReportByID(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")

	query := `
		SELECT id, category, description, address, COALESCE(image_uri, ''), image_tone, status, created_at
		FROM reports
		WHERE id = $1;
	`
	var r models.Report
	var imgURI string
	err := h.DB.Pool.QueryRow(ctx, query, id).Scan(
		&r.ID, &r.Category, &r.Description, &r.Address, &imgURI, &r.ImageTone, &r.Status, &r.CreatedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Denúncia não encontrada"})
		return
	}

	if imgURI != "" {
		r.ImageURI = imgURI
	}
	r.Updates = h.fetchReportUpdates(ctx, r.ID)

	c.JSON(http.StatusOK, r)
}

func (h *Handler) fetchReportUpdates(ctx context.Context, reportID string) []models.ReportUpdate {
	query := `SELECT id, report_id, title, detail, at, created_at FROM report_updates WHERE report_id = $1 ORDER BY created_at ASC`
	rows, err := h.DB.Pool.Query(ctx, query, reportID)
	if err != nil {
		return []models.ReportUpdate{}
	}
	defer rows.Close()

	var updates []models.ReportUpdate
	for rows.Next() {
		var u models.ReportUpdate
		if err := rows.Scan(&u.ID, &u.ReportID, &u.Title, &u.Detail, &u.At, &u.CreatedAt); err == nil {
			updates = append(updates, u)
		}
	}
	if updates == nil {
		updates = []models.ReportUpdate{}
	}
	return updates
}

type CreateReportInput struct {
	Category    string `json:"category" binding:"required"`
	Description string `json:"description" binding:"required"`
	Address     string `json:"address" binding:"required"`
	ImageURI    string `json:"imageUri"`
}

func (h *Handler) CreateReport(c *gin.Context) {
	ctx := c.Request.Context()

	var input CreateReportInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Campos obrigatórios ausentes", "details": err.Error()})
		return
	}

	reportID := fmt.Sprintf("den-%d", time.Now().UnixMilli())
	tone := "amber"
	status := "pendente"
	now := time.Now()

	query := `
		INSERT INTO reports (id, category, description, address, image_uri, image_tone, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, category, description, address, COALESCE(image_uri, ''), image_tone, status, created_at;
	`

	var r models.Report
	var imgURI string
	err := h.DB.Pool.QueryRow(ctx, query, reportID, input.Category, input.Description, input.Address, input.ImageURI, tone, status, now).Scan(
		&r.ID, &r.Category, &r.Description, &r.Address, &imgURI, &r.ImageTone, &r.Status, &r.CreatedAt,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar denúncia", "details": err.Error()})
		return
	}
	if imgURI != "" {
		r.ImageURI = imgURI
	}

	// Add initial update
	updateQuery := `
		INSERT INTO report_updates (report_id, title, detail, at, created_at)
		VALUES ($1, 'Denúncia recebida', 'Recebemos seu relato e iniciaremos a triagem.', 'Agora', NOW())
		RETURNING id, report_id, title, detail, at, created_at;
	`
	var update models.ReportUpdate
	_ = h.DB.Pool.QueryRow(ctx, updateQuery, reportID).Scan(&update.ID, &update.ReportID, &update.Title, &update.Detail, &update.At, &update.CreatedAt)
	r.Updates = []models.ReportUpdate{update}

	// Also automatically create a notice in the system
	noticeQuery := `
		INSERT INTO notices (id, title, body, time, kind, read, created_at)
		VALUES ($1, 'Denúncia registrada', 'Seu protocolo foi criado e está aguardando análise.', 'Agora', 'report', false, NOW());
	`
	noticeID := fmt.Sprintf("not-%d", time.Now().UnixMilli())
	_, _ = h.DB.Pool.Exec(ctx, noticeQuery, noticeID)

	c.JSON(http.StatusCreated, r)
}
