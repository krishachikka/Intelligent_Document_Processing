import json
from flask import Flask, request, jsonify
from pyzbar.pyzbar import decode
from PIL import Image
import io
from flask_cors import CORS  # Import CORS

app = Flask(__name__)

# Enable CORS for the entire app
CORS(app, origins=["http://localhost:5173"])

# Function to load document data from JSON file
def load_document_data(json_path):
    with open(json_path, 'r') as file:
        data = json.load(file)
    return data['documents']

# Function to detect and verify barcode/QR code from the image
def detect_and_verify_code(image_bytes, document_data):
    # Open the image from bytes
    img = Image.open(io.BytesIO(image_bytes))
    
    # Decode the barcode(s) or QR code(s)
    codes = decode(img)
    
    # Check if any barcodes/QR codes were found
    if codes:
        for code in codes:
            code_data = code.data.decode('utf-8')
            code_type = code.type  # Type will be 'QRCODE', 'EAN13', etc.
            
            # Compare the scanned code with the document data
            for document in document_data:
                if code_data == document['barcode']:
                    return {
                        'document_id': document['document_id'],
                        'status': 'Verified',
                        'code_data': code_data,
                        'code_type': code_type
                    }
            
            # If no matching document found, return the code data anyway
            return {
                'status': 'No matching document',
                'code_data': code_data,
                'code_type': code_type
            }
    
    return {'status': 'No code found'}

@app.route('/verify-code', methods=['POST'])
def verify_code():
    # Get the image from the request
    image_file = request.files.get('image')
    
    if not image_file:
        return jsonify({'error': 'Image file is required'}), 400

    # Load document data from the JSON file
    document_data = load_document_data('documents.json')  # Load the document data here from the local JSON file
    
    # Get image bytes
    image_bytes = image_file.read()
    
    # Perform code verification
    result = detect_and_verify_code(image_bytes, document_data)
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
