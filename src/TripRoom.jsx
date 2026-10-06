import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './index.css';

export default function TripRoom({ userId, setAppPhase }) {
    const { groupId } = useParams();
    const navigate = useNavigate(); // Hook added to handle the redirection
    const [destination, setDestination] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [priorityScore, setPriorityScore] = useState(3);
    const [submittedDestinations, setSubmittedDestinations] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');

    // AI Loading States
    const [isGenerating, setIsGenerating] = useState(false);
    const [msgIndex, setMsgIndex] = useState(0);

    const messages = [
        "Booting up AI microservices (this may take up to 60s)...",
        "Syncing group travel dates...",
        "Analyzing destination preferences...",
        "Cross-referencing global flight paths...",
        "Crafting your customized itinerary...",
        "Packing the virtual bags...",
        "Booting up AI microservices (this may take up to 60s)..."
    ];

    useEffect(() => {
        let interval;
        if (isGenerating) {
            interval = setInterval(() => {
                setMsgIndex((prev) => (prev + 1) % messages.length);
            }, 3500);
        }
        return () => clearInterval(interval);
    }, [isGenerating, messages.length]);

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
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/preferences/submit`, {
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
            fetchGroupPreferences();

        } catch (err) {
            setStatusMessage('Failed to connect to the backend server.');
        }
    };

    // The finalized live integration function
    // The automatic retry wrapper to handle Render free-tier cold starts
    const fetchWithRetry = async (url, options, retries = 6) => {
        for (let i = 0; i < retries; i++) {
            const response = await fetch(url, options);
            if (response.ok) return response;

            // If it's a Gateway or Timeout error, the Python container is still waking up
            if (response.status === 502 || response.status === 504) {
                console.log(`Waiting for AI microservice to boot... (Attempt ${i + 1}/${retries})`);
                await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
                continue;
            }

            // If it's a real error (like 400 Bad Request), throw immediately
            const errData = await response.json();
            throw new Error(errData.message || "Failed to generate trip");
        }
        throw new Error("AI engine took too long to wake up. Please click finalize again.");
    };

    // The finalized live integration function
    const handleFinalizeTrip = async () => {
        setIsGenerating(true);
        setAppPhase('generating');

        try {
            // 1. Send generation request using the new retry wrapper
            const response = await fetchWithRetry(`${import.meta.env.VITE_BACKEND_URL}/api/trips/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: parseInt(groupId) })
            });

            const data = await response.json();

            // 2. Parse the JSON string received from Python via Java
            const aiData = typeof data.aiSuggestions === 'string'
                ? JSON.parse(data.aiSuggestions)
                : data.aiSuggestions;

            // 3. Shape the payload perfectly for the TripResult page
            const finalPayload = {
                topDestination: data.winningDestination,
                commonDates: {
                    hasOverlap: data.dateOverlapValid,
                    startDate: data.commonStartDate,
                    endDate: data.commonEndDate
                },
                bestMonths: aiData.bestMonths || [],
                datesAligned: aiData.datesAligned,
                mustVisitPlaces: aiData.mustVisitPlaces || [],
                seasonalAdvice: aiData.seasonalAdvice || "",
                alternativeSuggestions: aiData.alternativeSuggestions || []
            };

            // 4. Save to session and redirect
            sessionStorage.setItem(`trip_result_${groupId}`, JSON.stringify(finalPayload));

            setAppPhase('ready'); // Stop the cinematic video
            navigate(`/room/${groupId}/itinerary`); // Redirect to results

        } catch (error) {
            console.error("AI Generation failed", error);
            setStatusMessage(`Error: ${error.message}`);
            setIsGenerating(false);
            setAppPhase('ready');
        }
    };

    const [groupPreferences, setGroupPreferences] = useState([]);

    const fetchGroupPreferences = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/preferences/group/${groupId}`);
            if (response.ok) {
                const data = await response.json();
                setGroupPreferences(data);
            }
        } catch (err) {
            console.error("Failed to load group preferences:", err);
        }
    };

    useEffect(() => {
        fetchGroupPreferences();
    }, [groupId]);

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ textAlign: 'center', color: 'white', fontSize: '32px', letterSpacing: '-1px' }}>
                Trip Room #{groupId}
            </h2>
            <p style={{ textAlign: 'center', color: '#e5e7eb', marginBottom: '40px' }}>
                Submit your travel preferences below.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>

                {/* Preference Form */}
                <div className="glass-card">
                    <h3 style={{ marginTop: 0, color: '#f3f4f6' }}>Add a Destination</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#f3f4f6' }}>Destination Name</label>
                            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required className="input-field" disabled={isGenerating} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#f3f4f6' }}>Start Date</label>
                                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required className="input-field" disabled={isGenerating} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#f3f4f6' }}>End Date</label>
                                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required className="input-field" disabled={isGenerating} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#f3f4f6' }}>Priority Score (1-5)</label>
                            <input type="number" min="1" max="5" value={priorityScore} onChange={(e) => setPriorityScore(e.target.value)} required className="input-field" disabled={isGenerating} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={isGenerating}>
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
                            <h4 style={{ margin: '0 0 10px 0', color: '#f3f4f6' }}>Your Added Destinations:</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#f3f4f6' }}>
                                {submittedDestinations.map((dest, idx) => (
                                    <li key={idx} style={{ marginBottom: '5px' }}>{dest}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* AI Generator Component / Loading State */}
                <div className="glass-card" style={{ alignSelf: 'start', textAlign: isGenerating ? 'center' : 'left' }}>
                    {!isGenerating ? (
                        <>
                            <h3 style={{ marginTop: 0, color: '#f3f4f6' }}>Ready to generate?</h3>
                            <p style={{ color: '#f3f4f6', lineHeight: '1.5', marginBottom: '24px' }}>
                                Once everyone has submitted their preferences, click below to lock in the dates and get AI recommendations.
                            </p>
                            <button onClick={handleFinalizeTrip} className="btn btn-success">
                                Finalize Group Trip
                            </button>
                        </>
                    ) : (
                        <div style={{ padding: '20px 0' }}>
                            <h3 style={{ marginTop: 0, color: '#f3f4f6', marginBottom: '16px' }}>AI is working its magic</h3>
                            <p style={{ color: '#f3f4f6', fontWeight: '500', margin: 0, minHeight: '48px' }}>
                                {messages[msgIndex]}
                            </p>
                            <div style={{ marginTop: '20px', width: '100%', height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: '50%', height: '100%', background: '#3b82f6', animation: 'indeterminate 1.5s infinite linear', borderRadius: '2px' }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Group Submissions List */}
            <div className="glass-card" style={{ marginTop: '30px' }}>
                <h3 style={{ marginTop: 0, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px' }}>
                    Group Submissions
                </h3>

                {groupPreferences.length === 0 ? (
                    <p style={{ color: '#d1d5db', textAlign: 'center', padding: '20px 0' }}>
                        No destinations submitted yet. Be the first!
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                        {groupPreferences.map((pref, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 20px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.15)'
                            }}>
                                <div style={{ color: 'white' }}>
                                    <span style={{ fontWeight: '600', color: '#93c5fd' }}>{pref.userName || 'Member'}</span>
                                    {' '}suggested{' '}
                                    <span style={{ fontWeight: '600' }}>{pref.destinationName}</span>
                                </div>
                                <div style={{ fontSize: '14px', color: '#d1d5db', display: 'flex', gap: '16px' }}>
                                    <span>{pref.fromDate} to {pref.toDate}</span>
                                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: 'white' }}>
                                        Priority: {pref.priorityScore}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes indeterminate {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
}