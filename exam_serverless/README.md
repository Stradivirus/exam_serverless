# Exam Serverless Project

This project is a serverless application designed to handle various quiz types, including AWS, NCA, Linux, and Network exams. It utilizes MongoDB for data storage and provides a RESTful API for interacting with quiz questions and answers.

## Project Structure

```
exam_serverless
├── GCP
│   ├── aws.go
│   ├── common.go
│   ├── handler.go
│   ├── linux.go
│   ├── nca.go
│   ├── network.go
│   ├── pdf_handler.go
│   ├── txt_handler.go
│   ├── types.go
│   └── go.mod
├── Dockerfile
└── README.md
```

## Files Overview

- **GCP/aws.go**: Contains functions for handling AWS-related quiz questions and answers using a MongoDB collection.
- **GCP/common.go**: Includes utility functions for database connection, CORS header setup, and error handling. Maps exam types to MongoDB collection names.
- **GCP/handler.go**: Defines the `ExamHandler` function which processes incoming HTTP requests and routes them based on exam type and action.
- **GCP/linux.go**: Manages Linux-related quiz questions and answers, utilizing PDF versions for answer checking.
- **GCP/nca.go**: Handles NCA-related quiz questions and answers.
- **GCP/network.go**: Manages network-related quiz questions and answers, checking answers based on exam dates.
- **GCP/pdf_handler.go**: Handles PDF-related quiz questions and answers using a custom answer checker function.
- **GCP/txt_handler.go**: Provides common logic for handling quiz questions and answers.
- **GCP/types.go**: Defines data structures used throughout the project to represent quiz questions and results.
- **GCP/go.mod**: Module definition for the Go project, specifying the module path and required dependencies.
- **Dockerfile**: Used to build a Docker image for the project, setting up the Go environment and specifying the command to run the application.

## Setup Instructions

1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd exam_serverless
   ```

2. **Install Dependencies**: 
   Ensure you have Go installed, then run:
   ```
   go mod tidy
   ```

3. **Run the Application**: 
   You can run the application locally using:
   ```
   go run GCP/handler.go
   ```

4. **Docker Setup**: 
   To build and run the Docker image, use the following commands:
   ```
   docker build -t exam_serverless .
   docker run -p 8080:8080 exam_serverless
   ```

## Usage

- The API supports various endpoints for fetching questions and checking answers based on the exam type.
- Use HTTP GET requests to retrieve questions and POST requests to submit answers.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.