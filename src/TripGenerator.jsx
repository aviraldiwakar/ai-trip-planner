import React, { useState } from 'react';

export default function TripGenerator({ groupId }) {
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateTrip = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8080/api/trips/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: groupId })
            });

            // Parse the JSON even if the response failed so we can read the error
            const data = await response.json();

            if (!response.ok) {
                // Throw the exact message Java sent (e.g., "Overlap Engine: ...")
                throw new Error(data.message || 'Failed to generate trip');
            }

            if (data.aiSuggestions && typeof data.aiSuggestions === 'string') {
                data.aiSuggestions = JSON.parse(data.aiSuggestions);
            }

            setTripData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <button
                onClick={generateTrip}
                disabled={loading}
                style={{ padding: '10px 20px', background: '#2563EB', color: 'white', borderRadius: '5px', cursor: 'pointer', border: 'none' }}
            >
                {loading ? 'Generating Itinerary...' : 'Finalize Group Trip'}
            </button>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            {/* Correctly passing the onRetry and loading props here */}
            {tripData && <TripResults data={tripData} onRetry={generateTrip} loading={loading} />}
        </div>
    );
}

// Updated TripResults with fallback detection and retry button
function TripResults({ data, onRetry, loading }) {
    const ai = data.aiSuggestions;

    // Detect if Python sent the fallback JSON instead of real Gemini data
    const isFallback = ai.top_place_spots && ai.top_place_spots[0] === "Top Rated Local Restaurant";

    const copyToClipboard = async () => {
        const itineraryText = `
✈️ Trip to ${data.winningDestination}
📅 Dates: ${data.commonStartDate} to ${data.commonEndDate}

🌟 AI Travel Insights:
- Best time to visit: ${ai.best_time_to_visit}
${!ai.is_good_time ? `- Warning: ${ai.timing_warning}\n- Alternative: ${ai.alternative_destination} (${ai.alternative_reason})` : ''}

📍 Must-Visit Spots:
${ai.top_place_spots.map(spot => `- ${spot}`).join('\n')}
        `.trim();

        try {
            await navigator.clipboard.writeText(itineraryText);
            alert('Itinerary copied to clipboard!');
        } catch (err) {
            alert('Failed to copy itinerary.');
        }
    };

    return (
        <div style={{ marginTop: '24px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ margin: '0 0 10px 0' }}>Destination: {data.winningDestination}</h2>
                    <p style={{ margin: '0 0 20px 0', color: '#555' }}>
                        Dates: {data.commonStartDate} to {data.commonEndDate}
                    </p>
                </div>
                <button
                    onClick={copyToClipboard}
                    style={{ padding: '8px 16px', background: '#10B981', color: 'white', borderRadius: '5px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }}
                >
                    Copy Itinerary
                </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: '20px' }} />

            <h3 style={{ margin: '0 0 10px 0' }}>AI Travel Insights</h3>

            {/* New Warning Banner for Fallback State */}
            {isFallback && (
                <div style={{ background: '#FEE2E2', padding: '15px', borderRadius: '5px', marginBottom: '15px', color: '#991B1B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>AI Overloaded:</strong> Showing placeholder data.</span>
                    <button
                        onClick={onRetry}
                        disabled={loading}
                        style={{ padding: '5px 10px', background: '#DC2626', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    >
                        {loading ? 'Retrying...' : 'Retry AI'}
                    </button>
                </div>
            )}

            {!ai.is_good_time && !isFallback && (
                <div style={{ background: '#FEF3C7', padding: '15px', borderRadius: '5px', marginBottom: '15px', color: '#92400E' }}>
                    <strong>Warning:</strong> {ai.timing_warning} <br />
                    <strong>Alternative:</strong> {ai.alternative_destination} - {ai.alternative_reason}
                </div>
            )}

            <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: 0 }}><strong>Best time to visit:</strong> {ai.best_time_to_visit}</p>
            </div>

            <div>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Must-Visit Spots:</p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {ai.top_place_spots.map((spot, index) => (
                        <li key={index}>{spot}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}