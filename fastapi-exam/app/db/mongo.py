from motor import MongoClient
from fastapi import HTTPException

MONGO_URI = "mongodb+srv://stradivirus:1q2w3e4r@cluster0.e7rvfpz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "exam"

client = MongoClient(MONGO_URI)

def get_collection(exam_type: str):
    collection_name = get_collection_name(exam_type)
    return client[DATABASE_NAME][collection_name]

def get_collection_name(exam_type: str) -> str:
    exam_collections = {
        "nca": "NCA_100",
        "aws": "Aws_sa",
        "linux": "linux_1",
        "network": "network_2",
    }
    return exam_collections.get(exam_type, "NCA_100")