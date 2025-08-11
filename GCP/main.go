package main

import (
    "log"
    "net/http"
    "os"

    "github.com/aws/aws-lambda-go/lambda"
    "github.com/joho/godotenv"

    "example.com/examhandler/examhandler"
)

func main() {
    _ = godotenv.Load()

    // 실행 모드에 따라 분기
    if os.Getenv("MODE") == "lambda" {
        // Lambda 모드
        lambda.Start(examhandler.ExamHandlerLambda)
    } else {
        // 로컬/서버 모드
        http.Handle("/", http.HandlerFunc(examhandler.ExamHandler))
        log.Println("server start")
        log.Fatal(http.ListenAndServe(":8080", nil))
    }
}
