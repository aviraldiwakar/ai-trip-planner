import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.css';

export default function TripRoom({ userId, setAppPhase }) {
    const { groupId } = useParams();
    const [destination, setDestination] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [priorityScore, setPriorityScore] = useState(3);
    const [submittedDestinations, setSubmittedDestinations] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage('');

        const normalizedInput = destination.trim().toLowerCase();
        const isDuplicate = submittedDestinations.some(
            (dest) => dest.toLowerCase() === normalizedInput
        );

        if (isDuplicate) {
            setStatusMessage('Error: You have already added this destination!');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/preferences/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: parseInt(groupId),
                    userId: userId,
                    destinationName: destination.trim(),
                    fromDate: fromDate,
                    toDate: toDate,
                    priorityScore: parseInt(priorityScore)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setStatusMessage(`Error: ${errorData.message}`);
                return;
            }

            setSubmittedDestinations([...submittedDestinations, destination.trim()]);
            setDestination('');
            setStatusMessage('Preference saved successfully!');
        } catch (err) {
            setStatusMessage('Failed to connect to the backend server.');
        }
    };

    const handleFinalizeTrip = async () => {
        setAppPhase('generating');

        try {
            // Future Python AI microservice call goes here
            setTimeout(() => {
                setAppPhase('ready');
            }, 6000);
        } catch (error) {
            console.error("AI Generation failed", error);
            setAppPhase('ready');
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ textAlign: 'center', color: 'white', fontSize: '32px', letterSpacing: '-1px' }}>
                Trip Room #{groupId}
            </h2>
            <p style={{ textAlign: 'center', color: '#e5e7eb', marginBottom: '40px' }}>
                Submit your travel preferences below.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>

                {/* Preference Form using Glass Card */}
                <div className="glass-card">
                    <h3 style={{ marginTop: 0, color: '#1f2937' }}>Add a Destination</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Destination Name</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                required
                                className="input-field"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Start Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    required
                                    className="input-field"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>End Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    required
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>Priority Score (1-5)</label>
                            <input
                                type="number"
                                min="1" max="5"
                                value={priorityScore}
                                onChange={(e) => setPriorityScore(e.target.value)}
                                required
                                className="input-field"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                            Submit Preference
                        </button>
                        {statusMessage && (
                            <p style={{ color: statusMessage.includes('Error') ? '#ef4444' : '#10b981', margin: 0, fontWeight: '500' }}>
                                {statusMessage}
                            </p>
                        )}
                    </form>

                    {submittedDestinations.length > 0 && (
                        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Your Added Destinations:</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563' }}>
                                {submittedDestinations.map((dest, idx) => (
                                    <li key={idx} style={{ marginBottom: '5px' }}>{dest}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* AI Generator Component replaced with direct UI */}
                <div className="glass-card" style={{ alignSelf: 'start' }}>
                    <h3 style={{ marginTop: 0, color: '#1f2937' }}>Ready to generate?</h3>
                    <p style={{ color: '#4b5563', lineHeight: '1.5', marginBottom: '24px' }}>
                        Once everyone has submitted their preferences, click below to lock in the dates and get AI recommendations.
                    </p>
                    <button onClick={handleFinalizeTrip} className="btn btn-success">
                        Finalize Group Trip
                    </button>
                </div>

            </div>
        </div>
    );
}