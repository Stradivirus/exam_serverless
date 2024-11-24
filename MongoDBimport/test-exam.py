import json
import re

def parse_question_block(block):
    """
    Parse a block of question text and convert to Django model compatible format
    """
    lines = block.strip().split("\n")
    question = lines[0].split(". ", 1)[1]
    options = []
    for line in lines[1:]:
        match = re.match(r"^\d+\)\s(.+)", line)
        if match:
            options.append(match.group(1))
        elif line.startswith("답 :"):
            answer_text = line.split("답 :", 1)[1].strip()
            break
    
    # Find the index of the answer in options to determine A,B,C,D
    answer_index = options.index(answer_text)
    answer_letter = chr(65 + answer_index)  # Convert 0,1,2,3 to A,B,C,D
    
    return {
        "question": question,
        "choice_a": options[0],
        "choice_b": options[1],
        "choice_c": options[2],
        "choice_d": options[3],
        "correct_answer": answer_letter
    }

def txt_to_json_questions(input_file: str, output_file: str):
    """
    Convert a structured .txt file to a JSON file compatible with Django model
    
    Args:
        input_file (str): Path to the input .txt file
        output_file (str): Path to save the output .json file
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Split by double newlines to separate question blocks
        blocks = content.strip().split("\n\n")
        questions = [parse_question_block(block) for block in blocks]

        # Save as JSON
        with open(output_file, 'w', encoding='utf-8') as json_file:
            json.dump({"questions": questions}, json_file, ensure_ascii=False, indent=4)

        print(f"JSON conversion successful. Output saved to '{output_file}'")
    
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
txt_to_json_questions("nca.txt", "nca.json")