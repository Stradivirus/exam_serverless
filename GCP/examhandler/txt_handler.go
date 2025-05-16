// base_handler.go
package examhandler

import (
    "context"
    "encoding/json"
    "math/rand"
    "net/http"
    "time"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
)

// BaseQuestionHandler : AWS와 NCA 공통 로직 처리
func handleBaseQuestions(w http.ResponseWriter, collection *mongo.Collection) {
    var questions []BaseQuestion
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

    // Shuffle and limit questions
    rand.Seed(time.Now().UnixNano())
    if len(questions) > 20 {
        rand.Shuffle(len(questions), func(i, j int) {
            questions[i], questions[j] = questions[j], questions[i]
        })
        questions = questions[:20]
    }

    json.NewEncoder(w).Encode(questions)
}

func handleBaseAnswers(userAnswers map[string]string, collection *mongo.Collection) ([]QuizResult, int) {
    var results []QuizResult
    score := 0

    for qID, userAns := range userAnswers {
        objectID, err := primitive.ObjectIDFromHex(qID)
        if err != nil {
            continue
        }

        var question BaseQuestion
        err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&question)
        if err != nil {
            continue
        }

        isCorrect := userAns == question.CorrectAnswer
        if isCorrect {
            score++
        }

        results = append(results, QuizResult{
            QuestionID: qID,
            Question:  question.Question,
            Choices: map[string]string{
                "A": question.ChoiceA,
                "B": question.ChoiceB,
                "C": question.ChoiceC,
                "D": question.ChoiceD,
            },
            UserAnswer:    userAns,
            CorrectAnswer: question.CorrectAnswer,
            IsCorrect:     isCorrect,
        })
    }

    return results, score
}