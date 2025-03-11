import imagehash
from PIL import Image, ImageDraw, ImageFont
import pytesseract
import os
import cv2
import numpy as np
import tkinter as tk
from tkinter import messagebox

# Function to compute the hash of an image
def get_image_hash(image_path):
    image = Image.open(image_path)
    return imagehash.average_hash(image)

# Function to extract EXIF metadata from an image
def get_exif_metadata(image_path):
    try:
        # Only attempt to extract EXIF if the image is JPEG or TIFF
        if image_path.lower().endswith(('.jpg', '.jpeg', '.tiff')):
            exif_dict = piexif.load(image_path)
            return exif_dict
        else:
            print(f"EXIF data extraction not supported for {os.path.basename(image_path)} (not a JPEG or TIFF file).")
            return None
    except Exception as e:
        print(f"Error extracting EXIF metadata from {os.path.basename(image_path)}: {e}")
        return None

# Function to compare image files by hash
def compare_image_files(original_image_path, tampered_image_path):
    # Compute the hash of both images
    original_hash = get_image_hash(original_image_path)
    tampered_hash = get_image_hash(tampered_image_path)
    
    print(f"Original Image Hash: {original_hash}")
    print(f"Tampered Image Hash: {tampered_hash}")
    
    if original_hash != tampered_hash:
        return "Images are different, tampering detected based on hash!"
    else:
        return "Images are identical based on hash."

# Function to compare EXIF metadata
def compare_exif_metadata(original_image_path, tampered_image_path):
    # Get EXIF metadata for both images
    original_exif = get_exif_metadata(original_image_path)
    tampered_exif = get_exif_metadata(tampered_image_path)
    
    if original_exif != tampered_exif:
        return "EXIF metadata differs, possible tampering detected!"
    else:
        return "EXIF metadata is the same for both images."

# Function to extract text from an image using OCR
def extract_text_from_image(image_path):
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image)
    return text

# Function to find tampered words by comparing original and tampered texts
def find_tampered_words(original_text, tampered_text):
    original_words = set(original_text.split())
    tampered_words = set(tampered_text.split())
    tampered_diff = tampered_words - original_words
    
    return tampered_diff

# Function to highlight tampered words in the image
def highlight_tampered_words(original_image_path, tampered_image_path, tampered_words):
    # Open the tampered image using OpenCV
    image = cv2.imread(tampered_image_path)
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Extract text and its bounding boxes
    h, w = image.shape[:2]
    boxes = pytesseract.image_to_boxes(gray_image)
    
    # Highlight the tampered words on the image
    for b in boxes.splitlines():
        b = b.split()
        word = b[0]
        
        if word in tampered_words:
            x, y, w1, h1 = int(b[1]), int(b[2]), int(b[3]), int(b[4])
            cv2.rectangle(image, (x, h - y), (w1, h - h1), (0, 255, 0), 2)  # Highlight in green
    
    # Save the image with highlights
    highlighted_image_path = "highlighted_tampered_image.png"
    cv2.imwrite(highlighted_image_path, image)
    
    # Show the highlighted image
    highlighted_image = Image.open(highlighted_image_path)
    highlighted_image.show()

    return highlighted_image_path

# Function to show results in a popup window
def show_popup(message):
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    messagebox.showinfo("Tampering Detection Results", message)
    root.quit()

def main():
    # Prompt user to input image file paths
    original_image_path = input("Enter the path of the original image: ")
    tampered_image_path = input("Enter the path of the tampered image: ")
    
    # Compare images by hash
    hash_comparison_result = compare_image_files(original_image_path, tampered_image_path)
    
    # Compare EXIF metadata (if available)
    exif_comparison_result = compare_exif_metadata(original_image_path, tampered_image_path)
    
    # Extract text from both images using OCR
    original_text = extract_text_from_image(original_image_path)
    tampered_text = extract_text_from_image(tampered_image_path)
    
    # Find tampered words
    tampered_words = find_tampered_words(original_text, tampered_text)
    
    if tampered_words:
        tampered_words_message = "Tampered words detected in the tampered image:\n" + "\n".join(tampered_words)
    else:
        tampered_words_message = "No tampered words detected."
    
    # Show the results in a popup
    message = f"{hash_comparison_result}\n{exif_comparison_result}\n\n{tampered_words_message}"
    show_popup(message)
    
    # Highlight tampered words in the tampered image
    highlight_tampered_words(original_image_path, tampered_image_path, tampered_words)

# Run the program
main()
