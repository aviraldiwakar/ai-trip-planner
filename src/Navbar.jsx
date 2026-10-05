import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './index.css'; // Import the global styles

export default function Navbar({ userId, setUserId }) {
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!userId) {
            setUserName('');
            return;
        }
        fetch('${import.meta.env.VITE_BACKEND_URL}/api/users/register')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch user");
                return res.json();
            })
            .then(data => {
                if (data.name) setUserName(data.name);
            })
            .catch(err => console.error("Error loading profile:", err));
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem('tripPlannerUserId');
        setUserId(null);
        navigate('/');
    };

    if (location.pathname === '/') return null;

    return (
        <nav className="nav-container">
            {/* Updated Logo with Signature */}
            <div
                onClick={() => navigate('/dashboard')}
                style={{ display: 'flex', alignItems: 'baseline', gap: '6px', cursor: 'pointer' }}
            >
                <span style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                    ✈️ Trip Planner
                </span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
                    by ADJ
                </span>
            </div>

            {/* Existing User Info & Logout */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#e5e7eb', fontWeight: '500' }}>
                  {userName ? `Welcome, ${userName}` : 'Loading...'}
                </span>
                <button onClick={handleLogout} className="btn btn-danger">
                    Sign Out
                </button>
            </div>
        </nav>
    );
}