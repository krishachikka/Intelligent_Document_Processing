import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();

    // Retrieve the token from local storage
    const token = localStorage.getItem('token');

    useEffect(() => {
        // If no token is found, redirect to signin page
        if (!token) {
            navigate('/signin');
        }
    }, [token, navigate]);

    // Retrieve the username from local storage
    const username = localStorage.getItem('username') || 'Guest';

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token from local storage
        localStorage.removeItem('username'); // Clear username from local storage
        navigate('/signin'); // Navigate to signin page
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-purple-700 mb-6">Home</h1>
                <p className="mb-4">Welcome, {username}!</p>
                <button
                    onClick={handleLogout}
                    className="bg-purple-600 text-white p-3 rounded-lg shadow hover:bg-purple-700 transition duration-300"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Home;
