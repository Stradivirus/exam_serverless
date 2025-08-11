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

// 공통 문제 조회 핸들러 (HTTP용)
func HandleBaseQuestions(w http.ResponseWriter, collection *mongo.Collection) {
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

	// 20문제로 셔플 및 제한
	rand.Seed(time.Now().UnixNano())
	if len(questions) > 20 {
		rand.Shuffle(len(questions), func(i, j int) {
			questions[i], questions[j] = questions[j], questions[i]
		})
		questions = questions[:20]
	}

	json.NewEncoder(w).Encode(questions)
}

// 공통 답안 채점 핸들러 (HTTP용)
func HandleBaseAnswers(userAnswers map[string]string, collection *mongo.Collection) ([]QuizResult, int) {
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
			Question:   question.Question,
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

// Lambda용 공통 문제 조회 헬퍼
func getBaseQuestions(collection interface{}) ([]BaseQuestion, error) {
	mongoCollection := collection.(*mongo.Collection)
	var questions []BaseQuestion
	
	cursor, err := mongoCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	if err = cursor.All(context.Background(), &questions); err != nil {
		return nil, err
	}

	// 20문제로 셔플 및 제한
	rand.Seed(time.Now().UnixNano())
	if len(questions) > 20 {
		rand.Shuffle(len(questions), func(i, j int) {
			questions[i], questions[j] = questions[j], questions[i]
		})
		questions = questions[:20]
	}

	return questions, nil
}

// Lambda용 PDF 형태 문제 조회 헬퍼
func getPdfQuestions(collection interface{}) ([]struct {
	ID             string `json:"id"`
	QuestionNumber int    `json:"question_number"`
}, error) {
	mongoCollection := collection.(*mongo.Collection)
	var questions []struct {
		ID             string `json:"id"`
		QuestionNumber int    `json:"question_number"`
	}

	cursor, err := mongoCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	if err = cursor.All(context.Background(), &questions); err != nil {
		return nil, err
	}

	return questions, nil
}