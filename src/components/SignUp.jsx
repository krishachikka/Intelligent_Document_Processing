import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore, storage } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/signup.css';

function SignUp() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePic, setProfilePic] = useState(null);

    const handleProfilePicChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            console.log("Passwords do not match");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            let profilePicUrl = '';

            if (profilePic) {
                const profilePicRef = ref(storage, `profile_pics/${user.uid}`);
                await uploadBytes(profilePicRef, profilePic);
                profilePicUrl = await getDownloadURL(profilePicRef);
            }

            await setDoc(doc(firestore, 'users', user.uid), {
                username,
                email,
                profilePicUrl,
            });

            console.log("User registered:", user);

            navigate('/');
        } catch (error) {
            console.error("Error signing up:", error.message);
        }
    };

    return (
        <div className="containeryash">
            <div className="signup-form">
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />
                    <input
                        type="file"
                        className="form-control"
                        id="profilePic"
                        name="profilePic"
                        onChange={handleProfilePicChange}
                        accept="image/*"
                    />
                    <button type="submit" className="btn btn-primary">Sign Up</button>
                    <Link to="/login" className="already-registered-text">Go to Login</Link>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
