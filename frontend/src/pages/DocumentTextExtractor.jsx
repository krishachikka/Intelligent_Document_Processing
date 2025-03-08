import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the workerSrc for pdf.js to avoid the version mismatch error
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const DocumentTextExtractor = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file input change
  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Function to extract the name following the pattern "Name: LastName FirstName MiddleName"
  const extractName = (text) => {
    // Look for the pattern "Name: [LastName] [FirstName] [MiddleName]"
    const namePattern = /Name:\s*([A-Za-z]+)\s([A-Za-z]+)(?:\s([A-Za-z]+))?/;

    const match = text.match(namePattern);
    if (match) {
      // Extract name components
      const lastName = match[1];
      const firstName = match[2];
      const middleName = match[3] || ''; // Middle name might be optional
      return `${lastName} ${firstName} ${middleName}`.trim();  // Format as "LastName FirstName MiddleName"
    }
    return 'Name not found';
  };

  // Extract text from image using Tesseract.js
  const extractTextFromImage = async (file) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      // Use Tesseract with both English and Hindi language support
      Tesseract.recognize(
        imageData, 
        ['eng', 'hin'],
        {
          logger: (m) => console.log(m), // Optional: log the progress of OCR
        }
      ).then(({ data: { text } }) => {
        setExtractedText(text);
        setName(extractName(text));  // Extract and set name
        setIsProcessing(false);
      }).catch((error) => {
        console.error('Error during OCR processing:', error);
        setIsProcessing(false);
      });
    };

    reader.readAsDataURL(file);  // Convert image file to DataURL
  };

  // Extract text from PDF file using pdf.js
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
      setName(extractName(text));  // Extract and set name
      setIsProcessing(false);
    };
  };

  // Extract text from Word document using Mammoth.js
  const extractTextFromWord = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        setExtractedText(formatText(result.value));  // Format text after extraction
        setName(extractName(result.value));  // Extract and set name
        setIsProcessing(false);
      } catch (error) {
        console.error('Error extracting text:', error);
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle file upload logic
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
    return text.replace(/\n/g, '\n\n').trim();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        Upload Document or Image for Text Extraction
      </h1>
      
      <input 
        type="file" 
        onChange={onFileChange} 
        className="block w-full py-2 px-4 border border-gray-300 rounded-md mb-4"
        accept=".pdf, .docx, .jpg, .png, .jpeg"
      />
      
      <button 
        onClick={onFileUpload} 
        disabled={isProcessing} 
        className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
          isProcessing ? 'bg-yellow-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Extract Text'}
      </button>
      
      {extractedText && (
        <div className="mt-6 p-4 border border-gray-300 rounded-md bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Extracted Text</h2>
          <div className="whitespace-pre-wrap break-words max-h-96 overflow-y-auto p-2 bg-white border border-gray-200 rounded-md">
            {extractedText}
          </div>
        </div>
      )}
      
      {/* Display extracted name separately */}
      <div className="mt-6 p-4 border border-gray-300 rounded-md bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Extracted Name</h2>
        <div className="whitespace-pre-wrap break-words p-2 bg-white border border-gray-200 rounded-md">
          {name ? name : 'No name found'}
        </div>
      </div>
    </div>
  );
};

export default DocumentTextExtractor;
