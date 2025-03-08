import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the workerSrc for pdf.js to avoid the version mismatch error
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const DocumentTextExtractor = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const extractTextFromImage = async (file) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      // Use Tesseract with both English and Hindi language support
      Tesseract.recognize(
        imageData,             // Image data or URL
        ['eng', 'hin'],        // Use both English and Hindi languages
        {
          logger: (m) => console.log(m),  // Optional: log the progress of OCR
        }
      ).then(({ data: { text } }) => {
        setExtractedText(text);
        setIsProcessing(false);
      }).catch((error) => {
        console.error('Error during OCR processing:', error);
        setIsProcessing(false);
      });
    };

    reader.readAsDataURL(file);  // Convert image file to DataURL
  };

  const extractTextFromPdf = async (file) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = async () => {
      const arrayBuffer = fileReader.result;
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(' ') + '\n\n';  // Add line breaks between pages
      }
      setExtractedText(text);
      setIsProcessing(false);
    };
  };

  const extractTextFromWord = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        setExtractedText(formatText(result.value));  // Format text after extraction
        setIsProcessing(false);
      } catch (error) {
        console.error('Error extracting text:', error);
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onFileUpload = () => {
    if (file) {
      if (file.type.startsWith('image/')) {
        extractTextFromImage(file);  // Extract text from images
      } else if (file.type === 'application/pdf') {
        extractTextFromPdf(file);  // Extract text from PDF
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractTextFromWord(file);  // Extract text from Word documents
      } else {
        alert('Please upload a valid image, PDF, or Word document');
      }
    }
  };

  // Function to format the extracted text for better readability
  const formatText = (text) => {
    // Example: Add line breaks where paragraphs are likely separated
    return text.replace(/\n/g, '\n\n').trim();
  };

  return (
    <div>
      <h1>Upload Document or Image for Text Extraction</h1>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Extract Text'}
      </button>
      {extractedText && (
        <div>
          <h2>Extracted Text</h2>
          <div
            style={{
              whiteSpace: 'pre-wrap',  // Ensures that whitespace (like line breaks) are preserved
              wordWrap: 'break-word',  // Allows long words to wrap correctly
              maxHeight: '400px',
              overflowY: 'auto',  // Scrollable container if the text is too long
              border: '1px solid #ccc',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            {extractedText}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTextExtractor;
