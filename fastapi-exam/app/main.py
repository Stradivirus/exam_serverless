from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.handlers import router as exam_router

app = FastAPI()

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://138.2.63.26,"
    "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the exam routes
app.include_router(exam_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI Exam Application!"}