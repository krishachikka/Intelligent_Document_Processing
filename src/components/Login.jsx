import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import '../styles/login.css';

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!email || !password) {
                throw new Error('Please fill in all fields.');
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in:', userCredential.user);

            setEmail('');
            setPassword('');

            navigate('/');
        } catch (error) {
            console.error('Error logging in:', error.message);
            setError(error.message);
        }
    };

    return (
        <div className="containeryash">
            <div className="login-form">
                <h2 className="header">Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="form"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        className="form"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button type="submit" className="btn btn-primary">Login</button>
                    <Link to="/signup" className="already-registered-text">Go to Signup</Link>
                </form>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
            </div>
        </div>
    );
}

export default Login;
