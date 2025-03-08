import React, { useState } from 'react';

const BankStatement = () => {
    const [image, setImage] = useState(null);
    const [detectedTables, setDetectedTables] = useState([]);
    const [resultImageUrl, setResultImageUrl] = useState('');

    const handleImageUpload = (event) => {
        setImage(event.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!image) {
            alert('Please upload an image!');
            return;
        }

        const formData = new FormData();
        formData.append('file', image);

        try {
            const response = await fetch('http://localhost:5000/detect_tables', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.error) {
                alert(data.error);
            } else {
                setDetectedTables(data.detected_tables);
                // Construct the result image URL from the server's response
                setResultImageUrl(`http://localhost:5000/outputs/${data.result_image}`);
            }
        } catch (error) {
            console.error('Error uploading the image:', error);
        }
    };

    return (
        <div>
            <h1>Table Detection</h1>
            <input type="file" onChange={handleImageUpload} />
            <button onClick={handleSubmit}>Detect Tables</button>

            {resultImageUrl && (
                <div>
                    <h2>Result</h2>
                    <img src={resultImageUrl} alt="Detected tables" />
                </div>
            )}

            <div>
                <h2>Detected Tables</h2>
                {detectedTables.length > 0 ? (
                    detectedTables.map((table, index) => (
                        <div key={index}>
                            <p>Table {index + 1}: {`x: ${table.bbox[0]}, y: ${table.bbox[1]}, width: ${table.bbox[2]}, height: ${table.bbox[3]}`}</p>
                        </div>
                    ))
                ) : (
                    <p>No tables detected.</p>
                )}
            </div>
        </div>
    );
};

export default BankStatement;
