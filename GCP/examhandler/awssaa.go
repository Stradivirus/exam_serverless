package examhandler

import (
	"net/http"
	"go.mongodb.org/mongo-driver/mongo"
)

func handleAWSSAAQuestions(w http.ResponseWriter, collection *mongo.Collection) {
	HandleBaseQuestions(w, collection)
}

func handleAWSSAAAnswers(userAnswers map[string]string, collection *mongo.Collection) ([]QuizResult, int) {
	return HandleBaseAnswers(userAnswers, collection)
}
