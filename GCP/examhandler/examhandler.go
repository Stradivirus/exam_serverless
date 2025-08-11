package examhandler

import (
    "context"
    "encoding/json"
)

type LambdaResponse struct {
    StatusCode int               `json:"statusCode"`
    Headers    map[string]string `json:"headers"`
    Body       string            `json:"body"`
}

func ExamHandlerLambda(ctx context.Context) (LambdaResponse, error) {
    // DB 연결
    collection, client, err := getCollection("awssaa") // examType을 파싱해서 전달
    if err != nil {
        return LambdaResponse{StatusCode: 500, Body: `{"error":"DB 연결 실패"}`}, nil
    }
    defer client.Disconnect(context.Background())

    // 기존 로직 재사용
    var questions []BaseQuestion
    cursor, err := collection.Find(context.Background(), bson.M{})
    if err != nil {
        return LambdaResponse{StatusCode: 500, Body: `{"error":"문제 조회 실패"}`}, nil
    }
    defer cursor.Close(context.Background())
    if err = cursor.All(context.Background(), &questions); err != nil {
        return LambdaResponse{StatusCode: 500, Body: `{"error":"문제 파싱 실패"}`}, nil
    }

    bodyBytes, _ := json.Marshal(questions)
    headers := map[string]string{
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }
    resp := LambdaResponse{
        StatusCode: 200,
        Headers:    headers,
        Body:       string(bodyBytes),
    }
    return resp, nil
}