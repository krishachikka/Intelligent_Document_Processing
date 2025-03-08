import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/home.css';

function Home() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setCurrentUser(user);

                // Fetch user details from Firestore
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserDetails(userDoc.data());
                } else {
                    console.log('No such document!');
                }
            } else {
                setCurrentUser(null);
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            console.log('User logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
    };

    if (!currentUser || !userDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="containeryash">
            <h1 className="header">Welcome, {userDetails.username}</h1>
            <p className="details">Email: {userDetails.email}</p>
            {userDetails.profilePicUrl && (
                <div>
                    <img className="profile-pic" src={userDetails.profilePicUrl} alt="Profile" />
                </div>
            )}
            <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Home;
