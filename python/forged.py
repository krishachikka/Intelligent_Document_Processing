import cv2
import numpy as np
import pytesseract
from PIL import Image
import matplotlib.pyplot as plt
from skimage import color, morphology
from scipy import ndimage
from skimage.feature import canny
from skimage import measure

# Path to tesseract executable (update according to your installation)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"  # for Windows, adjust if needed

# Function for Error Level Analysis (ELA)
def error_level_analysis(image_path, quality=90):
    original_image = cv2.imread(image_path)
    
    # Compress the image at lower quality to simulate tampering
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    _, compressed_image = cv2.imencode('.jpg', original_image, encode_param)
    
    # Decompress the image to simulate the tampered version
    decompressed_image = cv2.imdecode(compressed_image, 1)
    
    # Calculate the absolute difference (error) between original and compressed
    error_image = cv2.absdiff(original_image, decompressed_image)
    
    # Convert to grayscale and normalize the image
    gray_error_image = cv2.cvtColor(error_image, cv2.COLOR_BGR2GRAY)
    normalized_error = cv2.normalize(gray_error_image, None, 0, 255, cv2.NORM_MINMAX)
    
    # Threshold the image to detect high error levels
    _, thresholded = cv2.threshold(normalized_error, 20, 255, cv2.THRESH_BINARY)
    
    # Count the number of white pixels which indicate errors (possible tampering)
    error_count = np.sum(thresholded == 255)
    
    # Dynamic thresholding to reduce false positives
    tampered = error_count > 5000  # Threshold based on image size
    
    return tampered, error_count, normalized_error, thresholded

# Function to extract text from the document using OCR
def extract_text(image_path):
    image = Image.open(image_path)
    
    # Enhance image for OCR
    gray_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    _, binarized = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Use pytesseract to extract text
    text = pytesseract.image_to_string(binarized)
    return text

# Function to compare two text documents for inconsistencies (tampering detection)
def compare_texts(original_text, extracted_text):
    # OCR errors might cause some inconsistency, improve by using fuzzy comparison or manual review
    if original_text and extracted_text:
        if original_text.strip() != extracted_text.strip():
            return True, "Text mismatch detected, possible tampering."
    return False, "Text is consistent, no tampering detected."

# Layout Analysis: Check for misalignment in text (e.g., regions where the text is not aligned properly)
def check_layout(image_path):
    image = cv2.imread(image_path)
    
    # Convert to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Threshold the image to highlight text regions
    _, thresholded_image = cv2.threshold(gray_image, 150, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours of the text blocks
    contours, _ = cv2.findContours(thresholded_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Check the bounding box alignment and size consistency of text blocks
    layout_issue_count = 0
    suspicious_areas = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 200 and h > 20:  # Assuming large text block, adjust threshold as necessary
            layout_issue_count += 1
            suspicious_areas.append((x, y, w, h))
    
    layout_issue_detected = layout_issue_count > 5
    return layout_issue_detected, layout_issue_count, suspicious_areas

# Improved Edge Detection and Pixel Breaking Analysis
def check_pixel_breaking(image_path):
    image = cv2.imread(image_path)
    
    # Convert to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Canny edge detection (for more refined edge detection)
    edges = canny(gray_image / 255.0)  # Normalize and apply Canny
    
    # Label connected components
    labeled_image, num_labels = measure.label(edges, connectivity=2, return_num=True)
    
    edge_count = np.sum(edges)
    
    # More advanced check: if a large portion of the image has sudden edges, mark as tampered
    tampered = edge_count > 10000  # Threshold based on image size
    
    return tampered, edge_count, edges

# Brightness and contrast analysis
def check_brightness_contrast(image_path):
    image = cv2.imread(image_path)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Extract brightness (Value channel)
    v_channel = hsv[:, :, 2]
    
    # Calculate the mean brightness
    mean_brightness = np.mean(v_channel)
    
    # Check for significant brightness difference (lightened/darkened areas)
    brightness_diff = np.std(v_channel)
    
    tampered = brightness_diff > 50  # Threshold for "significant" tampering indication
    return tampered, mean_brightness, brightness_diff

# Main function to analyze the document image
def analyze_document(image_path, original_text=None):
    # Step 1: Extract text using OCR
    extracted_text = extract_text(image_path)
    
    # Step 2: Compare the extracted text with the original (if available)
    if original_text:
        tampered_text, text_reason = compare_texts(original_text, extracted_text)
    else:
        tampered_text, text_reason = False, "No original text provided for comparison."
    
    # Step 3: Perform Error Level Analysis
    tampered_ela, ela_error_count, ela_image, ela_highlighted = error_level_analysis(image_path)
    
    # Step 4: Check layout consistency
    tampered_layout, layout_issue_count, layout_areas = check_layout(image_path)
    
    # Step 5: Check for brightness/contrast inconsistencies
    tampered_brightness, mean_brightness, brightness_diff = check_brightness_contrast(image_path)
    
    # Step 6: Pixel breaking analysis
    tampered_pixels, edge_count, edges = check_pixel_breaking(image_path)
    
    # Calculate tampering score (percentage)
    score = 0
    if tampered_text:
        score += 20
    if tampered_ela:
        score += 20
    if tampered_layout:
        score += 20
    if tampered_brightness:
        score += 20
    if tampered_pixels:
        score += 20
    
    # Display results
    print(f"\n--- Analysis Report ---\n")
    print(f"Tampering Score: {score}%")
    
    if tampered_text:
        print(f"Reason (Text Analysis): {text_reason}")
    if tampered_ela:
        print(f"Reason (ELA): High error count detected: {ela_error_count} pixels.")
    if tampered_layout:
        print(f"Reason (Layout): {layout_issue_count} layout issues detected.")
    if tampered_brightness:
        print(f"Reason (Brightness): High brightness difference: {brightness_diff}. Mean brightness: {mean_brightness}.")
    if tampered_pixels:
        print(f"Reason (Pixel Breaking): {edge_count} edge pixels detected.")
    
    # Highlight tampered areas (for visualization)
    image = cv2.imread(image_path)
    
    if tampered_ela:
        # Highlight the tampered areas in the ELA result (Green for tampered areas)
        image[ela_highlighted == 255] = [0, 255, 0]  # Green for tampered areas
    
    if tampered_layout:
        # Draw bounding boxes around suspicious areas (Green for layout issues)
        for (x, y, w, h) in layout_areas:
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)  # Green for layout issues
    
    # Display the images with highlighted areas
    plt.figure(figsize=(15, 5))
    
    # Original Image with Rectangles
    plt.subplot(1, 3, 1)
    plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    plt.title('Original Image with Tampered Areas')
    
    # Image with Pixel Analysis
    plt.subplot(1, 3, 2)
    plt.imshow(edges, cmap='gray')
    plt.title('Pixel Analysis (Edge Detection)')
    
    # Third Image: Displaying Square on Tampered Area
    plt.subplot(1, 3, 3)
    square_image = cv2.imread(image_path)
    if tampered_ela:
        # Show square around the tampered area
        for (x, y, w, h) in layout_areas:
            cv2.rectangle(square_image, (x, y), (x + w, y + h), (0, 255, 0), 2)  # Green for tampered areas
    plt.imshow(cv2.cvtColor(square_image, cv2.COLOR_BGR2RGB))
    plt.title('Tampered Area Highlighted with Square')
    
    plt.show()
    
    # Output Tampering Status
    if tampered_text or tampered_ela or tampered_layout or tampered_brightness or tampered_pixels:
        print("\nImage is tampered!")
    else:
        print("\nImage is NOT tampered!")


# Upload image and process
image_path = input("Enter image path: ")
original_text = input("Enter original text (optional, leave empty if not available): ")

analyze_document(image_path, original_text=original_text if original_text else None)
