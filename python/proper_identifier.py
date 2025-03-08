import json
from pyzbar.pyzbar import decode
from PIL import Image, ImageDraw

# Function to load document data from JSON file
def load_document_data(json_path):
    with open(json_path, 'r') as file:
        data = json.load(file)
    return data['documents']

# Function to detect and display barcode and match with the document details
def detect_and_display_barcode(image_path, document_data):
    # Open the image
    img = Image.open(image_path)
    
    # Decode the barcode(s)
    barcodes = decode(img)
    
    # Check if any barcodes were found
    if barcodes:
        for barcode in barcodes:
            # Get barcode data and type
            barcode_data = barcode.data.decode('utf-8')
            barcode_type = barcode.type
            
            # Print barcode info
            print(f"Detected Barcode: {barcode_data}, Type: {barcode_type}")
            
            # Compare the scanned barcode with the document data
            for document in document_data:
                if barcode_data == document['barcode']:
                    # If the barcode matches, print "Verified"
                    print(f"Document ID: {document['document_id']} - Verified")
                    return  # Exit after the match
            # If no match found, do nothing (leave)
    else:
        print("No barcode found in the image.")

# Example usage
image_path = 'images/receipt.png'  # Provide the path to your image
json_path = 'documents.json'  # Provide the path to the JSON file with documents

# Load document data from JSON file
document_data = load_document_data(json_path)

# Call the function to detect barcode and match with document data
detect_and_display_barcode(image_path, document_data)
