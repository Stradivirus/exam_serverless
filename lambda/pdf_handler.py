def handle_pdf_answers(user_answers, collection, pdf_version, get_answer_func):
    results = []
    score = 0
    
    for question_number_str, user_answer in user_answers.items():
        try:
            question_number = int(question_number_str)
        except:
            continue
        
        question = collection.find_one({'question_number': question_number})
        if not question:
            continue
        
        correct_answer, ok = get_answer_func(question, pdf_version)
        if not ok:
            continue
        
        try:
            user_answer_int = int(user_answer)
        except:
            continue
        
        is_correct = user_answer_int == correct_answer
        if is_correct:
            score += 1
        
        results.append({
            'question_id': question_number_str,
            'question_number': question_number,
            'user_answer': user_answer,
            'correct_answer': str(correct_answer),
            'is_correct': is_correct
        })
    
    return results, score
