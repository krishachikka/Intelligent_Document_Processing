import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Dashboard from './Dashboard';

function HomePage() {
  return (
    <div>
      <h1>IDP Dashboard</h1>
      <Dashboard />
      
      {/* Button to navigate to AcceptanceRejection page */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/acceptance-rejection">
          <button style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white' }}>
            Go to Acceptance and Rejection
          </button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
