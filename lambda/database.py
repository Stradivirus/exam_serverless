import os
from pymongo import MongoClient

EXAM_COLLECTIONS = {
    'nca': 'NCA_100',
    'awssaa': 'Aws_sa',
    'awssysops': 'Aws_sysops',
    'linux': 'linux_1',
    'network': 'network_2'
}

# Lambda 실행 컨텍스트(Warm Start) 간 MongoDB 커넥션 풀 재사용을 위한 전역 싱글톤
_mongo_client = None

def get_mongo_client():
    global _mongo_client
    if _mongo_client is None:
        uri = os.environ.get('MONGODB_URI')
        _mongo_client = MongoClient(
            uri,
            maxPoolSize=10,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
    return _mongo_client

def get_collection(exam_type):
    collection_name = EXAM_COLLECTIONS.get(exam_type, 'NCA_100')
    client = get_mongo_client()
    db = client.exam
    return db[collection_name]

