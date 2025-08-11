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

func ExamHandlerLambda(ctx context.Context) (string, error) {
    // 실제 비즈니스 로직 처리 (예시: 문제 리스트 반환)
    result := map[string]interface{}{
        "result": "ok",
        // 실제 데이터 추가
    }

    bodyBytes, _ := json.Marshal(result)

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

    respBytes, _ := json.Marshal(resp)
    return string(respBytes), nil
}