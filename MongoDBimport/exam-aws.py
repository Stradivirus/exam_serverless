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
        
        # Get question text
        question = lines[0].strip()
        if len(lines[1].strip()) > 0:  # 질문이 두 줄인 경우
            question = f"{question} {lines[1].strip()}"
        
        # Parse options and answer
        options = []
        answer = None
        for line in lines[2:]:
            option_match = re.match(r"^[A-D]\.\s(.+)", line)
            if option_match:
                options.append(option_match.group(1).strip())
            elif line.startswith("정답:"):
                answer = line.split("정답:", 1)[1].strip()
                break
        
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
            "correct_answer": answer  # Already in A, B, C, D format
        }
    
    except Exception as e:
        print(f"Error parsing block:\n{block}\nError: {e}")
        return None

def txt_to_json_aws_questions(input_file: str, output_file: str):
    """
    Convert a structured .txt file to a JSON file with AWS questions in NCA format.
    
    Args:
        input_file (str): Path to the input .txt file.
        output_file (str): Path to save the output .json file.
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Split by double newlines to separate question blocks
        blocks = content.strip().split("\n\n")
        if not blocks:
            raise ValueError("Input file is empty or has no valid question blocks.")
        
        questions = []
        for block in blocks:
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
    input_file = "Aws1.txt"
    output_file = "aws_questions_nca_format.json"
    txt_to_json_aws_questions(input_file, output_file)