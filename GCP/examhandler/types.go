// types.go
package examhandler

import (
    "go.mongodb.org/mongo-driver/bson/primitive"
)

// BaseQuestion 공통 문제 구조체
type BaseQuestion struct {
    ID            primitive.ObjectID `bson:"_id" json:"-"`
    IDString      string            `json:"id"`
    Question      string            `bson:"question" json:"question"`
    ChoiceA       string            `bson:"choice_a" json:"choice_a"`
    ChoiceB       string            `bson:"choice_b" json:"choice_b"`
    ChoiceC       string            `bson:"choice_c" json:"choice_c"`
    ChoiceD       string            `bson:"choice_d" json:"choice_d"`
    CorrectAnswer string            `bson:"correct_answer" json:"-"`
}

// NCA와 AWS는 BaseQuestion을 사용하도록 type alias 설정
type NCAQuestion = BaseQuestion
type AWSQuestion = BaseQuestion
type NCPQuestion = BaseQuestion

// Linux 시험용 구조체
type LinuxQuestion struct {
    ID              primitive.ObjectID `bson:"_id" json:"id"`
    QuestionNumber  int               `bson:"question_number" json:"question_number"`
    Answers         struct {
        PDF1 int    `bson:"pdf1" json:"-"`
        PDF2 int    `bson:"pdf2" json:"-"`
        PDF3 int    `bson:"pdf3" json:"-"`
        PDF4 int    `bson:"pdf4" json:"-"`
    }               `bson:"answers" json:"-"`
}

// Network 시험용 구조체 추가
type NetworkQuestion struct {
    ID             primitive.ObjectID `bson:"_id" json:"id"`
    QuestionNumber int               `bson:"question_number" json:"question_number"`
    Answers        struct {
        Answer20240825 int `bson:"20240825" json:"-"` // 4회
        Answer20240519 int `bson:"20240519" json:"-"` // 3.3회
        Answer20240225 int `bson:"20240225" json:"-"` // 3.2회
        Answer20231105 int `bson:"20231105" json:"-"` // 3.1회
        Answer20230820 int `bson:"20230820" json:"-"` // 3회
        Answer20230521 int `bson:"20230521" json:"-"` // 2회
        Answer20230226 int `bson:"20230226" json:"-"` // 1회
    } `bson:"answers" json:"-"`
}

// 퀴즈 결과 구조체
type QuizResult struct {
    QuestionID    string            `json:"question_id"`
    Question      string            `json:"question"`
    Choices       map[string]string `json:"choices,omitempty"`
    QuestionNumber int              `json:"question_number,omitempty"`
    UserAnswer    string            `json:"user_answer"`
    CorrectAnswer string            `json:"correct_answer"`
    IsCorrect     bool             `json:"is_correct"`
}

// 퀴즈 응답 구조체
type QuizResponse struct {
    Results []QuizResult `json:"results"`
    Score   int         `json:"score"`
    Total   int         `json:"total"`
}