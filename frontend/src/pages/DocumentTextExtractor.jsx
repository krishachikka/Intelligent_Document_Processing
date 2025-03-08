import React, { useState } from 'react';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the workerSrc for pdf.js to avoid the version mismatch error
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const DocumentTextExtractor = () => {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [verificationResponse, setVerificationResponse] = useState(null);
  const [textExtracted, setTextExtracted] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null); // New state for comparison result

  // Barcode/QR code extraction
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleBarcodeSubmit = async () => {
    if (!image) {
      setError('Image file is required for barcode/QR code extraction');
      return;
    }
    setError(null);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:5000/verify-code', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setVerificationResponse(res.data);
    } catch (err) {
      setError('Error during barcode/QR code verification');
    } finally {
      setIsProcessing(false);
    }
  };

  // Text extraction
  const extractName = (text) => {
    const namePattern = /Name:\s*([A-Za-z]+)\s([A-Za-z]+)(?:\s([A-Za-z]+))?/;
    const match = text.match(namePattern);
    if (match) {
      const lastName = match[1];
      const firstName = match[2];
      const middleName = match[3] || '';
      return `${lastName} ${firstName} ${middleName}`.trim();
    }
    return 'Name not found';
  };

  const extractTextFromImage = async (imageFile) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      Tesseract.recognize(
        imageData,
        ['eng', 'hin'],
        { logger: (m) => console.log(m) }
      ).then(({ data: { text } }) => {
        setTextExtracted(text);
        setName(extractName(text));
        setIsProcessing(false);
      }).catch((error) => {
        console.error('Error during OCR processing:', error);
        setIsProcessing(false);
      });
    };

    reader.readAsDataURL(imageFile);
  };

  const extractTextFromPdf = async (pdfFile) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(pdfFile);
    fileReader.onload = async () => {
      const arrayBuffer = fileReader.result;
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(' ') + '\n\n';
      }
      setTextExtracted(text);
      setName(extractName(text));
      setIsProcessing(false);
    };
  };

  const extractTextFromWord = async (wordFile) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        setTextExtracted(result.value);
        setName(extractName(result.value));
        setIsProcessing(false);
      } catch (error) {
        console.error('Error extracting text:', error);
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(wordFile);
  };

  const handleFileUpload = () => {
    if (!file) {
      setError('Please upload a file');
      return;
    }
    setError(null);
    if (file.type.startsWith('image/')) {
      extractTextFromImage(file);
    } else if (file.type === 'application/pdf') {
      extractTextFromPdf(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractTextFromWord(file);
    } else {
      setError('Please upload a valid image, PDF, or Word document');
    }
  };

  // Function to simulate comparison with an official database
  const compareWithDatabase = async () => {
    if (!verificationResponse && !textExtracted) {
      setError('Barcode/QR code or text data is required to compare');
      return;
    }

    // Simulate random boolean for verification (for the time being)
    const isVerified = Math.random() < 0.5; // 50% chance of being verified
    setComparisonResult(isVerified ? 'Verified' : 'Not Verified');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">Document Text Extractor & Barcode/QR Code Verifier</h1>

      {/* Barcode/QR Code Extraction Section */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Barcode/QR Code Verification</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleBarcodeSubmit}
          disabled={isProcessing}
          className="w-full p-3 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {isProcessing ? 'Verifying...' : 'Verify Barcode/QR Code'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {verificationResponse && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-md">
            <h3 className="font-semibold text-lg">Verification Result</h3>
            <pre className="mt-2 bg-gray-100 p-4 rounded-md">{JSON.stringify(verificationResponse, null, 2)}</pre>
            {verificationResponse.barcode_data && (
              <div className="mt-4">
                <h4 className="font-semibold text-md">Extracted Barcode/QR Code Data:</h4>
                <p className="mt-2">{verificationResponse.barcode_data}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text Extraction Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Text Extraction from Document</h2>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full py-2 px-4 border border-gray-300 rounded-md mb-4"
          accept=".pdf, .docx, .jpg, .png, .jpeg"
        />
        <button
          onClick={handleFileUpload}
          disabled={isProcessing}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold ${isProcessing ? 'bg-yellow-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
        >
          {isProcessing ? 'Processing...' : 'Extract Text'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-800 rounded-md">
            {error}
          </div>
        )}

        {textExtracted && (
          <div className="mt-6 p-4 border border-gray-300 rounded-md bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Extracted Text</h2>
            <div className="whitespace-pre-wrap break-words max-h-96 overflow-y-auto p-2 bg-white border border-gray-200 rounded-md">
              {textExtracted}
            </div>
          </div>
        )}

        {/* Compare with Official Database Button */}
        {(verificationResponse || textExtracted) && (
          <button
            onClick={compareWithDatabase}
            className="mt-4 w-full p-3 bg-indigo-500 text-white font-semibold rounded-md shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Compare with Official Database
          </button>
        )}

        {/* Comparison Result */}
        {comparisonResult && (
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md">
            <h3 className="font-semibold text-lg">Comparison Result</h3>
            <p>{comparisonResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentTextExtractor;