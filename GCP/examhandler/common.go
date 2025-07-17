package examhandler

import (
   "context"
   "log"
   "net/http"
   "os"

   "go.mongodb.org/mongo-driver/mongo"
   "go.mongodb.org/mongo-driver/mongo/options"
)

var examCollections = map[string]string{
	"nca":       "NCA_100",
	"awssaa":    "Aws_sa",
	"awssysops": "Aws_sysops",
	"linux":     "linux_1",
	"network":   "network_2",
}

func connectToDatabase() (*mongo.Client, error) {
   uri := os.Getenv("MONGODB_URI")
   if uri == "" {
	   log.Printf("MONGODB_URI 환경 변수가 설정되지 않았습니다.")
	   return nil, nil
   }
   client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
   if err != nil {
	   log.Printf("DB 연결 실패: %v", err)
	   return nil, err
   }
   return client, nil
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
}

func getCollectionName(examType string) string {
	if collectionName, exists := examCollections[examType]; exists {
		return collectionName
	}
	return "NCA_100"
}

func getCollection(examType string) (*mongo.Collection, *mongo.Client, error) {
	client, err := connectToDatabase()
	if err != nil {
		return nil, nil, err
	}
	collectionName := getCollectionName(examType)
	collection := client.Database("exam").Collection(collectionName)
	return collection, client, nil
}

func sendError(w http.ResponseWriter, msg string, code int) {
	http.Error(w, msg, code)
}

func handleOptions(w http.ResponseWriter) {
	setCORSHeaders(w)
	w.WriteHeader(http.StatusOK)
}
