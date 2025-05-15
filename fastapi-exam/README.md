# FastAPI Exam Application

This project is a FastAPI application designed to handle various exam types, including NCA, AWS, Linux, and Network. It provides endpoints for retrieving questions and submitting answers, with data stored in a MongoDB database.

## Project Structure

```
fastapi-exam-app
├── app
│   ├── main.py               # Entry point of the FastAPI application
│   ├── api                   # Contains route handlers and dependencies
│   │   ├── __init__.py
│   │   ├── handlers.py       # Route handlers for different exam types
│   │   └── dependencies.py    # Dependency functions for route handlers
│   ├── models                # Contains Pydantic models for data validation
│   │   ├── __init__.py
│   │   └── schemas.py        # Defines request and response schemas
│   ├── db                    # Database connection and management
│   │   ├── __init__.py
│   │   └── mongo.py          # Functions to connect to MongoDB
│   └── utils                 # Utility functions
│       ├── __init__.py
│       └── common.py         # Common utility functions
├── Dockerfile                 # Dockerfile for building the application image
├── requirements.txt           # Lists dependencies for the application
└── README.md                  # Documentation for the project
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd fastapi-exam-app
   ```

2. **Create a virtual environment (optional but recommended):**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```
   uvicorn app.main:app --reload
   ```

5. **Access the API documentation:**
   Open your browser and navigate to `http://127.0.0.1:8000/docs` to view the interactive API documentation.

## Usage

- **Get Questions:**
  - Endpoint: `GET /{exam_type}/questions`
  - Example: `GET /nca/questions`

- **Submit Answers:**
  - Endpoint: `POST /{exam_type}/check`
  - Example: `POST /aws/check`
  - Request Body:
    ```json
    {
      "question_id_1": "user_answer_1",
      "question_id_2": "user_answer_2"
    }
    ```

## Docker

To build and run the application using Docker, use the following commands:

1. **Build the Docker image:**
   ```
   docker build -t fastapi-exam-app .
   ```

2. **Run the Docker container:**
   ```
   docker run -d -p 8000:8000 fastapi-exam-app
   ```

Now you can access the application at `http://localhost:8000`.

## License

This project is licensed under the MIT License. See the LICENSE file for details.