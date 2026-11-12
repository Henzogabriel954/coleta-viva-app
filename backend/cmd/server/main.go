package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"coletaviva-api/internal/config"
	"coletaviva-api/internal/database"
	"coletaviva-api/internal/handlers"
	"coletaviva-api/internal/websocket"
)

func main() {
	cfg := config.Load()

	log.Printf("🚀 Iniciando Coleta Viva API...")
	log.Printf("🔌 Conectando ao PostgreSQL em %s...", cfg.DatabaseURL)

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Erro fatal ao inicializar banco de dados: %v", err)
	}
	defer db.Close()

	log.Printf("✅ Conectado ao PostgreSQL com sucesso!")

	// Initialize WebSocket Hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize Handlers
	h := handlers.NewHandler(db)

	// Start real-time truck position updates simulation
	h.StartTruckSimulation(hub)

	// Setup Gin router
	r := gin.Default()

	// Configure CORS for mobile & web apps
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check
	r.GET("/health", h.HealthCheck)
	r.GET("/api/health", h.HealthCheck)

	// WebSocket for real-time truck telemetry
	r.GET("/ws/trucks", func(c *gin.Context) {
		hub.HandleWS(c.Writer, c.Request)
	})

	// API Routes
	api := r.Group("/api")
	{
		// Auth (Login / Register / Me)
		api.POST("/auth/register", h.Register)
		api.POST("/auth/login", h.Login)
		api.GET("/auth/me", h.GetCurrentUser)
		api.POST("/auth/logout", h.Logout)

		// Profile
		api.GET("/profile", h.GetProfile)
		api.POST("/profile", h.SaveProfile)
		api.PATCH("/profile/notifications", h.UpdateNotificationPreference)

		// Trucks & Route
		api.GET("/trucks", h.GetTrucks)
		api.POST("/trucks/tick", h.TickTrucks)

		// Reports (Denúncias)
		api.GET("/reports", h.GetReports)
		api.GET("/reports/:id", h.GetReportByID)
		api.POST("/reports", h.CreateReport)

		// Notices (Avisos)
		api.GET("/notices", h.GetNotices)
		api.POST("/notices/read-all", h.MarkAllNoticesRead)
		api.POST("/notices", h.CreateNotice)
	}

	addr := ":" + cfg.Port
	log.Printf("📡 Servidor HTTP escutando na porta %s (http://localhost%s)", cfg.Port, addr)
	if err := r.Run(addr); err != nil && err != http.ErrServerClosed {
		log.Fatalf("❌ Erro no servidor: %v", err)
	}
}
