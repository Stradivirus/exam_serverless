package examhandler

import (
    "context"
    "encoding/json"
    "math/rand"
    "time"
    "go.mongodb.org/mongo-driver/bson"
    "strings"
)

type LambdaEvent struct {
    RawPath  string            `json:"rawPath"`
    HTTPMethod string          `json:"requestContext.http.method"`
    Body     string            `json:"body"`
}

type LambdaResponse struct {
    StatusCode int               `json:"statusCode"`
    Headers    map[string]string `json:"headers"`
    Body       string            `json:"body"`
}

// examType을 인자로 받아서 다양한 시험 지원
func ExamHandlerLambda(ctx context.Context, event LambdaEvent) (LambdaResponse, error) {
    // 경로 파싱: /examType/action
    pathParts := strings.Split(strings.Trim(event.RawPath, "/"), "/")
    if len(pathParts) < 2 {
        return errorResp("Invalid path"), nil
    }
    examType, action := pathParts[0], pathParts[1]

    collection, client, err := getCollection(examType)
    if err != nil {
        return errorResp("DB 연결 실패"), nil
    }
    defer client.Disconnect(context.Background())

    headers := map[string]string{
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    switch action {
    case "questions":
        // 문제 조회 (셔플/20문제 제한 포함)
        var questions []BaseQuestion
        cursor, err := collection.Find(context.Background(), bson.M{})
        if err != nil {
            return errorResp("문제 조회 실패"), nil
        }
        defer cursor.Close(context.Background())
        if err = cursor.All(context.Background(), &questions); err != nil {
            return errorResp("문제 파싱 실패"), nil
        }
        rand.Seed(time.Now().UnixNano())
        if len(questions) > 20 {
            rand.Shuffle(len(questions), func(i, j int) {
                questions[i], questions[j] = questions[j], questions[i]
            })
            questions = questions[:20]
        }
        body := map[string]interface{}{
            "questions": questions,
        }
        bodyBytes, _ := json.Marshal(body)
        return LambdaResponse{
            StatusCode: 200,
            Headers:    headers,
            Body:       string(bodyBytes),
        }, nil

    case "check":
        // 채점 기능
        var userAnswers map[string]string
        if err := json.Unmarshal([]byte(event.Body), &userAnswers); err != nil {
            return errorResp("답안 파싱 실패"), nil
        }
        results, score := HandleBaseAnswers(userAnswers, collection)
        response := QuizResponse{
            Results: results,
            Score:   score,
            Total:   len(userAnswers),
        }
        bodyBytes, _ := json.Marshal(response)
        return LambdaResponse{
            StatusCode: 200,
            Headers:    headers,
            Body:       string(bodyBytes),
        }, nil

    default:
        return errorResp("Invalid action"), nil
    }
}

func errorResp(msg string) LambdaResponse {
    return LambdaResponse{
        StatusCode: 500,
        Headers: map[string]string{
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        Body: `{"error":"` + msg + `"}`,
    }
}