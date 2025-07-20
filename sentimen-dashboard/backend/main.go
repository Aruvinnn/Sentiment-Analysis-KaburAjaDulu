package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// Struct untuk menampung data tweet
type Tweet struct {
	CreatedAt time.Time `json:"created_at"`
	Sentiment string    `json:"sentiment"`
}

// Struct untuk response API
type SentimentSummary struct {
	PositivePercentage float64 `json:"positivePercentage"`
	NeutralPercentage  float64 `json:"neutralPercentage"`
	NegativePercentage float64 `json:"negativePercentage"`
	TotalTweets        int     `json:"totalTweets"`
	ChartData          []int   `json:"chartData"`
}

var allTweets []Tweet

// Memuat data dari CSV saat server pertama kali hidup
func loadData() {
	file, err := os.Open("hasil_analisis_sentimen_Aardiiiiy_Final.csv")
	if err != nil {
		log.Fatal("FATAL: Pastikan file CSV sudah ada di folder backend. Error: ", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		log.Fatal("Gagal membaca CSV: ", err)
	}

	// Menggunakan layout format tanggal yang benar sesuai isi CSV
	// time.RubyDate dengan format: "Mon Jan 02 15:04:05 -0700 2006"
	const timeLayout = time.RubyDate

	// Kolom ke-4 adalah 'created_at' (index 3) dan ke-8 adalah 'sentiment' (index 7)
	for i, record := range records {
		if i == 0 {
			continue
		} // Lewati baris header

		createdAt, err := time.Parse(timeLayout, record[3])
		if err != nil {
			log.Printf("Peringatan: Melewati baris %d karena format tanggal salah: '%s'", i+1, record[3])
			continue
		}
		allTweets = append(allTweets, Tweet{
			CreatedAt: createdAt,
			Sentiment: record[7],
		})
	}
	fmt.Printf("Berhasil memuat %d data tweet.\n", len(allTweets))
}

// Handler yang akan merespon permintaan dari frontend
func getSentimentData(w http.ResponseWriter, r *http.Request) {
	startDateStr := r.URL.Query().Get("startDate")
	endDateStr := r.URL.Query().Get("endDate")

	log.Printf("Menerima permintaan dengan rentang: %s sampai %s", startDateStr, endDateStr)

	startDate, err := time.ParseInLocation("2006-01-02", startDateStr, time.Local)
	if err != nil {
		startDate, _ = time.Parse("2006-01-02", "2000-01-01")
	}

	endDate, err := time.ParseInLocation("2006-01-02", endDateStr, time.Local)
	if err != nil {
		endDate = time.Now()
	}
	endDate = endDate.Add(24*time.Hour - 1*time.Second) // Inklusif sampai akhir hari

	var positive, neutral, negative int
	for _, tweet := range allTweets {
		if !tweet.CreatedAt.IsZero() && (tweet.CreatedAt.After(startDate) || tweet.CreatedAt.Equal(startDate)) && tweet.CreatedAt.Before(endDate) {
			switch tweet.Sentiment {
			case "positive":
				positive++
			case "neutral":
				neutral++
			case "negative":
				negative++
			}
		}
	}

	total := positive + neutral + negative
	log.Printf("Total tweet ditemukan: %d (Pos: %d, Neu: %d, Neg: %d)", total, positive, neutral, negative)

	summary := SentimentSummary{TotalTweets: total}
	if total > 0 {
		summary.PositivePercentage = (float64(positive) / float64(total)) * 100
		summary.NeutralPercentage = (float64(neutral) / float64(total)) * 100
		summary.NegativePercentage = (float64(negative) / float64(total)) * 100
		summary.ChartData = []int{positive, neutral, negative}
	} else {
		summary.ChartData = []int{0, 0, 0}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(summary)
}

func main() {
	loadData()
	r := mux.NewRouter()
	r.HandleFunc("/api/sentiments", getSentimentData).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET"},
	})

	fmt.Println("Server backend Go berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", c.Handler(r)))
}
