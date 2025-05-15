from pydantic import BaseModel
from typing import List, Dict, Optional

class BaseQuestion(BaseModel):
    id: str
    question: str
    choice_a: str
    choice_b: str
    choice_c: str
    choice_d: str
    correct_answer: str

class QuizResult(BaseModel):
    question_id: str
    question: str
    choices: Dict[str, str]
    question_number: Optional[int] = None
    user_answer: str
    correct_answer: str
    is_correct: bool

class QuizResponse(BaseModel):
    results: List[QuizResult]
    score: int
    total: int