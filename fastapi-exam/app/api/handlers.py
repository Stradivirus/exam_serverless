from fastapi import APIRouter, HTTPException
from typing import List, Dict
from app.models.schemas import QuizResult, QuizResponse
from app.db.mongo import get_collection

router = APIRouter()

@router.get("/nca/questions", response_model=List[Dict])
async def get_nca_questions():
    collection = get_collection("nca")
    questions = await collection.find({}).to_list(length=20)
    return questions

@router.post("/nca/check", response_model=QuizResponse)
async def check_nca_answers(user_answers: Dict[str, str]):
    collection = get_collection("nca")
    results, score = await handle_base_answers(user_answers, collection)
    return QuizResponse(results=results, score=score, total=len(user_answers))

@router.get("/aws/questions", response_model=List[Dict])
async def get_aws_questions():
    collection = get_collection("aws")
    questions = await collection.find({}).to_list(length=20)
    return questions

@router.post("/aws/check", response_model=QuizResponse)
async def check_aws_answers(user_answers: Dict[str, str]):
    collection = get_collection("aws")
    results, score = await handle_base_answers(user_answers, collection)
    return QuizResponse(results=results, score=score, total=len(user_answers))

@router.get("/linux/questions/{pdf_number}", response_model=List[Dict])
async def get_linux_questions(pdf_number: str):
    collection = get_collection("linux")
    questions = await collection.find({"pdf_number": pdf_number}).to_list(length=20)
    return questions

@router.post("/linux/check/{pdf_number}", response_model=QuizResponse)
async def check_linux_answers(pdf_number: str, user_answers: Dict[str, str]):
    collection = get_collection("linux")
    results, score = await handle_pdf_answers(user_answers, collection, pdf_number)
    return QuizResponse(results=results, score=score, total=len(user_answers))

@router.get("/network/questions/{exam_date}", response_model=List[Dict])
async def get_network_questions(exam_date: str):
    collection = get_collection("network")
    questions = await collection.find({"exam_date": exam_date}).to_list(length=20)
    return questions

@router.post("/network/check/{exam_date}", response_model=QuizResponse)
async def check_network_answers(exam_date: str, user_answers: Dict[str, str]):
    collection = get_collection("network")
    results, score = await handle_network_answers(user_answers, collection, exam_date)
    return QuizResponse(results=results, score=score, total=len(user_answers))