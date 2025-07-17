package examhandler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

func ExamHandler(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)

	if r.Method == http.MethodOptions {
		handleOptions(w)
		return
	}

	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(pathParts) < 2 {
		sendError(w, "Invalid path", http.StatusBadRequest)
		return
	}

	examType, action := pathParts[0], pathParts[1]

	collection, client, err := getCollection(examType)
	if err != nil {
		sendError(w, "Database connection error", http.StatusInternalServerError)
		return
	}
	defer client.Disconnect(context.Background())

	switch action {
	case "questions":
		if r.Method != http.MethodGet {
			sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		switch examType {
		case "nca":
			handleNCAQuestions(w, collection)
		case "awssaa":
			handleAWSSAAQuestions(w, collection)
		case "awssysops":
			handleAWSSysOpsQuestions(w, collection)
		case "linux":
			handleLinuxQuestions(w, collection, pathParts)
		case "network":
			handleNetworkQuestions(w, collection, pathParts)
		default:
			sendError(w, "Invalid exam type", http.StatusBadRequest)
		}
	case "check":
		if r.Method != http.MethodPost {
			sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var userAnswers map[string]string
		if err := json.NewDecoder(r.Body).Decode(&userAnswers); err != nil {
			sendError(w, "Error parsing answers", http.StatusBadRequest)
			return
		}
		var results []QuizResult
		var score int
		switch examType {
		case "nca":
			results, score = handleNCAAnswers(userAnswers, collection)
		case "awssaa":
			results, score = handleAWSSAAAnswers(userAnswers, collection)
		case "awssysops":
			results, score = handleAWSSysOpsAnswers(userAnswers, collection)
		case "linux":
			if len(pathParts) < 3 {
				sendError(w, "PDF number required", http.StatusBadRequest)
				return
			}
			pdfNumber := pathParts[2]
			results, score = handleLinuxAnswers(userAnswers, collection, pdfNumber)
		case "network":
			if len(pathParts) < 3 {
				sendError(w, "Exam date required", http.StatusBadRequest)
				return
			}
			examDate := pathParts[2]
			results, score = handleNetworkAnswers(userAnswers, collection, examDate)
		default:
			sendError(w, "Invalid exam type", http.StatusBadRequest)
			return
		}
		response := QuizResponse{
			Results: results,
			Score:   score,
			Total:   len(userAnswers),
		}
		json.NewEncoder(w).Encode(response)
	default:
		sendError(w, "Invalid action", http.StatusBadRequest)
	}
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
