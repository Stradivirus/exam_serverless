import os
from pymongo import MongoClient

EXAM_COLLECTIONS = {
    'nca': 'NCA_100',
    'awssaa': 'Aws_sa',
    'awssysops': 'Aws_sysops',
    'linux': 'linux_1',
    'network': 'network_2'
}

def get_mongo_client():
    uri = os.environ.get('MONGODB_URI')
    return MongoClient(uri)

def get_collection(exam_type):
    collection_name = EXAM_COLLECTIONS.get(exam_type, 'NCA_100')
    client = get_mongo_client()
    db = client.exam
    return db[collection_name]
