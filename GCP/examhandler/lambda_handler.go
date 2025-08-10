package examhandler

import (
    "context"
    "encoding/json"
    "fmt"
    "strings"

    // AWS Lambda API Gateway 이벤트용
    "github.com/aws/aws-lambda-go/events"
)

// Lambda용 핸들러
// API Gateway를 통해 호출된 이벤트를 처리
func ExamHandlerLambda(ctx context.Context) (string, error) {
    return "Lambda handler executed successfully", nil
}

/*
만약 AWS API Gateway의 HTTP 요청을 직접 처리하려면 아래와 같이 작성할 수 있습니다.

func ExamHandlerLambda(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
    pathParts := strings.Split(strings.Trim(req.Path, "/"), "/")
    if len(pathParts) < 2 {
        return events.APIGatewayProxyResponse{
            StatusCode: 400,
            Body:       `{"error":"Invalid path"}`,
        }, nil
    }

    examType, action := pathParts[0], pathParts[1]
    collection, client, err := getCollection(examType)
    if err != nil {
        return events.APIGatewayProxyResponse{
            StatusCode: 500,
            Body:       fmt.Sprintf(`{"error":"Database connection error: %v"}`, err),
        }, nil
    }
    defer client.Disconnect(ctx)

    // 여기서 action에 따라 처리 로직 분기
    switch action {
    case "questions":
        // 질문 목록 가져오기
        questions := []BaseQuestion{}
        // collection.Find() 로직 재사용 가능
        // 결과를 JSON으로 변환
        body, _ := json.Marshal(questions)
        return events.APIGatewayProxyResponse{
            StatusCode: 200,
            Headers:    map[string]string{"Content-Type": "application/json"},
            Body:       string(body),
        }, nil

    case "check":
        // 채점 로직 호출
        return events.APIGatewayProxyResponse{
            StatusCode: 200,
            Body:       `{"score": 10}`,
        }, nil
    }

    return events.APIGatewayProxyResponse{
        StatusCode: 400,
        Body:       `{"error":"Invalid action"}`,
    }, nil
}
*/
