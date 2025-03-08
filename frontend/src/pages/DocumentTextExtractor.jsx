import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set workerSrc for pdf.js to avoid version mismatch issues
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const DocumentTextExtractor = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [dob, setDob] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Function to extract Aadhaar Number
  const extractAadharNumber = (text) => {
    const aadharPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
    const match = text.match(aadharPattern);
    return match ? match[0] : 'Aadhar number not found';
  };

  // Function to extract Date of Birth
  const extractDob = (text) => {
    const dobPattern = /\b(\d{2}\/\d{2}\/\d{4})\b/;
    const match = text.match(dobPattern);
    return match ? match[0] : 'Date of birth not found';
  };

  // Extract text from image
  const extractTextFromImage = async (file) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = () => {
      Tesseract.recognize(
        reader.result,
        ['eng', 'hin'],
        { logger: (m) => console.log(m) }
      ).then(({ data: { text } }) => {
        setExtractedText(text);
        setAadharNumber(extractAadharNumber(text));
        setDob(extractDob(text));
        setIsProcessing(false);
      }).catch((error) => {
        console.error('OCR Error:', error);
        setIsProcessing(false);
      });
    };

    reader.readAsDataURL(file);
  };

  // Extract text from PDF
  const extractTextFromPdf = async (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(' ') + '\n\n';
      }

      setExtractedText(text);
      setAadharNumber(extractAadharNumber(text));
      setDob(extractDob(text));
      setIsProcessing(false);
    };
  };

  // Extract text from Word document
  const extractTextFromWord = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer: reader.result });
        setExtractedText(result.value);
        setAadharNumber(extractAadharNumber(result.value));
        setDob(extractDob(result.value));
        setIsProcessing(false);
      } catch (error) {
        console.error('Text Extraction Error:', error);
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onFileUpload = () => {
    if (file) {
      if (file.type.startsWith('image/')) {
        extractTextFromImage(file);
      } else if (file.type === 'application/pdf') {
        extractTextFromPdf(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractTextFromWord(file);
      } else {
        alert('Please upload a valid image, PDF, or Word document');
      }
    }
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
        className={`w-full py-2 px-4 rounded-md text-white font-semibold ${isProcessing ? 'bg-yellow-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
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

      <div className="mt-6 p-4 border border-gray-300 rounded-md bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Aadhar Number</h2>
        <div className="whitespace-pre-wrap break-words p-2 bg-white border border-gray-200 rounded-md">
          {aadharNumber || 'No Aadhar number found'}
        </div>
      </div>

      <div className="mt-6 p-4 border border-gray-300 rounded-md bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Date of Birth</h2>
        <div className="whitespace-pre-wrap break-words p-2 bg-white border border-gray-200 rounded-md">
          {dob || 'No date of birth found'}
        </div>
      </div>
    </div>
  );
};

export default DocumentTextExtractor;
