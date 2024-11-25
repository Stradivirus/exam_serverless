// common.go
package examhandler

import (
    "context"
    "net/http"
    "fmt"
    
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

// 시험 타입과 컬렉션 이름 매핑
var examCollections = map[string]string{
    "nca": "NCA_100",
    "aws": "Aws_sa",
    "linux": "linux_1",
}

// MongoDB 연결 설정
func connectToDatabase() (*mongo.Client, error) {
    uri := "mongodb+srv://stradivirus:1q2w3e4r@cluster0.e7rvfpz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
    if err != nil {
        return nil, err
    }
    return client, nil
}

// CORS 헤더 설정
func setCORSHeaders(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    w.Header().Set("Content-Type", "application/json")
}

// 컬렉션 이름 결정
func getCollectionName(examType string) string {
    fmt.Printf("Getting collection for exam type: %s\n", examType)
    
    if collectionName, exists := examCollections[examType]; exists {
        return collectionName
    }
    return "NCA_100"  // 기본값
}

// 데이터베이스 연결 및 컬렉션 가져오기 헬퍼 함수
func getCollection(examType string) (*mongo.Collection, *mongo.Client, error) {
    client, err := connectToDatabase()
    if err != nil {
        fmt.Printf("Database connection error: %v\n", err)
        return nil, nil, err
    }
    
    collectionName := getCollectionName(examType)
    fmt.Printf("Using collection name: %s\n", collectionName)
    
    collection := client.Database("exam").Collection(collectionName)
    return collection, client, nil
}

// 에러 응답 헬퍼 함수
func sendError(w http.ResponseWriter, msg string, code int) {
    http.Error(w, msg, code)
}

// OPTIONS 요청 처리
func handleOptions(w http.ResponseWriter) {
    setCORSHeaders(w)
    w.WriteHeader(http.StatusOK)
}