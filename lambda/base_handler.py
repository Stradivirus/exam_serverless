import random
from bson import ObjectId

def get_base_questions(collection):
    questions = list(collection.find())
    
    # ObjectId를 문자열로 변환하고 정답 제거
    for q in questions:
        q['id'] = str(q['_id'])
        del q['_id']
        if 'correct_answer' in q:
            del q['correct_answer']
    
    # 20문제로 셔플
    if len(questions) > 20:
        random.shuffle(questions)
        questions = questions[:20]
    
    return questions

def handle_base_answers(user_answers, collection):
    results = []
    score = 0
    
    for q_id, user_ans in user_answers.items():
        try:
            object_id = ObjectId(q_id)
        except:
            continue
        
        question = collection.find_one({'_id': object_id})
        if not question:
            continue
        
        is_correct = user_ans == question.get('correct_answer')
        if is_correct:
            score += 1
        
        results.append({
            'question_id': q_id,
            'question': question.get('question'),
            'choices': {
                'A': question.get('choice_a'),
                'B': question.get('choice_b'),
                'C': question.get('choice_c'),
                'D': question.get('choice_d')
            },
            'user_answer': user_ans,
            'correct_answer': question.get('correct_answer'),
            'is_correct': is_correct
        })
    
    return results, score

def get_pdf_questions(collection):
    questions = list(collection.find())
    
    result = []
    for q in questions:
        result.append({
            'id': str(q['_id']),
            'question_number': q.get('question_number')
        })
    
    return result
