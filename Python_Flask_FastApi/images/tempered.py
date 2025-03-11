import cv2
import numpy as np
import pytesseract

def preprocess_image(image_path):
    """Preprocess the image for better analysis (grayscale and noise filtering)."""
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Error: The image at {image_path} could not be loaded. Please check the path.")
    
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)  # Convert to grayscale
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)  # Apply Gaussian blur to reduce noise
    return blurred

def detect_dark_white_background(image):
    """Detect regions with dark white (light gray or off-white) backgrounds."""
    # Convert the image to HSV color space for better detection of light/dark colors
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Define the range for light gray (dark white) color in HSV space
    # We target a range of low-saturation light colors that are darker than pure white
    lower_dark_white = np.array([0, 0, 200])  # Lower bound for light/dark white (light gray)
    upper_dark_white = np.array([180, 20, 255])  # Upper bound for light gray background
    
    # Create a mask that highlights the dark white background areas
    dark_white_mask = cv2.inRange(hsv_image, lower_dark_white, upper_dark_white)
    
    return dark_white_mask

def extract_text_from_image(image, mask=None):
    """Extract text using OCR, optionally with a mask to focus on tampered regions."""
    if mask is not None:
        # Apply the mask to the image to focus on tampered areas
        image = cv2.bitwise_and(image, image, mask=mask)
    
    # Use pytesseract to perform OCR on the image (or masked image) and extract text
    text = pytesseract.image_to_string(image)
    return text.strip()

def detect_tampering(image_path):
    """Detect tampering in a single image based on dark white background anomalies."""
    try:
        # Preprocess the image
        image = cv2.imread(image_path)
        
        # Detect dark white background regions (potential tampered areas)
        dark_white_background_mask = detect_dark_white_background(image)
        
        # Find contours of the dark white background regions
        contours, _ = cv2.findContours(dark_white_background_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        tampered_words = []  # List to store potentially tampered words
        
        # If contours are found, it suggests potential tampering
        if len(contours) > 0:
            print(f"Tampering detected!")
            print(f"Number of tampered regions found: {len(contours)}")
            
            # Extract original text from the full image
            original_text = extract_text_from_image(image)
            print("Original Text Extracted: ", original_text)
            
            # Extract text from tampered regions based on detected dark white background
            tampered_texts = []
            for contour in contours:
                # Create a mask for each tampered region
                mask = np.zeros(image.shape[:2], dtype=np.uint8)
                cv2.drawContours(mask, [contour], -1, 255, -1)
                
                # Extract the region of interest (ROI) based on the contour
                tampered_text = extract_text_from_image(image, mask)
                
                if tampered_text.strip():  # Check if any text was found in the tampered region
                    tampered_texts.append(tampered_text)
                    print(f"Tampered Region Text: {tampered_text}")
            
            # Find anomalies in extracted text (detecting outliers)
            if tampered_texts:
                print("\nModified/Tampered Text Areas:")
                for idx, tampered in enumerate(tampered_texts):
                    print(f"Tampered Region {idx+1}: {tampered}")
                    
                    # Check for unusual patterns or mismatches with the original text
                    if tampered != original_text:
                        tampered_words.append(tampered)  # Add the tampered word to the list
                        print(f"Potential Tampered Word Detected: {tampered}")
            
            # Display detected tampered words at the end of the processing
            if tampered_words:
                print("\nVerified Tampered Words:")
                for word in tampered_words:
                    print(f"- {word}")
            else:
                print("No significant pattern anomalies detected.")
            
            print("The document is tampered.")
            return True  # Tampered
        else:
            print(f"No tampering detected.")
            print("The document is authentic.")
            return False  # Not tampered
        
    except FileNotFoundError as e:
        print(e)
        return False

# Example usage:
image_path = input("Enter the path to the image: ")  # Path to the potentially tampered image

# Check if tampering is detected
is_tampered = detect_tampering(image_path)

# Close any open windows after processing
cv2.destroyAllWindows()
