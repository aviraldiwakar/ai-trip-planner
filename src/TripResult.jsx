import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function TripResult() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const cached = sessionStorage.getItem(`trip_result_${groupId}`);
        if (cached) {
            setResult(JSON.parse(cached));
        }
    }, [groupId]);

    if (!result) {
        return (
            <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', color: 'white' }}>
                <h2>No Itinerary Found</h2>
                <button onClick={() => navigate(`/room/${groupId}`)} className="btn btn-primary" style={{ marginTop: '20px' }}>
                    Back to Room
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

            {/* Header with Circular Back Arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate(`/room/${groupId}`)}
                    title="Back to Room"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '45px',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '22px',
                        transition: 'background 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    ←
                </button>
                <h2 style={{ color: 'white', margin: 0, fontSize: '32px', letterSpacing: '-1px' }}>
                    Group Consensus & AI Analysis
                </h2>
            </div>

            {/* Consensus Header Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="glass-card">
                    <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#f3f4f6', fontWeight: 'bold' }}>Top Choice</span>
                    <h3 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '24px' }}>{result.topDestination}</h3>
                </div>

                <div className="glass-card">
                    <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#f3f4f6', fontWeight: 'bold' }}>Common Dates</span>
                    <h3 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '20px' }}>
                        {result.commonDates?.hasOverlap
                            ? `${result.commonDates.startDate} to ${result.commonDates.endDate}`
                            : "No Perfect Overlap"}
                    </h3>
                </div>

                <div className="glass-card">
                    <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#f3f4f6', fontWeight: 'bold' }}>Best Season</span>
                    <h3 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '18px' }}>
                        {result.bestMonths?.join(', ') || 'N/A'}
                    </h3>
                </div>
            </div>

            {/* Date Mismatch & Explicit AI Alternative */}
            {!result.datesAligned && result.alternativeSuggestions?.length > 0 && (
                <div className="glass-card" style={{ marginBottom: '30px', borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
                    <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#f3f4f6', fontWeight: 'bold' }}>
                        ⚠️ Seasonal Weather Alert
                    </span>
                    <p style={{ color: '#f3f4f6', marginTop: '8px', marginBottom: '20px', fontSize: '16px' }}>
                        {result.seasonalAdvice}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {result.alternativeSuggestions.map((alt, idx) => (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#f3f4f6', fontSize: '20px' }}>
                                    ✨ AI Suggestion: {alt.name}
                                </h4>
                                <p style={{ margin: 0, color: '#f3f4f6', fontSize: '15px', lineHeight: '1.6' }}>
                                    <strong style={{ color: 'white' }}>Why visit here instead of {result.topDestination}?</strong> {alt.reason}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Must-Visit Highlights */}
            <div className="glass-card" style={{ marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '14px' }}>
                    Must-Visit Attractions in {result.topDestination}
                </h3>
                <ul style={{ color: '#f3f4f6', lineHeight: '1.8', margin: '16px 0 0 0', paddingLeft: '24px' }}>
                    {result.mustVisitPlaces?.map((place, idx) => (
                        <li key={idx} style={{ fontSize: '16px' }}>{place}</li>
                    ))}
                </ul>
            </div>

        </div>
    );
}