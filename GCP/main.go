package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"example.com/examhandler/examhandler"
)

func main() {
	log.Println("서버 시작: http://localhost:8080")
	uri := os.Getenv("MONGODB_URI")
	log.Printf("MONGODB_URI: %s", uri) // 무조건 출력

	if uri != "" {
		client, err := examhandler.ConnectForMain(uri)
		if err != nil {
			log.Printf("DB 연결 실패: %v", err)
		} else {
			collections, err := client.Database("exam").ListCollectionNames(context.Background(), map[string]interface{}{})
			if err != nil {
				log.Printf("컬렉션 목록 조회 실패: %v", err)
			} else {
				log.Printf("컬렉션 목록: %v", collections)
			}
			_ = client.Disconnect(context.Background())
		}
	} else {
		log.Printf("MONGODB_URI가 비어 있습니다")
	}

	http.Handle("/", http.HandlerFunc(examhandler.ExamHandler))
	log.Fatal(http.ListenAndServe(":8080", nil))
}
