package main

import (
	"log"
	"net/http"

	"example.com/examhandler/examhandler"
)

func main() {
	http.Handle("/", http.HandlerFunc(examhandler.ExamHandler))
	log.Println("서버 시작")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
