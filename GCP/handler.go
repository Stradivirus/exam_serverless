// handler.go
package examhandler

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "strings"
)

func ExamHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Printf("Received URL Path: %s\n", r.URL.Path)
    
    pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
    fmt.Printf("Path parts: %v\n", pathParts)

    if len(pathParts) < 2 {
        fmt.Printf("Invalid path length: %d\n", len(pathParts))
        sendError(w, "Invalid path", http.StatusBadRequest)
        return
    }

    examType := pathParts[0]
    action := pathParts[1]
    fmt.Printf("Exam type: %s, Action: %s\n", examType, action)

    setCORSHeaders(w)

    if r.Method == http.MethodOptions {
        handleOptions(w)
        return
    }

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
        case "aws":
            handleAWSQuestions(w, collection)
        case "linux":
            handleLinuxQuestions(w, collection, pathParts)
        case "ncp200":           
            handleNCP200Questions(w, collection)
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
        case "aws":
            results, score = handleAWSAnswers(userAnswers, collection)
        case "linux":
            pdfNumber := pathParts[2] 
            results, score = handleLinuxAnswers(userAnswers, collection, pdfNumber)
        case "ncp200":          
            results, score = handleNCP200Answers(userAnswers, collection)
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