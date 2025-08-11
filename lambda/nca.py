from base_handler import get_base_questions, handle_base_answers

def handle_nca_questions(collection):
    return get_base_questions(collection)

def handle_nca_answers(user_answers, collection):
    return handle_base_answers(user_answers, collection)
