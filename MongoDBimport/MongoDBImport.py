from pymongo import MongoClient
import json

def import_questions(json_file_path, collection_name):
    """
    JSON 파일의 문제를 지정된 컬렉션에 import
    
    Parameters:
    json_file_path (str): JSON 파일 경로
    collection_name (str): 컬렉션 이름
    """
    try:
        # MongoDB Atlas 연결
        connection_string = "mongodb+srv://stradivirus:1q2w3e4r@cluster0.e7rvfpz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        client = MongoClient(connection_string)
        
        # exam 데이터베이스 선택
        db = client['exam']
        collection = db[collection_name]
        
        # 중복 체크
        if collection.count_documents({}) > 0:
            print(f"'{collection_name}' 컬렉션에 이미 데이터가 존재합니다.")
            choice = input("계속 진행하시겠습니까? (y/n): ")
            if choice.lower() != 'y':
                print("작업이 취소되었습니다.")
                return
        
        # JSON 파일 읽기
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
        # questions 키가 있는 경우 해당 배열을 사용, 아니면 전체 데이터를 사용
        questions = data.get('questions', data)
        
        if not isinstance(questions, list):
            questions = [questions]
            
        # 데이터 삽입
        result = collection.insert_many(questions)
        print(f"{len(result.inserted_ids)}개의 문제가 {collection_name} 컬렉션에 입력되었습니다.")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")
    
    finally:
        client.close()

if __name__ == "__main__":
    file_path = input("JSON 파일 경로를 입력하세요: ").strip()
    collection_name = input("컬렉션 이름을 입력하세요: ").strip()
    
    import_questions(file_path, collection_name)