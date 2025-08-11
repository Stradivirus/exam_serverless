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

// 나머지 함수들은 그대로 유지...