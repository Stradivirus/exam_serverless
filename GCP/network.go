// network.go
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

func handleNetworkQuestions(w http.ResponseWriter, collection *mongo.Collection, pathParts []string) {
    if len(pathParts) < 3 {
        sendError(w, "Exam date not specified", http.StatusBadRequest)
        return
    }

    var questions []NetworkQuestion
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

    // 문제 번호로 정렬하여 반환
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

func handleNetworkAnswers(userAnswers map[string]string, collection *mongo.Collection, examDate string) ([]QuizResult, int) {
    var results []QuizResult
    score := 0

    for questionNumberStr, userAnswer := range userAnswers {
        questionNumber, err := strconv.Atoi(questionNumberStr)
        if err != nil {
            continue
        }

        var question NetworkQuestion
        err = collection.FindOne(context.Background(), bson.M{"question_number": questionNumber}).Decode(&question)
        if err != nil {
            fmt.Printf("Error finding question %d: %v\n", questionNumber, err)
            continue
        }

        // 시험 날짜에 따른 정답 선택
        var correctAnswer int
        switch examDate {
        case "20240825":
            correctAnswer = question.Answers.Answer20240825
        case "20240519":
            correctAnswer = question.Answers.Answer20240519
        case "20240225":
            correctAnswer = question.Answers.Answer20240225
        case "20231105":
            correctAnswer = question.Answers.Answer20231105
        case "20230820":
            correctAnswer = question.Answers.Answer20230820
        case "20230521":
            correctAnswer = question.Answers.Answer20230521
        case "20230226":
            correctAnswer = question.Answers.Answer20230226
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