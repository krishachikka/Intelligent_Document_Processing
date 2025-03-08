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

# Function to detect and verify barcode from the image
def detect_and_verify_barcode(image_bytes, document_data):
    # Open the image from bytes
    img = Image.open(io.BytesIO(image_bytes))
    
    # Decode the barcode(s)
    barcodes = decode(img)
    
    # Check if any barcodes were found
    if barcodes:
        for barcode in barcodes:
            barcode_data = barcode.data.decode('utf-8')
            
            # Compare the scanned barcode with the document data
            for document in document_data:
                if barcode_data == document['barcode']:
                    return {'document_id': document['document_id'], 'status': 'Verified', 'barcode_data': barcode_data}
            
            # If no matching document found, return the barcode data anyway
            return {'status': 'No matching document', 'barcode_data': barcode_data}
    
    return {'status': 'No barcode found'}

@app.route('/verify-barcode', methods=['POST'])
def verify_barcode():
    # Get the image from the request
    image_file = request.files.get('image')
    
    if not image_file:
        return jsonify({'error': 'Image file is required'}), 400

    # Load document data from the JSON file
    document_data = load_document_data('documents.json')  # Load the document data here from the local JSON file
    
    # Get image bytes
    image_bytes = image_file.read()
    
    # Perform barcode verification
    result = detect_and_verify_barcode(image_bytes, document_data)
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)