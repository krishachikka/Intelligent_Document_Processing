import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the workerSrc for pdf.js to avoid the version mismatch error
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const PdfExtractor = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
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
    };
  };

  const extractTextFromWord = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        setExtractedText(formatText(result.value));  // Format text after extraction
      } catch (error) {
        console.error('Error extracting text:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onFileUpload = () => {
    if (file) {
      if (file.type === 'application/pdf') {
        extractTextFromPdf(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractTextFromWord(file);
      } else {
        alert('Please upload a PDF or Word document');
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
      <h1>Upload Document</h1>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Extract Text</button>
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

export default PdfExtractor;
