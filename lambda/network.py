from base_handler import get_pdf_questions
from pdf_handler import handle_pdf_answers

def handle_network_questions(collection):
    return get_pdf_questions(collection)

def handle_network_answers(user_answers, collection, exam_date):
    def get_answer(question, date):
        answers = question.get('answers', {})
        answer_map = {
            '20240825': answers.get('20240825'),
            '20240519': answers.get('20240519'),
            '20240225': answers.get('20240225'),
            '20231105': answers.get('20231105'),
            '20230820': answers.get('20230820'),
            '20230521': answers.get('20230521'),
            '20230226': answers.get('20230226')
        }
        answer = answer_map.get(date)
        return answer, answer is not None
    
    return handle_pdf_answers(user_answers, collection, exam_date, get_answer)
