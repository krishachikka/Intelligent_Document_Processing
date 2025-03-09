import React, { useState } from "react";
import axios from "axios";

const DocumentTextExtractor = () => {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("⚠️ Image file is required");
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:5000/verify-barcode", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResponse(res.data);
    } catch (err) {
      setError("❌ Error during barcode verification");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">🔍 Barcode Verifier</h1>
        
        <div className="flex flex-col items-center space-y-5">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-lg text-gray-700 font-semibold border border-gray-400 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-3"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white text-lg font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
          >
            ✅ Verify Barcode
          </button>
        </div>

        {error && <p className="text-red-600 text-lg font-semibold mt-4 text-center">{error}</p>}

        {response && (
          <div className="mt-6 p-6 bg-gray-50 border border-gray-400 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900">✅ Verification Result</h3>
            <pre className="text-lg bg-gray-200 p-3 rounded-md overflow-auto text-gray-800 font-semibold">{JSON.stringify(response, null, 2)}</pre>
            
            <div className="mt-4 space-y-3">
              {response.barcode_data && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900">📌 Extracted Barcode Data:</h4>
                  <p className="text-lg text-gray-800">{response.barcode_data}</p>
                </div>
              )}
              {response.extracted_text && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900">📄 Extracted Document Text:</h4>
                  <p className="text-lg text-gray-800">{response.extracted_text}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentTextExtractor;
