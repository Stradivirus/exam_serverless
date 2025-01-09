// pdf_handler.go
package examhandler

import (
   "context"
   "encoding/json"
   "fmt"
   "net/http"
   "strconv"

   "go.mongodb.org/mongo-driver/bson"
   "go.mongodb.org/mongo-driver/mongo"
)

type PdfAnswerChecker func(question bson.M, pdfVersion string) (int, bool)

func handlePdfQuestions(w http.ResponseWriter, collection *mongo.Collection) {
   var questions []struct {
       ID             string `json:"id"`
       QuestionNumber int    `json:"question_number"`
   }

   cursor, err := collection.Find(context.Background(), bson.M{})
   if err != nil {
       sendError(w, "Error fetching questions", http.StatusInternalServerError)
       return
   }
   defer cursor.Close(context.Background())

   if err = cursor.All(context.Background(), &questions); err != nil {
       sendError(w, "Error parsing questions", http.StatusInternalServerError)
       return
   }

   json.NewEncoder(w).Encode(questions)
}

func handlePdfAnswers(
   userAnswers map[string]string,
   collection *mongo.Collection, 
   pdfVersion string,
   getAnswer PdfAnswerChecker,
) ([]QuizResult, int) {
   var results []QuizResult
   score := 0

   for questionNumberStr, userAnswer := range userAnswers {
       questionNumber, err := strconv.Atoi(questionNumberStr)
       if err != nil {
           continue
       }

       var question bson.M
       err = collection.FindOne(context.Background(), 
           bson.M{"question_number": questionNumber}).Decode(&question)
       if err != nil {
           fmt.Printf("Error finding question %d: %v\n", questionNumber, err)
           continue
       }

       correctAnswer, ok := getAnswer(question, pdfVersion)
       if !ok {
           continue
       }

       userAnswerInt, err := strconv.Atoi(userAnswer)
       if err != nil {
           continue
       }

       isCorrect := userAnswerInt == correctAnswer
       if isCorrect {
           score++
       }

       results = append(results, QuizResult{
           QuestionID:     questionNumberStr,
           QuestionNumber: questionNumber,
           UserAnswer:     userAnswer,
           CorrectAnswer:  strconv.Itoa(correctAnswer),
           IsCorrect:      isCorrect,
       })
   }

   return results, score
}