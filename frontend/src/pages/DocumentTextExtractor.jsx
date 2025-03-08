import React, { useState } from 'react';
import axios from 'axios';

const DocumentTextExtractor = () => {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Image file is required');
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:5000/verify-barcode', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResponse(res.data);
    } catch (err) {
      setError('Error during barcode verification');
    }
  };

  return (
    <div>
      <h1>Barcode Verifier</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleSubmit}>Verify Barcode</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {response && (
        <div>
          <h3>Verification Result</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
          <div>
            {response.barcode_data && (
              <>
                <h4>Extracted Barcode Data:</h4>
                <p>{response.barcode_data}</p>
              </>
            )}
            {response.extracted_text && (
              <>
                <h4>Extracted Document Text:</h4>
                <p>{response.extracted_text}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTextExtractor;