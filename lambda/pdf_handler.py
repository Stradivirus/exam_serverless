def handle_pdf_answers(user_answers, collection, pdf_version, get_answer_func):
    """
    기존 50~100회 반복 호출되던 find_one(N+1 쿼리)을 $in 단일 배치 쿼리로 최적화합니다.
    """
    results = []
    score = 0

    if not user_answers:
        return results, score

    parsed_submissions = []
    question_numbers = []

    for question_number_str, user_answer in user_answers.items():
        try:
            q_num = int(question_number_str)
            u_ans_int = int(user_answer)
            parsed_submissions.append((question_number_str, q_num, user_answer, u_ans_int))
            question_numbers.append(q_num)
        except Exception:
            continue

    if not question_numbers:
        return results, score

    # 단 1회의 배치 쿼리로 제출된 모든 문항 번호의 정답 데이터를 한 번에 조회
    docs = list(collection.find({'question_number': {'$in': question_numbers}}))
    question_map = {doc.get('question_number'): doc for doc in docs}

    for question_number_str, q_num, user_answer_str, user_answer_int in parsed_submissions:
        question = question_map.get(q_num)
        if not question:
            continue

        correct_answer, ok = get_answer_func(question, pdf_version)
        if not ok:
            continue

        is_correct = (user_answer_int == correct_answer)
        if is_correct:
            score += 1

        results.append({
            'question_id': question_number_str,
            'question_number': q_num,
            'user_answer': user_answer_str,
            'correct_answer': str(correct_answer),
            'is_correct': is_correct
        })

    # 문항 번호 오름차순 정렬
    results.sort(key=lambda r: r['question_number'])
    return results, score

