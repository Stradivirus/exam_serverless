from fastapi import Depends
from motor import MongoClient
from app.db.mongo import get_database

def get_collection(exam_type: str):
    db = get_database()
    collection_name = get_collection_name(exam_type)
    return db[collection_name]

def get_collection_name(exam_type: str) -> str:
    exam_collections = {
        "nca": "NCA_100",
        "aws": "Aws_sa",
        "linux": "linux_1",
        "network": "network_2",
    }
    return exam_collections.get(exam_type, "NCA_100")  # Default to NCA_100 if not found

def get_db_client() -> MongoClient:
    client = MongoClient("mongodb+srv://stradivirus:1q2w3e4r@cluster0.e7rvfpz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    return client