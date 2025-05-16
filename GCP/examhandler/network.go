// network.go
package examhandler

import (
    "net/http"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/bson"
)

func handleNetworkQuestions(w http.ResponseWriter, collection *mongo.Collection, pathParts []string) {
    if len(pathParts) < 3 {
        sendError(w, "Exam date not specified", http.StatusBadRequest)
        return
    }
    handlePdfQuestions(w, collection)
}

func handleNetworkAnswers(userAnswers map[string]string, collection *mongo.Collection, examDate string) ([]QuizResult, int) {
    return handlePdfAnswers(userAnswers, collection, examDate,
        func(q bson.M, date string) (int, bool) {
            answers := q["answers"].(bson.M)
            var answer int
            switch date {
            case "20240825":
                answer = int(answers["20240825"].(int32))
            case "20240519":
                answer = int(answers["20240519"].(int32))
            case "20240225":
                answer = int(answers["20240225"].(int32))
            case "20231105":
                answer = int(answers["20231105"].(int32))
            case "20230820":
                answer = int(answers["20230820"].(int32))
            case "20230521":
                answer = int(answers["20230521"].(int32))
            case "20230226":
                answer = int(answers["20230226"].(int32))
            default:
                return 0, false
            }
            return answer, true
    })
}