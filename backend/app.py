# python-backend/app.py

import os
import io
import docx
import openai
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from flask import Flask, request, jsonify

# Load environment variables from .env
load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)

def read_pdf(file_bytes) -> str:
    """Reads PDF file bytes and returns extracted text."""
    pdf_reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text

def read_docx(file_bytes) -> str:
    """Reads DOCX file bytes and returns extracted text."""
    document = docx.Document(io.BytesIO(file_bytes))
    text = []
    for paragraph in document.paragraphs:
        text.append(paragraph.text)
    return "\n".join(text)

def analyze_with_openai(text: str) -> str:
    """
    Calls the OpenAI ChatCompletion API with the provided text,
    and returns the AI's response.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Read the following document and extract a list of "
                        "assignments, tests, midterms, and final exams, including "
                        "the name, due date, and weight (if available). Display a "
                        "check list in chronological order based on due dates. "
                        "Here is the document text:\n\n" + text
                    ),
                },
            ],
            max_tokens=1000,
        )

        return response['choices'][0]['message']['content'].strip()
    except Exception as e:
        print(f"OpenAI API error: {e}")
        raise

@app.route('/api/analyze', methods=['POST'])
def analyze_file():
    """
    Receives a multipart/form-data request with a file (PDF or DOCX).
    Extracts text, calls OpenAI, and returns JSON response.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filename = file.filename.lower()

    if not openai.api_key:
        return jsonify({"error": "OpenAI API key not set"}), 500

    try:
        file_bytes = file.read()

        # Decide how to parse
        if filename.endswith(".pdf"):
            text = read_pdf(file_bytes)
        elif filename.endswith(".docx") or filename.endswith(".doc"):
            text = read_docx(file_bytes)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        # Call OpenAI
        analysis_result = analyze_with_openai(text)
        return jsonify({"analysis": analysis_result}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to analyze file"}), 500

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(host='0.0.0.0', port=5001, debug=True)
