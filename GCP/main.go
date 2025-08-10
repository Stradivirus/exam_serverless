package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"

	"example.com/examhandler/examhandler"
)

func main() {
	_ = godotenv.Load()
	http.Handle("/", http.HandlerFunc(examhandler.ExamHandler))
	log.Println("server start")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
