// linux.go
package examhandler

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "strconv"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
)

func handleLinuxQuestions(w http.ResponseWriter, collection *mongo.Collection, pathParts []string) {
    if len(pathParts) < 3 {
        sendError(w, "PDF number not specified", http.StatusBadRequest)
        return
    }

    // 모든 문제 가져오기
    var questions []LinuxQuestion
    cursor, err := collection.Find(context.Background(), bson.M{})
    if err != nil {
        sendError(w, "Error fetching questions", http.StatusInternalServerError)
        return
    }
    defer cursor.Close(context.Background())

    if err = cursor.All(context.Background(), &questions); err != nil {
        sendError(w, "Error parsing questions", http.StatusInternalServerError)
        return
    }

    // 문제 번호로 정렬
    type QuestionResponse struct {
        ID             string `json:"id"`
        QuestionNumber int    `json:"question_number"`
    }

    var response []QuestionResponse
    for _, q := range questions {
        response = append(response, QuestionResponse{
            ID:             q.ID.Hex(),
            QuestionNumber: q.QuestionNumber,
        })
    }

    json.NewEncoder(w).Encode(response)
}

func handleLinuxAnswers(userAnswers map[string]string, collection *mongo.Collection, pdfNumber string) ([]QuizResult, int) {
    var results []QuizResult
    score := 0

    for questionNumberStr, userAnswer := range userAnswers {
        questionNumber, err := strconv.Atoi(questionNumberStr)
        if err != nil {
            continue
        }

        var question LinuxQuestion
        err = collection.FindOne(context.Background(), bson.M{"question_number": questionNumber}).Decode(&question)
        if err != nil {
            fmt.Printf("Error finding question %d: %v\n", questionNumber, err)
            continue
        }

        // PDF 번호에 따른 정답 선택
        var correctAnswer int
        switch pdfNumber {
        case "pdf1":
            correctAnswer = question.Answers.PDF1
        case "pdf2":
            correctAnswer = question.Answers.PDF2
        case "pdf3":
            correctAnswer = question.Answers.PDF3
        case "pdf4":
            correctAnswer = question.Answers.PDF4
        default:
            continue
        }

        userAnswerInt, err := strconv.Atoi(userAnswer)
        if err != nil {
            continue
        }

        isCorrect := userAnswerInt == correctAnswer
        if isCorrect {
            score++
        }

        results = append(results, QuizResult{
            QuestionID:     questionNumberStr,
            QuestionNumber: questionNumber,
            UserAnswer:     userAnswer,
            CorrectAnswer:  strconv.Itoa(correctAnswer),
            IsCorrect:      isCorrect,
        })
    }

    return results, score
}