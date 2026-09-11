import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TripGenerator from './TripGenerator';

export default function TripRoom({ userId }) {
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

        // Case-Insensitive Duplicate Validation
        const normalizedInput = destination.trim().toLowerCase();
        const isDuplicate = submittedDestinations.some(
            (dest) => dest.toLowerCase() === normalizedInput
        );

        if (isDuplicate) {
            setStatusMessage('Error: You have already added this destination!');
            return;
        }

        // Submit to Java Backend
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

            // Update UI on success
            setSubmittedDestinations([...submittedDestinations, destination.trim()]);
            setDestination('');
            setStatusMessage('Preference saved successfully!');
        } catch (err) {
            setStatusMessage('Failed to connect to the backend server.');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center' }}>Trip Room: #{groupId}</h2>
            <p style={{ textAlign: 'center', color: '#555', marginBottom: '30px' }}>Submit your travel preferences below.</p>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                {/* Preference Form */}
                <div style={{ flex: '1 1 350px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                    <h3>Add a Destination</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Destination Name</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                required
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Start Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>End Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Priority Score (1-5)</label>
                            <input
                                type="number"
                                min="1" max="5"
                                value={priorityScore}
                                onChange={(e) => setPriorityScore(e.target.value)}
                                required
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button type="submit" style={{ padding: '10px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Submit Preference
                        </button>
                        {statusMessage && <p style={{ color: statusMessage.includes('Error') ? 'red' : 'green', margin: 0 }}>{statusMessage}</p>}
                    </form>

                    {submittedDestinations.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <h4>Your Added Destinations:</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {submittedDestinations.map((dest, idx) => (
                                    <li key={idx}>{dest}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* AI Generator Component */}
                <div style={{ flex: '1 1 350px' }}>
                    <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                        <h3 style={{ marginTop: 0 }}>Ready to generate?</h3>
                        <p style={{ color: '#555' }}>Once everyone has submitted their preferences, click below to lock in the dates and get AI recommendations.</p>
                        {/* Pass the groupId dynamically from the URL params */}
                        <TripGenerator groupId={parseInt(groupId)} />
                    </div>
                </div>

            </div>
        </div>
    );
}