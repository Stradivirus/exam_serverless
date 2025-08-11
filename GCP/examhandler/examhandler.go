package examhandler

import (
    "context"
    "encoding/json"
    "strings"
    "fmt"
    
    "go.mongodb.org/mongo-driver/mongo"
)

type LambdaEvent struct {
    RawPath        string `json:"rawPath"`
    RequestContext struct {
        HTTP struct {
            Method string `json:"method"`
        } `json:"http"`
    } `json:"requestContext"`
    Body string `json:"body"`
}

type LambdaResponse struct {
    StatusCode int               `json:"statusCode"`
    Headers    map[string]string `json:"headers"`
    Body       string            `json:"body"`
}

func ExamHandlerLambda(ctx context.Context, event LambdaEvent) (LambdaResponse, error) {
    // 디버깅을 위한 로그
    fmt.Printf("Lambda Event - RawPath: %s, HTTPMethod: %s\n", event.RawPath, event.RequestContext.HTTP.Method)
    fmt.Printf("Event Body: %s\n", event.Body)
    
    headers := map[string]string{
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type":                 "application/json",
    }

    // OPTIONS 요청 처리
    if event.RequestContext.HTTP.Method == "OPTIONS" {
        return LambdaResponse{
            StatusCode: 200,
            Headers:    headers,
            Body:       "",
        }, nil
    }

    // 경로 파싱
    pathParts := strings.Split(strings.Trim(event.RawPath, "/"), "/")
    fmt.Printf("Path parts: %v\n", pathParts)
    
    if len(pathParts) < 2 {
        return errorResp("Invalid path"), nil
    }

    examType, action := pathParts[0], pathParts[1]
    fmt.Printf("ExamType: %s, Action: %s\n", examType, action)

    // DB 연결
    collection, client, err := getCollection(examType)
    if err != nil {
        fmt.Printf("DB connection error: %v\n", err)
        return errorResp("Database connection error"), nil
    }
    defer client.Disconnect(context.Background())
    
    fmt.Printf("Successfully connected to DB, collection: %s\n", examType)

    switch action {
    case "questions":
        return handleQuestionsLambda(examType, pathParts, collection, headers)
    case "check":
        return handleCheckLambda(event.Body, examType, pathParts, collection, headers)
    default:
        return errorResp("Invalid action"), nil
    }
}

func handleQuestionsLambda(examType string, pathParts []string, collection *mongo.Collection, headers map[string]string) (LambdaResponse, error) {
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

func handleCheckLambda(body, examType string, pathParts []string, collection *mongo.Collection, headers map[string]string) (LambdaResponse, error) {
    var userAnswers map[string]string
    if err := json.Unmarshal([]byte(body), &userAnswers); err != nil {
        return errorResp("Error parsing answers"), nil
    }

    var results []QuizResult
    var score int

    switch examType {
    case "nca":
        results, score = handleNCAAnswers(userAnswers, collection)
    case "awssaa":
        results, score = handleAWSSAAAnswers(userAnswers, collection)
    case "awssysops":
        results, score = handleAWSSysOpsAnswers(userAnswers, collection)
    case "linux":
        if len(pathParts) < 3 {
            return errorResp("PDF number required"), nil
        }
        pdfNumber := pathParts[2]
        results, score = handleLinuxAnswers(userAnswers, collection, pdfNumber)
    case "network":
        if len(pathParts) < 3 {
            return errorResp("Exam date required"), nil
        }
        examDate := pathParts[2]
        results, score = handleNetworkAnswers(userAnswers, collection, examDate)
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
func handleNCAQuestionsLambda(collection *mongo.Collection) ([]byte, error) {
    questions, err := getBaseQuestions(collection)
    if err != nil {
        return nil, err
    }
    // 기존 HTTP 핸들러와 동일한 형식으로 반환 (questions 배열을 직접 반환)
    return json.Marshal(questions)
}

// AWS SAA 질문 처리 (Lambda용)
func handleAWSSAAQuestionsLambda(collection *mongo.Collection) ([]byte, error) {
    questions, err := getBaseQuestions(collection)
    if err != nil {
        return nil, err
    }
    return json.Marshal(questions)
}

// AWS SysOps 질문 처리 (Lambda용)
func handleAWSSysOpsQuestionsLambda(collection *mongo.Collection) ([]byte, error) {
    questions, err := getBaseQuestions(collection)
    if err != nil {
        return nil, err
    }
    return json.Marshal(questions)
}

// Linux 질문 처리 (Lambda용)
func handleLinuxQuestionsLambda(collection *mongo.Collection) ([]byte, error) {
    questions, err := getPdfQuestions(collection)
    if err != nil {
        return nil, err
    }
    return json.Marshal(questions)
}

// Network 질문 처리 (Lambda용)
func handleNetworkQuestionsLambda(collection *mongo.Collection) ([]byte, error) {
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