import React, { useState, useEffect } from 'react';

const AcceptanceRejection = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openUser, setOpenUser] = useState(null);

  useEffect(() => {
    fetch('/data/dummyData.json') // Fetching the dummy data from public folder
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading dummy data:", error);
        setIsLoading(false);
      });
  }, []);

  const handleDocumentStatusChange = (userId, documentId, newStatus) => {
    const updatedData = data.map((user) => {
      if (user.id === userId) {
        const updatedDocuments = user.documents.map((document) =>
          document.id === documentId ? { ...document, status: newStatus } : document
        );
        return { ...user, documents: updatedDocuments };
      }
      return user;
    });
    setData(updatedData);
  };

  const toggleUserDocuments = (userId) => {
    setOpenUser(openUser === userId ? null : userId); // Toggle dropdown
  };

  const handleDocumentPreview = (file) => {
    if (file.endsWith('.pdf')) {
      window.open(file, '_blank');  // Open PDF in a new tab
    } else if (file.endsWith('.jpg') || file.endsWith('.png')) {
      const newWindow = window.open();
      newWindow.document.write(`<img src="${file}" style="width: 100%; height: auto;" />`);  // Open image in a new tab
    } else {
      alert("Unsupported file type");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Acceptance and Rejection of Documents</h2>

      {/* User Details Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Phone</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Documents</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.user}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.email}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.phone}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button
                  onClick={() => toggleUserDocuments(user.id)}
                  style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white' }}
                >
                  {openUser === user.id ? 'Hide Documents' : 'Show Documents'}
                </button>

                <div
                  style={{
                    maxHeight: openUser === user.id ? '500px' : '0',
                    overflow: 'hidden',
                    opacity: openUser === user.id ? '1' : '0',
                    transition: 'max-height 0.5s ease, opacity 0.5s ease',
                    marginTop: '10px'
                  }}
                >
                  {user.documents.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ flex: 1, paddingRight: '10px' }}>
                        <p><strong>{doc.type}</strong></p>
                        <button onClick={() => handleDocumentPreview(doc.file)} style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white' }}>
                          View Document
                        </button>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p>Status: {doc.status}</p>
                        <div>
                          <button
                            onClick={() => handleDocumentStatusChange(user.id, doc.id, 'Accepted')}
                            style={{
                              marginRight: '10px',
                              padding: '5px 10px',
                              backgroundColor: 'green',
                              color: 'white'
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDocumentStatusChange(user.id, doc.id, 'Rejected')}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: 'red',
                              color: 'white'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcceptanceRejection;
