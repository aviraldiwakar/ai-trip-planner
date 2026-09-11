import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import TripRoom from './TripRoom';
import Navbar from './Navbar';
// We will build these two components next:
// import Dashboard from './Dashboard';
// import TripRoom from './TripRoom';

export default function App() {
    const [userId, setUserId] = useState(() => {
        const saved = localStorage.getItem('tripPlannerUserId');
        return saved ? parseInt(saved, 10) : null;
    });

    return (
        <BrowserRouter>
            <Navbar setUserId={setUserId} />
            <Routes>
                <Route path="/" element={<Login setUserId={setUserId} />} />

                {/* Dashboard route is now active */}
                <Route path="/dashboard" element={userId ? <Dashboard userId={userId} /> : <Navigate to="/" />} />

                {/* TripRoom route is now active */}
                <Route path="/room/:groupId" element={userId ? <TripRoom userId={userId} /> : <Navigate to="/" />} />

                {/* <Route path="/room/:groupId" element={userId ? <TripRoom userId={userId} /> : <Navigate to="/" />} /> */}

                {/* Placeholder routes for the next steps. They redirect to login if no userId exists. */}
                {/* <Route path="/dashboard" element={userId ? <Dashboard userId={userId} /> : <Navigate to="/" />} /> */}
                {/* <Route path="/room/:groupId" element={userId ? <TripRoom userId={userId} /> : <Navigate to="/" />} /> */}
            </Routes>
        </BrowserRouter>
    );
}