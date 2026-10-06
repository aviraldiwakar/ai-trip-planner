import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUserId }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true); // Disable button immediately

        const endpoint = isRegistering ? '/api/users/register' : '/api/users/login';
        const payload = isRegistering
            ? { name: name.trim(), email: email.trim(), passwordHash: password }
            : { email: email.trim(), passwordHash: password };

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMsg(data.message || 'Authentication failed.');
                setIsLoading(false); // Re-enable if error
                return;
            }

            setUserId(data.userId);
            localStorage.setItem('tripPlannerUserId', data.userId);
            navigate('/dashboard');

        } catch (err) {
            setErrorMsg('Failed to connect to the server.');
            setIsLoading(false); // Re-enable if network crash
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#f3f4f6' }}>
                {isRegistering ? 'Create an Account' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isRegistering && (
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }}
                    />
                )}
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }}
                />

                {errorMsg && <p style={{ color: 'red', margin: '0', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: '12px',
                        background: isLoading ? '#9ca3af' : '#2563EB', // Grey out when loading
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginTop: '8px'
                    }}
                >
                    {isLoading ? 'Waking up server (takes ~50s)...' : (isRegistering ? 'Sign Up' : 'Sign In')}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#f3f4f6' }}>
                {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                <span
                    onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }}
                    style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 'bold' }}
                >
          {isRegistering ? 'Log in' : 'Register here'}
        </span>
            </p>
        </div>
    );
}