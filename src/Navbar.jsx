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
        fetch(`http://localhost:8080/api/users/${userId}`)
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
            <div
                onClick={() => navigate('/dashboard')}
                style={{ fontSize: '22px', fontWeight: '700', cursor: 'pointer', letterSpacing: '-0.5px' }}
            >
                ✈️ TripPlanner
            </div>

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