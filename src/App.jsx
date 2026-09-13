import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import TripRoom from './TripRoom';
import Navbar from './Navbar';

// 1. Create the rotating message component
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
        }, 3500); // Changes message every 3.5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 150,
            textAlign: 'center',
            color: 'white',
            background: 'rgba(17, 24, 39, 0.65)',
            padding: '30px 50px',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '26px', fontWeight: 'bold' }}>
                AI is working its magic
            </h2>
            <p style={{ margin: 0, fontSize: '16px', color: '#9ca3af', fontWeight: '500' }}>
                {messages[msgIndex]}
            </p>
        </div>
    );
};

export default function App() {
    // Check local storage for persistent sessions
    const [userId, setUserId] = useState(() => {
        const saved = localStorage.getItem('tripPlannerUserId');
        return saved ? parseInt(saved, 10) : null;
    });

    // Video State Machine: 'initial-load', 'ready', 'generating'
    const [appPhase, setAppPhase] = useState('initial-load');

    useEffect(() => {
        // Play intro.mp4 for 4 seconds on initial website visit, then show UI
        if (appPhase === 'initial-load') {
            const timer = setTimeout(() => setAppPhase('ready'), 4000);
            return () => clearTimeout(timer);
        }
    }, [appPhase]);

    return (
        <BrowserRouter>
            {/* 1. Initial Load Video */}
            {appPhase === 'initial-load' && (
                <video autoPlay muted playsInline className="video-bg" style={{ zIndex: 100 }}>
                    <source src="/intro.mp4" type="video/mp4" />
                </video>
            )}

            {/* 2. Main Dashboard/Room Background */}
            {appPhase === 'ready' && (
                <video autoPlay loop muted playsInline className="video-bg">
                    <source src="/main-bg.mp4" type="video/mp4" />
                </video>
            )}

            {/* 3. AI Generation Loading Video & Text Overlay */}
            {appPhase === 'generating' && (
                <>
                    <video autoPlay loop muted playsInline className="video-bg" style={{ zIndex: 100 }}>
                        <source src="/generating.mp4" type="video/mp4" />
                    </video>
                    <LoadingOverlay />
                </>
            )}

            <div className="video-overlay"></div>

            {/* Only render the UI when the app is in the 'ready' phase */}
            {appPhase === 'ready' && (
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Navbar userId={userId} setUserId={setUserId} />
                    <Routes>
                        <Route path="/" element={<Login setUserId={setUserId} />} />
                        <Route path="/dashboard" element={userId ? <Dashboard userId={userId} /> : <Navigate to="/" />} />
                        <Route path="/room/:groupId" element={userId ? <TripRoom userId={userId} setAppPhase={setAppPhase} /> : <Navigate to="/" />} />
                    </Routes>
                </div>
            )}
        </BrowserRouter>
    );
}