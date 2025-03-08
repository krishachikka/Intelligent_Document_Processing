from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from docx import Document
import PyPDF2
from PIL import Image
import pytesseract
import io

app = Flask(__name__)
CORS(app)  # To allow cross-origin requests from the frontend (React)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'jpeg', 'png'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Function to extract text from PDF
def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()
    return text


# Function to extract text from DOCX
def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = ''
    for para in doc.paragraphs:
        text += para.text + '\n'
    return text


# Function to extract text from images (JPG, JPEG, PNG)
def extract_text_from_image(file_path):
    image = Image.open(file_path)
    text = pytesseract.image_to_string(image)
    return text


# Endpoint to handle file upload and document processing
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)

        # Extract document info based on file type
        doc_info = {}
        if filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(filename)
            doc_info['format'] = 'PDF'
        elif filename.lower().endswith('.docx'):
            text = extract_text_from_docx(filename)
            doc_info['format'] = 'DOCX'
        elif filename.lower().endswith(('jpg', 'jpeg', 'png')):
            text = extract_text_from_image(filename)
            doc_info['format'] = 'Image'

        # Extract document details
        doc_info['fontSize'] = 'N/A'  # This is a simplified version, extracting font size requires more logic
        doc_info['numParagraphs'] = text.count('\n')
        doc_info['textSnippet'] = text[:200]  # Taking first 200 characters as a snippet

        return jsonify(doc_info)

    return jsonify({'error': 'File type not allowed'}), 400


if __name__ == '__main__':
    app.run(debug=True)
