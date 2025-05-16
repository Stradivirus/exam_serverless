package examhandler

import (
	"net/http"

	"go.mongodb.org/mongo-driver/mongo"
)

func handleAWSSysOpsQuestions(w http.ResponseWriter, collection *mongo.Collection) {
	handleBaseQuestions(w, collection)
}

func handleAWSSysOpsAnswers(userAnswers map[string]string, collection *mongo.Collection) ([]QuizResult, int) {
	return handleBaseAnswers(userAnswers, collection)
}
