package main

import (
	"context"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/joho/godotenv"

	"example.com/examhandler/examhandler"
)

func handler(ctx context.Context) (string, error) {
	// examhandler.ExamHandler를 람다용으로 변환해서 사용
	return examhandler.ExamHandlerLambda(ctx)
}

func main() {
	_ = godotenv.Load()
	http.Handle("/", http.HandlerFunc(examhandler.ExamHandler))
	log.Println("server start")
	log.Fatal(http.ListenAndServe(":8080", nil))

	lambda.Start(handler)
}
