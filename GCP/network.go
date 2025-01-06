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

    // 모든 문제 가져오기
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

// 4. handler.go의 ExamHandler 함수 내부 수정 부분
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
    case "network":          // 추가
        handleNetworkQuestions(w, collection, pathParts)
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
    case "network":         // 추가
        examDate := pathParts[2]
        results, score = handleNetworkAnswers(userAnswers, collection, examDate)
    default:
        sendError(w, "Invalid exam type", http.StatusBadRequest)
        return
    }