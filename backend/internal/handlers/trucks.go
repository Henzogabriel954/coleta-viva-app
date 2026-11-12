package handlers

import (
	"context"
	"encoding/json"
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"coletaviva-api/internal/models"
	"coletaviva-api/internal/websocket"
)

type TrucksResponse struct {
	Trucks       []models.Truck `json:"trucks"`
	NearestTruck *models.Truck  `json:"nearestTruck,omitempty"`
}

func (h *Handler) GetTrucks(c *gin.Context) {
	ctx := c.Request.Context()

	trucks, err := h.fetchTrucks(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar caminhões", "details": err.Error()})
		return
	}

	var nearest *models.Truck
	if len(trucks) > 0 {
		nearest = &trucks[0]
		for i := range trucks {
			if trucks[i].DistanceMeters < nearest.DistanceMeters {
				nearest = &trucks[i]
			}
		}
	}

	c.JSON(http.StatusOK, TrucksResponse{
		Trucks:       trucks,
		NearestTruck: nearest,
	})
}

func (h *Handler) fetchTrucks(ctx context.Context) ([]models.Truck, error) {
	query := `SELECT id, label, service, distance_meters, eta_minutes, map_x, map_y, color, updated_at FROM trucks ORDER BY distance_meters ASC`
	rows, err := h.DB.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var trucks []models.Truck
	for rows.Next() {
		var t models.Truck
		if err := rows.Scan(&t.ID, &t.Label, &t.Service, &t.DistanceMeters, &t.EtaMinutes, &t.MapX, &t.MapY, &t.Color, &t.UpdatedAt); err != nil {
			return nil, err
		}
		trucks = append(trucks, t)
	}

	return trucks, nil
}

func (h *Handler) AdvanceTrucks(ctx context.Context) ([]models.Truck, error) {
	trucks, err := h.fetchTrucks(ctx)
	if err != nil {
		return nil, err
	}

	for i := range trucks {
		t := &trucks[i]
		if t.ID == "truck-21" {
			t.DistanceMeters = int(math.Max(180, float64(t.DistanceMeters-35)))
			t.EtaMinutes = int(math.Max(2, math.Ceil(float64(t.DistanceMeters)/75.0)))
			t.MapX = math.Max(46.0, t.MapX-1.8)
			t.MapY = math.Min(47.0, t.MapY+1.1)
		} else {
			t.DistanceMeters = int(math.Max(650, float64(t.DistanceMeters-45)))
			t.EtaMinutes = int(math.Max(9, math.Ceil(float64(t.DistanceMeters)/75.0)))
			t.MapX = math.Min(35.0, t.MapX+1.2)
			t.MapY = math.Max(52.0, t.MapY-1.4)
		}

		query := `
			UPDATE trucks
			SET distance_meters = $1, eta_minutes = $2, map_x = $3, map_y = $4, updated_at = NOW()
			WHERE id = $5;
		`
		_, _ = h.DB.Pool.Exec(ctx, query, t.DistanceMeters, t.EtaMinutes, t.MapX, t.MapY, t.ID)
	}

	return trucks, nil
}

func (h *Handler) TickTrucks(c *gin.Context) {
	ctx := c.Request.Context()
	trucks, err := h.AdvanceTrucks(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar rota"})
		return
	}

	var nearest *models.Truck
	if len(trucks) > 0 {
		nearest = &trucks[0]
	}

	c.JSON(http.StatusOK, TrucksResponse{Trucks: trucks, NearestTruck: nearest})
}

// StartTruckSimulation runs in background and broadcasts telemetry to WebSockets
func (h *Handler) StartTruckSimulation(hub *websocket.Hub) {
	ticker := time.NewTicker(4 * time.Second)
	go func() {
		for range ticker.C {
			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			trucks, err := h.AdvanceTrucks(ctx)
			cancel()

			if err == nil && len(trucks) > 0 {
				var nearest *models.Truck
				if len(trucks) > 0 {
					nearest = &trucks[0]
					for i := range trucks {
						if trucks[i].DistanceMeters < nearest.DistanceMeters {
							nearest = &trucks[i]
						}
					}
				}

				payload, err := json.Marshal(TrucksResponse{
					Trucks:       trucks,
					NearestTruck: nearest,
				})
				if err == nil {
					hub.Broadcast(payload)
				}
			}
		}
	}()
}
