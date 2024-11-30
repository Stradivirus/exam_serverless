import json
import re

def parse_question_with_answer(block):
    """
    Parse a block of question text and return a structured dictionary in NCA format.
    """
    try:
        lines = block.strip().split("\n")
        if len(lines) < 4:  # 질문, 보기들, 정답 최소 필요
            raise ValueError(f"Incomplete question block: {block}")
        
        # Get question number and text
        question_match = re.match(r'(Q\d+)\.\s+(.+)', lines[0])
        if not question_match:
            raise ValueError(f"Invalid question format: {lines[0]}")
        
        question_number = question_match.group(1)  # Q223과 같은 형식으로 저장
        question = f"{question_number}. {question_match.group(2).strip()}"
        current_line = 1
        
        # 질문이 여러 줄인 경우 처리
        while current_line < len(lines) and not lines[current_line].startswith('A.'):
            if lines[current_line].strip():
                question += " " + lines[current_line].strip()
            current_line += 1
        
        # Parse options and answer
        options = []
        answer = None
        
        for line in lines[current_line:]:
            option_match = re.match(r'^([A-D])\.\s+(.+)', line)
            if option_match:
                options.append(option_match.group(2).strip())
            elif line.startswith('정답:'):
                # 정답에서 알파벳만 추출
                answer_match = re.search(r'[A-D]', line)
                if answer_match:
                    answer = answer_match.group()
                else:
                    raise ValueError(f"Invalid answer format: {line}")
        
        if len(options) != 4:
            raise ValueError(f"Expected 4 options, got {len(options)} in block: {block}")
        if not answer:
            raise ValueError(f"Missing answer in block: {block}")
        
        # Convert to NCA format
        return {
            "question": question,
            "choice_a": options[0],
            "choice_b": options[1],
            "choice_c": options[2],
            "choice_d": options[3],
            "correct_answer": answer  # Now this will be just 'A', 'B', 'C', or 'D'
        }
    
    except Exception as e:
        print(f"Error parsing block:\n{block}\nError: {e}")
        return None

def txt_to_json_aws_questions(input_file: str, output_file: str):
    """
    Convert a structured .txt file to a JSON file with AWS questions in NCA format.
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Split by Q number pattern
        blocks = re.split(r'\n\n(?=Q\d+\.)', content.strip())
        if not blocks:
            raise ValueError("Input file is empty or has no valid question blocks.")
        
        questions = []
        for block in blocks:
            if block.strip():  # 빈 블록 무시
                parsed_question = parse_question_with_answer(block)
                if parsed_question:
                    questions.append(parsed_question)

        # Save as JSON
        with open(output_file, 'w', encoding='utf-8') as json_file:
            json.dump({"questions": questions}, json_file, ensure_ascii=False, indent=4)

        print(f"Successfully converted {len(questions)} questions to NCA format in '{output_file}'")
    
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
if __name__ == "__main__":
    input_file = "aws1-1.txt"
    output_file = "aws_1-1.json"
    txt_to_json_aws_questions(input_file, output_file)