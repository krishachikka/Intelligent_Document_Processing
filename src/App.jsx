import React from 'react';
import DocumentTextExtractor from './pages/DocumentTextExtractor';
// import PdfExtractor from './pages/PdfExtractor';


const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Text Extractor</h1>
        <p>Upload a PDF or Word document to extract text</p>
      </header>

      {/* The DocumentTextExtractor component for file upload and text extraction */}
    <DocumentTextExtractor/>
    {/* <PdfExtractor/> */}
    </div>
  );
};

export default App;
