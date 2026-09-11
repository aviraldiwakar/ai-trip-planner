import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ setUserId }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('tripPlannerUserId');
        setUserId(null);
        navigate('/');
    };

    // Hide Navbar on the login screen
    if (location.pathname === '/') return null;

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: '#111827', color: 'white', marginBottom: '20px' }}>
            <div
                onClick={() => navigate('/dashboard')}
                style={{ fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
                ✈️ AI Trip Planner
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#9CA3AF' }}>Welcome, Aviral</span>
                <button
                    onClick={handleLogout}
                    style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
}