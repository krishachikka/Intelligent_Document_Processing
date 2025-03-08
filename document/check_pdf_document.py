import os
import hashlib
from PyPDF2 import PdfFileReader
import fitz  # PyMuPDF
import time

# 1. Check PDF metadata
def check_pdf_metadata(file_path):
    try:
        with open(file_path, 'rb') as f:
            reader = PdfFileReader(f)
            metadata = reader.getDocumentInfo()
            return metadata
    except Exception as e:
        return f"Error reading PDF metadata: {e}"

def detect_modifications_in_pdf(file_path):
    metadata = check_pdf_metadata(file_path)
    if isinstance(metadata, dict):
        mod_date = metadata.get('/ModDate', None)
        if mod_date:
            return f"Modification Date: {mod_date} - Document has been modified."
        else:
            return "No modifications detected in metadata."
    return metadata

# 2. Check PDF structure (e.g., Annotations, Objects)
def check_pdf_structure(file_path):
    try:
        doc = fitz.open(file_path)
        annotations = doc.annots()  # Check for annotations (e.g., highlights, comments)
        if annotations:
            return "Annotations detected - Likely edited."
        return "No annotations detected - Likely not edited."
    except Exception as e:
        return f"Error checking structure: {e}"

# 3. Check Digital Signature (Optional)
def check_pdf_signature(file_path):
    try:
        # PyPDF2 does not support digital signature verification directly
        # You would need another library like PyCryptodome or OpenSSL for this
        return "Signature verification is not implemented in PyPDF2."
    except Exception as e:
        return f"Error checking signature: {e}"

# 4. Compare File with Original Using Hashing
def compute_file_hash(file_path):
    hash_md5 = hashlib.md5()
    try:
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception as e:
        return f"Error computing hash: {e}"

def compare_files(original_file_path, modified_file_path):
    original_hash = compute_file_hash(original_file_path)
    modified_hash = compute_file_hash(modified_file_path)
    if original_hash != modified_hash:
        return "Files are different. The document has been modified."
    return "Files are identical."

# 5. Main PDF verification function
def verify_pdf_document(file_path, original_pdf_path=None):
    results = []

    # Metadata check
    metadata_check = detect_modifications_in_pdf(file_path)
    results.append(f"Metadata Check: {metadata_check}")
    
    # Structure check (annotations)
    structure_check = check_pdf_structure(file_path)
    results.append(f"Structure Check: {structure_check}")
    
    # Signature check (if applicable)
    signature_check = check_pdf_signature(file_path)
    results.append(f"Signature Check: {signature_check}")
    
    # Compare with the original file (if an original PDF is provided)
    if original_pdf_path:
        comparison_result = compare_files(original_pdf_path, file_path)
        results.append(f"File Comparison: {comparison_result}")
    
    return results

# Example usage
if __name__ == "__main__":
    input_folder = "./input"
    output_folder = "./output"
    
    # Example file path
    pdf_file_path = os.path.join(input_folder, "student_certificate.pdf")
    original_pdf_path = os.path.join(input_folder, "original_certificate.pdf")
    
    # Run the verification
    verification_results = verify_pdf_document(pdf_file_path, original_pdf_path)
    
    # Save results to file
    with open(os.path.join(output_folder, "results_report.txt"), "w") as report:
        for result in verification_results:
            report.write(result + "\n")
    
    print("Verification complete. Results saved in 'results_report.txt'")
