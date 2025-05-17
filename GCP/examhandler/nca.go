package examhandler

import (
	"net/http"
	"go.mongodb.org/mongo-driver/mongo"
)

func handleNCAQuestions(w http.ResponseWriter, collection *mongo.Collection) {
	HandleBaseQuestions(w, collection)
}

func handleNCAAnswers(userAnswers map[string]string, collection *mongo.Collection) ([]QuizResult, int) {
	return HandleBaseAnswers(userAnswers, collection)
}
