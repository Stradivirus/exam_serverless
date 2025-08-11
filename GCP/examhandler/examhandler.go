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
    // 이벤트를 JSON으로 변환하여 디버깅
    eventBytes, _ := json.Marshal(event)
    fmt.Printf("Raw Lambda Event: %s\n", string(eventBytes))
    
    // 이벤트를 map으로 변환
    eventMap := event.(map[string]interface{})
    
    // 경로 추출 (여러 가능한 키를 시도)
    var rawPath string
    if path, ok := eventMap["rawPath"].(string); ok {
        rawPath = path
    } else if path, ok := eventMap["path"].(string); ok {
        rawPath = path
    } else if path, ok := eventMap["resource"].(string); ok {
        rawPath = path
    } else {
        fmt.Printf("No path found in event\n")
        return errorResp("No path found"), nil
    }
    
    // HTTP 메서드 추출
    var httpMethod string
    if requestContext, ok := eventMap["requestContext"].(map[string]interface{}); ok {
        if http, ok := requestContext["http"].(map[string]interface{}); ok {
            if method, ok := http["method"].(string); ok {
                httpMethod = method
            }
        }
    }
    
    // 만약 requestContext가 없다면 직접 확인
    if httpMethod == "" {
        if method, ok := eventMap["httpMethod"].(string); ok {
            httpMethod = method
        }
    }
    
    // Body 추출
    var body string
    if bodyStr, ok := eventMap["body"].(string); ok {
        body = bodyStr
    }
    
    fmt.Printf("Extracted - RawPath: %s, HTTPMethod: %s\n", rawPath, httpMethod)
    fmt.Printf("Event Body: %s\n", body)
    
    headers := map[string]string{
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type":                 "application/json",
    }

    // OPTIONS 요청 처리
    if httpMethod == "OPTIONS" {
        return LambdaResponse{
            StatusCode: 200,
            Headers:    headers,
            Body:       "",
        }, nil
    }

    // 경로 파싱
    pathParts := strings.Split(strings.Trim(rawPath, "/"), "/")
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
        return handleCheckLambda(body, examType, pathParts, collection, headers)
    default:
        return errorResp("Invalid action"), nil
    }
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