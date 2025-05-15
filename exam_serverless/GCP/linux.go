package examhandler

import (
    "net/http"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/bson"
)

func handleLinuxQuestions(w http.ResponseWriter, collection *mongo.Collection, pathParts []string) {
    if len(pathParts) < 3 {
        sendError(w, "PDF number not specified", http.StatusBadRequest)
        return
    }
    handlePdfQuestions(w, collection)
}

func handleLinuxAnswers(userAnswers map[string]string, collection *mongo.Collection, pdfNumber string) ([]QuizResult, int) {
    return handlePdfAnswers(userAnswers, collection, pdfNumber,
        func(q bson.M, pdf string) (int, bool) {
            answers := q["answers"].(bson.M)
            var answer int
            switch pdf {
            case "pdf1":
                answer = int(answers["pdf1"].(int32))
            case "pdf2":
                answer = int(answers["pdf2"].(int32))
            case "pdf3":
                answer = int(answers["pdf3"].(int32))
            case "pdf4":
                answer = int(answers["pdf4"].(int32))
            default:
                return 0, false
            }
            return answer, true
    })
}