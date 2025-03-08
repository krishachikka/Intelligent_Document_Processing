from flask import Flask, request, jsonify
import hashlib
import PyPDF2
from PIL import Image
import pytesseract
import os

app = Flask(__name__)

# Function to calculate file hash (SHA-256)
def calculate_file_hash(file_path):
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

# Function to extract PDF text and metadata
def extract_pdf_metadata_and_text(pdf_path):
    with open(pdf_path, 'rb') as f:
        pdf_reader = PyPDF2.PdfReader(f)
        metadata = pdf_reader.metadata
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
    return metadata, text

# Function to extract text from an image using OCR
def extract_text_from_image(image_path):
    text = pytesseract.image_to_string(Image.open(image_path))
    return text

# Route to handle document verification
@app.route('/verify', methods=['POST'])
def verify_document():
    if 'file' not in request.files:
        return jsonify({"is_modified": False, "cause": "No file uploaded."}), 400
    
    file = request.files['file']
    
    # Save the file temporarily
    file_path = os.path.join("uploads", file.filename)
    file.save(file_path)
    
    original_text = "This is the original text from the authentic document."  # Example of original text

    # Verify the document based on its type
    is_modified = False
    cause = ""
    
    if file.filename.lower().endswith('.pdf'):
        metadata, extracted_text = extract_pdf_metadata_and_text(file_path)
        
        # Compare the extracted text with the original
        if extracted_text.strip() != original_text.strip():
            is_modified = True
            cause = "Text content has been altered."
        
    elif file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        extracted_text = extract_text_from_image(file_path)
        
        # Compare the extracted text with the original
        if extracted_text.strip() != original_text.strip():
            is_modified = True
            cause = "Text content has been altered."
    
    # Clean up: remove the uploaded file
    os.remove(file_path)
    
    return jsonify({"is_modified": is_modified, "cause": cause})

if __name__ == '__main__':
    app.run(debug=True)
