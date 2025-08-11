package examhandler

import (
    "context"
    "encoding/json"
    "strings"
    "fmt"
    "go.mongodb.org/mongo-driver/mongo"
)

type LambdaResponse struct {
    StatusCode int               `json:"statusCode"`
    Headers    map[string]string `json:"headers"`
    Body       string            `json:"body"`
}

func ExamHandlerLambda(ctx context.Context, event interface{}) (LambdaResponse, error) {
    // 디버깅을 위한 로그
    fmt.Printf("Lambda function called!\n")
    eventBytes, _ := json.Marshal(event)
    fmt.Printf("Raw Lambda Event: %s\n", string(eventBytes))
    
    // 간단한 테스트 응답 (일단 이것부터 테스트)
    return LambdaResponse{
        StatusCode: 200,
        Headers: map[string]string{
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS", 
            "Access-Control-Allow-Headers": "Content-Type",
            "Content-Type":                 "application/json",
        },
        Body: `[{"id":"test","question":"Test Question","choice_a":"A","choice_b":"B","choice_c":"C","choice_d":"D"}]`,
    }, nil
}

func handleQuestionsLambda(examType string, pathParts []string, collection interface{}, headers map[string]string) (LambdaResponse, error) {
    var bodyBytes []byte
    var err error

    switch examType {
    case "nca":
        bodyBytes, err = handleNCAQuestionsLambda(collection)
    case "awssaa":
        bodyBytes, err = handleAWSSAAQuestionsLambda(collection)
    case "awssysops":
        bodyBytes, err = handleAWSSysOpsQuestionsLambda(collection)
    case "linux":
        if len(pathParts) < 3 {
            return errorResp("PDF number not specified"), nil
        }
        bodyBytes, err = handleLinuxQuestionsLambda(collection)
    case "network":
        if len(pathParts) < 3 {
            return errorResp("Exam date not specified"), nil
        }
        bodyBytes, err = handleNetworkQuestionsLambda(collection)
    default:
        return errorResp("Invalid exam type"), nil
    }

    if err != nil {
        return errorResp("Error processing questions"), nil
    }

    return LambdaResponse{
        StatusCode: 200,
        Headers:    headers,
        Body:       string(bodyBytes),
    }, nil
}

func handleCheckLambda(body, examType string, pathParts []string, collection interface{}, headers map[string]string) (LambdaResponse, error) {
    var userAnswers map[string]string
    if err := json.Unmarshal([]byte(body), &userAnswers); err != nil {
        return errorResp("Error parsing answers"), nil
    }

    var results []QuizResult
    var score int

    // 타입 캐스팅 추가
    mongoCollection := collection.(*mongo.Collection)

    switch examType {
    case "nca":
        results, score = handleNCAAnswers(userAnswers, mongoCollection)
    case "awssaa":
        results, score = handleAWSSAAAnswers(userAnswers, mongoCollection)
    case "awssysops":
        results, score = handleAWSSysOpsAnswers(userAnswers, mongoCollection)
    case "linux":
        if len(pathParts) < 3 {
            return errorResp("PDF number required"), nil
        }
        pdfNumber := pathParts[2]
        results, score = handleLinuxAnswers(userAnswers, mongoCollection, pdfNumber)
    case "network":
        if len(pathParts) < 3 {
            return errorResp("Exam date required"), nil
        }
        examDate := pathParts[2]
        results, score = handleNetworkAnswers(userAnswers, mongoCollection, examDate)
    default:
        return errorResp("Invalid exam type"), nil
    }

    response := QuizResponse{
        Results: results,
        Score:   score,
        Total:   len(userAnswers),
    }

    bodyBytes, err := json.Marshal(response)
    if err != nil {
        return errorResp("Error encoding response"), nil
    }

    return LambdaResponse{
        StatusCode: 200,
        Headers:    headers,
        Body:       string(bodyBytes),
    }, nil
}

// NCA 질문 처리 (Lambda용)
func handleNCAQuestionsLambda(collection interface{}) ([]byte, error) {
    questions, err := getBaseQuestions(collection)
    if err != nil {
        return nil, err
    }
    return json.Marshal(questions)
}

// AWS SAA 질문 처리 (Lambda용)
func handleAWSSAAQuestionsLambda(collection interface{}) ([]byte, error) {
    questions, err := getBaseQuestions(collection)
    if err != nil {
        return nil, err
    }
    return json.Marshal(questions)
}

// AWS SysOps 질문 처리 (Lambda용)
func handleAWSSysOpsQuestionsLambda(collection interface{}) ([]byte, error) {
    questions, err := getBaseQuestions(collection)
    if err != nil {
        return nil, err
    }
    return json.Marshal(questions)
}

// Linux 질문 처리 (Lambda용)
func handleLinuxQuestionsLambda(collection interface{}) ([]byte, error) {
    questions, err := getPdfQuestions(collection)
    if err != nil {
        return nil, err
    }
    return json.Marshal(questions)
}

// Network 질문 처리 (Lambda용)
func handleNetworkQuestionsLambda(collection interface{}) ([]byte, error) {
    questions, err := getPdfQuestions(collection)
    if err != nil {
        return nil, err
    }
    return json.Marshal(questions)
}

func errorResp(msg string) LambdaResponse {
    return LambdaResponse{
        StatusCode: 500,
        Headers: map[string]string{
            "Access-Control-Allow-Origin": "*",
            "Content-Type":                "application/json",
        },
        Body: `{"error":"` + msg + `"}`,
    }
}