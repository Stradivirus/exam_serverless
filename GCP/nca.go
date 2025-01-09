// nca.go
package examhandler

import (
    "net/http"
    "go.mongodb.org/mongo-driver/mongo"
)

func handleNCAQuestions(w http.ResponseWriter, collection *mongo.Collection) {
    handleBaseQuestions(w, collection)
}

func handleNCAAnswers(userAnswers map[string]string, collection *mongo.Collection) ([]QuizResult, int) {
    return handleBaseAnswers(userAnswers, collection)
}