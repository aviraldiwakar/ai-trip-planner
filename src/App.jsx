import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import TripRoom from './TripRoom';
import Navbar from './Navbar';
import TripResult from './TripResult';

// The new bottom-right overlay component
const LoadingOverlay = () => {
    const [msgIndex, setMsgIndex] = useState(0);
    const messages = [
        "Syncing group travel dates...",
        "Analyzing destination preferences...",
        "Cross-referencing global flight paths...",
        "Crafting your customized itinerary...",
        "Packing the virtual bags..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: '40px',
            right: '40px',
            zIndex: 150,
            textAlign: 'right',
            color: 'white',
            background: 'rgba(17, 24, 39, 0.5)',
            padding: '20px 30px',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                AI is working its magic...
            </h3>
            <p style={{ margin: 0, fontSize: '15px', color: '#e5e7eb', fontWeight: '500' }}>
                {messages[msgIndex]}
            </p>
        </div>
    );
}; // Fixed missing closing bracket here

export default function App() {
    const [userId, setUserId] = useState(() => {
        const saved = localStorage.getItem('tripPlannerUserId');
        return saved ? parseInt(saved, 10) : null;
    });

    const [appPhase, setAppPhase] = useState('initial-load');

    useEffect(() => {
        if (appPhase === 'initial-load') {
            const timer = setTimeout(() => setAppPhase('ready'), 4000);
            return () => clearTimeout(timer);
        }
    }, [appPhase]);

    return (
        <BrowserRouter>
            {/* 1. Play ONLY intro video on initial load */}
            {appPhase === 'initial-load' && (
                <video autoPlay loop muted playsInline poster="/intro-poster.png" className="video-bg">
                    <source src="/intro.webm" type="video/webm" />
                    <source src="/intro.mp4" type="video/mp4" />
                </video>
            )}

            {/* 2. Play ONLY main background when ready and navigating the app */}
            {appPhase === 'ready' && (
                <video autoPlay loop muted playsInline poster="/main-poster.png" className="video-bg">
                    <source src="/main-bg.webm" type="video/webm" />
                    <source src="/main-bg.mp4" type="video/mp4" />
                </video>
            )}

            {/* 3. Play ONLY generating video + text overlay when AI is thinking */}
            {appPhase === 'generating' && (
                <>
                    <video autoPlay loop muted playsInline poster="/generating-poster.png" className="video-bg">
                        <source src="/generating.webm" type="video/webm" />
                        <source src="/generating.mp4" type="video/mp4" />
                    </video>
                    <LoadingOverlay />
                </>
            )}

            <div className="video-overlay" style={{ zIndex: -1 }}></div>

            <div className="video-overlay" style={{ zIndex: -1 }}></div>

            <div style={{ position: 'relative', zIndex: 1, display: appPhase === 'ready' ? 'block' : 'none' }}>
                <Navbar userId={userId} setUserId={setUserId} />
                <Routes>
                    <Route path="/" element={<Login setUserId={setUserId} />} />
                    <Route path="/dashboard" element={userId ? <Dashboard userId={userId} /> : <Navigate to="/" />} />
                    <Route path="/room/:groupId" element={userId ? <TripRoom userId={userId} setAppPhase={setAppPhase} /> : <Navigate to="/" />} />
                    <Route path="/room/:groupId/itinerary" element={userId ? <TripResult /> : <Navigate to="/" />} />
                </Routes>
            </div>

            {/* Global Fixed Copyright Footer */}
            <div style={{
                position: 'fixed',
                bottom: '16px',
                right: '24px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '12px',
                fontWeight: '500',
                letterSpacing: '0.5px',
                zIndex: 9999, // Ensures it sits on top of all backgrounds and videos
                userSelect: 'none', // Prevents highlighting/copying
                WebkitUserSelect: 'none',
                pointerEvents: 'none', // Prevents the text from blocking clicks on buttons behind it
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)' // Ensures readability on both light and dark backgrounds
            }}>
                &copy; 2026 Aviral Jain. All rights reserved.
            </div>

        </BrowserRouter>
    );
}