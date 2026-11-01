import random
from bson import ObjectId

def get_base_questions(collection, sample_size=20):
    """
    MongoDB $sample 집계 파이프라인을 사용해 DB 단에서 바로 20문제를 랜덤 추출합니다.
    (전체 컬렉션 풀스캔 및 네트워크 전송량 최소화)
    """
    try:
        questions = list(collection.aggregate([{'$sample': {'size': sample_size}}]))
    except Exception:
        questions = list(collection.find())
        if len(questions) > sample_size:
            random.shuffle(questions)
            questions = questions[:sample_size]

    for q in questions:
        q['id'] = str(q['_id'])
        del q['_id']
        if 'correct_answer' in q:
            del q['correct_answer']

    return questions


def handle_base_answers(user_answers, collection):
    """
    기존 N+1 쿼리(20번의 개별 find_one 호출)를 $in 배치 쿼리 1회로 최적화합니다.
    """
    results = []
    score = 0

    if not user_answers:
        return results, score

    valid_pairs = []
    object_ids = []
    for q_id, user_ans in user_answers.items():
        try:
            oid = ObjectId(q_id)
            valid_pairs.append((q_id, oid, user_ans))
            object_ids.append(oid)
        except Exception:
            continue

    if not object_ids:
        return results, score

    # 단 1회의 배치 쿼리로 모든 문제 조회
    docs = list(collection.find({'_id': {'$in': object_ids}}))
    question_map = {doc['_id']: doc for doc in docs}

    for q_id, oid, user_ans in valid_pairs:
        question = question_map.get(oid)
        if not question:
            continue

        correct_ans = question.get('correct_answer')
        is_correct = (user_ans == correct_ans)
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
            'correct_answer': correct_ans,
            'is_correct': is_correct
        })

    return results, score


def get_pdf_questions(collection):
    questions = list(collection.find({}, {'question_number': 1}).sort('question_number', 1))

    result = []
    for q in questions:
        result.append({
            'id': str(q['_id']),
            'question_number': q.get('question_number')
        })

    return result

