from base_handler import get_pdf_questions
from pdf_handler import handle_pdf_answers

def handle_linux_questions(collection):
    return get_pdf_questions(collection)

def handle_linux_answers(user_answers, collection, pdf_number):
    def get_answer(question, pdf_version):
        answers = question.get('answers', {})
        answer_map = {
            'pdf1': answers.get('pdf1'),
            'pdf2': answers.get('pdf2'),
            'pdf3': answers.get('pdf3'),
            'pdf4': answers.get('pdf4')
        }
        answer = answer_map.get(pdf_version)
        return answer, answer is not None
    
    return handle_pdf_answers(user_answers, collection, pdf_number, get_answer)
