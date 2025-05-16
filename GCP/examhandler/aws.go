// aws.go
package examhandler

import (
    "net/http"
    "go.mongodb.org/mongo-driver/mongo"
)

func handleAWSQuestions(w http.ResponseWriter, collection *mongo.Collection) {
    handleBaseQuestions(w, collection)
}

func handleAWSAnswers(userAnswers map[string]string, collection *mongo.Collection) ([]QuizResult, int) {
    return handleBaseAnswers(userAnswers, collection)
}