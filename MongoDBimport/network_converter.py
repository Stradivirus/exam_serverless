import csv
import json
from pymongo import MongoClient

def csv_to_json(csv_file_path):
    """
    CSV 파일을 JSON 형식으로 변환
    """
    questions = []
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        
        for row in csv_reader:
            if len(row) >= 8:  # 최소 8개의 열이 있는지 확인
                # CSV 첫번째 열에서 문제 번호 추출
                question_number = int(row[0])
                
                question = {
                    "question_number": question_number,
                    "answers": {
                        "20240825": int(row[1]),  # 4회
                        "20240519": int(row[2]),  # 3.3회
                        "20240225": int(row[3]),  # 3.2회
                        "20231105": int(row[4]),  # 3.1회
                        "20230820": int(row[5]),  # 3회
                        "20230521": int(row[6]),  # 2회
                        "20230226": int(row[7])   # 1회
                    }
                }
                questions.append(question)

    return questions

def import_to_mongodb(questions):
    """
    변환된 데이터를 MongoDB에 import
    """
    try:
        connection_string = "mongodb+srv://stradivirus:1q2w3e4r@cluster0.e7rvfpz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        client = MongoClient(connection_string)
        
        db = client['exam']
        collection = db['network_2']
        
        # 기존 데이터 확인
        if collection.count_documents({}) > 0:
            print("'network_2' 컬렉션에 이미 데이터가 존재합니다.")
            choice = input("기존 데이터를 삭제하고 계속하시겠습니까? (y/n): ")
            if choice.lower() == 'y':
                collection.delete_many({})
            else:
                print("작업이 취소되었습니다.")
                return

        # 데이터 삽입
        result = collection.insert_many(questions)
        print(f"{len(result.inserted_ids)}개의 문제가 network_2 컬렉션에 입력되었습니다.")
        
        # 인덱스 생성
        collection.create_index("question_number")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    csv_file_path = "network.csv"
    
    # CSV를 JSON으로 변환
    questions = csv_to_json(csv_file_path)
    
    # MongoDB에 import
    import_to_mongodb(questions)