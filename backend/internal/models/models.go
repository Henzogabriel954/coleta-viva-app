package models

import "time"

type User struct {
	ID                   string    `json:"id"`
	Name                 string    `json:"name"`
	Email                string    `json:"email"`
	Phone                string    `json:"phone"`
	Address              string    `json:"address"`
	PasswordHash         string    `json:"-"`
	NotificationsEnabled bool      `json:"notificationsEnabled"`
	CreatedAt            time.Time `json:"createdAt"`
	UpdatedAt            time.Time `json:"updatedAt"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type ResidentProfile struct {
	ID                   string    `json:"id"`
	Name                 string    `json:"name"`
	Address              string    `json:"address"`
	Phone                string    `json:"phone"`
	NotificationsEnabled bool      `json:"notificationsEnabled"`
	UpdatedAt            time.Time `json:"updatedAt"`
}

type Truck struct {
	ID             string    `json:"id"`
	Label          string    `json:"label"`
	Service        string    `json:"service"`
	DistanceMeters int       `json:"distanceMeters"`
	EtaMinutes     int       `json:"etaMinutes"`
	MapX           float64   `json:"mapX"`
	MapY           float64   `json:"mapY"`
	Color          string    `json:"color"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type ReportUpdate struct {
	ID        int64     `json:"id,omitempty"`
	ReportID  string    `json:"reportId,omitempty"`
	Title     string    `json:"title"`
	Detail    string    `json:"detail"`
	At        string    `json:"at"`
	CreatedAt time.Time `json:"createdAt"`
}

type Report struct {
	ID          string         `json:"id"`
	Category    string         `json:"category"`
	Description string         `json:"description"`
	Address     string         `json:"address"`
	ImageURI    string         `json:"imageUri,omitempty"`
	ImageTone   string         `json:"imageTone"`
	Status      string         `json:"status"` // "pendente", "andamento", "resolvido"
	CreatedAt   time.Time      `json:"createdAt"`
	Updates     []ReportUpdate `json:"updates"`
}

type Notice struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	Time      string    `json:"time"`
	Kind      string    `json:"kind"` // "route", "success", "report"
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"createdAt"`
}
