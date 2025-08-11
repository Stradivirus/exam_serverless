import json
import os
from database import get_collection
from nca import handle_nca_questions, handle_nca_answers
from awssaa import handle_awssaa_questions, handle_awssaa_answers
from awssysops import handle_awssysops_questions, handle_awssysops_answers
from linux import handle_linux_questions, handle_linux_answers
from network import handle_network_questions, handle_network_answers

def lambda_handler(event, context):
    print(f"Lambda Event: {json.dumps(event)}")
    
    # CORS 헤더
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    # OPTIONS 처리
    http_method = extract_method(event)
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # 경로 파싱
    raw_path = extract_path(event)
    path_parts = raw_path.strip('/').split('/')
    
    if len(path_parts) < 2:
        return error_response('Invalid path')
    
    exam_type = path_parts[0]
    action = path_parts[1]
    
    print(f"ExamType: {exam_type}, Action: {action}")
    
    # 라우팅
    try:
        if action == 'questions':
            return handle_questions(exam_type, path_parts, headers)
        elif action == 'check':
            body = extract_body(event)
            return handle_check(exam_type, path_parts, body, headers)
        else:
            return error_response('Invalid action')
    except Exception as e:
        print(f"Error: {e}")
        return error_response('Internal server error')

def extract_path(event):
    return event.get('rawPath', event.get('path', ''))

def extract_method(event):
    request_context = event.get('requestContext', {})
    if 'http' in request_context:
        return request_context['http'].get('method', 'GET')
    return event.get('httpMethod', 'GET')

def extract_body(event):
    return event.get('body', '')

def handle_questions(exam_type, path_parts, headers):
    print(f"Starting handle_questions for {exam_type}")
    
    try:
        print("Getting collection...")
        collection = get_collection(exam_type)
        print("Collection obtained successfully")
        
        if exam_type == 'nca':
            print("Handling NCA questions")
            questions = handle_nca_questions(collection)
        elif exam_type == 'awssaa':
            print("Handling AWS SAA questions")
            questions = handle_awssaa_questions(collection)
        elif exam_type == 'awssysops':
            print("Handling AWS SysOps questions")
            questions = handle_awssysops_questions(collection)
        elif exam_type == 'linux':
            if len(path_parts) < 3:
                return error_response('PDF number not specified')
            print("Handling Linux questions")
            questions = handle_linux_questions(collection)
        elif exam_type == 'network':
            if len(path_parts) < 3:
                return error_response('Exam date not specified')
            print("Handling Network questions")
            questions = handle_network_questions(collection)
        else:
            return error_response('Invalid exam type')
        
        print(f"Questions prepared: {len(questions)}")
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(questions)
        }
        
    except Exception as e:
        print(f"Error in handle_questions: {e}")
        return error_response(f"Error: {str(e)}")

def handle_check(exam_type, path_parts, body, headers):
    try:
        user_answers = json.loads(body)
    except:
        return error_response('Error parsing answers')
    
    collection = get_collection(exam_type)
    
    if exam_type == 'nca':
        results, score = handle_nca_answers(user_answers, collection)
    elif exam_type == 'awssaa':
        results, score = handle_awssaa_answers(user_answers, collection)
    elif exam_type == 'awssysops':
        results, score = handle_awssysops_answers(user_answers, collection)
    elif exam_type == 'linux':
        if len(path_parts) < 3:
            return error_response('PDF number required')
        pdf_number = path_parts[2]
        results, score = handle_linux_answers(user_answers, collection, pdf_number)
    elif exam_type == 'network':
        if len(path_parts) < 3:
            return error_response('Exam date required')
        exam_date = path_parts[2]
        results, score = handle_network_answers(user_answers, collection, exam_date)
    else:
        return error_response('Invalid exam type')
    
    response = {
        'results': results,
        'score': score,
        'total': len(user_answers)
    }
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(response)
    }

def error_response(msg):
    return {
        'statusCode': 500,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'error': msg})
    }
