import (
	"log"
	"net/http"
	"strings"

	"example.com/examhandler/examhandler"
)

func withCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowedOrigins := []string{
			"http://217.142.233.232:8000",
			"http://localhost:5173",
		}
		for _, o := range allowedOrigins {
			if origin == o {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		h.ServeHTTP(w, r)
	})
}

func main() {
	http.Handle("/", withCORS(http.HandlerFunc(examhandler.ExamHandler)))
	log.Println("서버 시작: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}