import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

export default function TripResult() {
    const { groupId } = useParams();
    const [tripData, setTripData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pdfMessage, setPdfMessage] = useState('');
    const contentRef = useRef(null);

    useEffect(() => {
        // Fetch the persistent data from the Java database
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/trips/${groupId}`)
            .then(res => {
                if (!res.ok) throw new Error("Trip not found");
                return res.json();
            })
            .then(data => {
                const aiData = typeof data.aiSuggestions === 'string'
                    ? JSON.parse(data.aiSuggestions)
                    : data.aiSuggestions;

                setTripData({
                    topDestination: data.winningDestination || data.finalDestination,
                    commonDates: { startDate: data.startDate, endDate: data.endDate },
                    ...aiData
                });
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [groupId]);

    const handleDownloadPDF = () => {
        if (isLoading) {
            setPdfMessage("⏳ Still generating your itinerary. Please wait...");
            setTimeout(() => setPdfMessage(''), 3000);
            return;
        }

        const element = contentRef.current;
        const opt = {
            margin: 0.5,
            filename: `Trip_Itinerary_${groupId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    const handleCopyInvite = () => {
        const inviteLink = `${window.location.origin}/invite/${groupId}`;
        navigator.clipboard.writeText(inviteLink);
        alert("Invite link copied to clipboard!");
    };

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

            {/* Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={handleCopyInvite} className="btn btn-primary">
                    🔗 Copy Group Invite Link
                </button>

                <div style={{ textAlign: 'right' }}>
                    <button
                        onClick={handleDownloadPDF}
                        className={isLoading ? "btn" : "btn btn-success"}
                        style={{ background: isLoading ? '#6b7280' : '', cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        📄 Download PDF
                    </button>
                    {pdfMessage && <div style={{ color: '#fbbf24', fontSize: '12px', marginTop: '5px' }}>{pdfMessage}</div>}
                </div>
            </div>

            {/* The actual Itinerary Content (This gets captured in the PDF) */}
            <div ref={contentRef} className="glass-card" style={{ background: 'rgba(17, 24, 39, 0.8)', color: 'white', padding: '40px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <h2>Finalizing Database Records...</h2>
                        <div style={{ marginTop: '20px', width: '100%', height: '4px', background: '#374151', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '50%', height: '100%', background: '#3b82f6', animation: 'indeterminate 1.5s infinite linear' }} />
                        </div>
                    </div>
                ) : !tripData ? (
                    <h2 style={{ textAlign: 'center' }}>Trip not found.</h2>
                ) : (
                    <>
                        <h1 style={{ fontSize: '36px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '20px', marginBottom: '30px' }}>
                            Destination: {tripData.topDestination}
                        </h1>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div>
                                <h3 style={{ color: '#93c5fd' }}>Travel Dates</h3>
                                <p>{tripData.commonDates.startDate} to {tripData.commonDates.endDate}</p>
                            </div>
                            <div>
                                <h3 style={{ color: '#93c5fd' }}>Best Months to Visit</h3>
                                <p>{tripData.bestMonths.join(', ')}</p>
                            </div>
                        </div>

                        {!tripData.datesAligned && tripData.seasonalAdvice && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                                <strong style={{ color: '#fca5a5' }}>Weather Warning: </strong>
                                {tripData.seasonalAdvice}
                            </div>
                        )}

                        <h3 style={{ color: '#93c5fd', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>Must-Visit Places</h3>
                        <ul style={{ paddingLeft: '20px', marginBottom: '30px', lineHeight: '1.8' }}>
                            {tripData.mustVisitPlaces.map((place, i) => (
                                <li key={i}>{place}</li>
                            ))}
                        </ul>

                        {tripData.alternativeSuggestions?.length > 0 && (
                            <>
                                <h3 style={{ color: '#93c5fd', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>Better Alternatives for your Dates</h3>
                                {tripData.alternativeSuggestions.map((alt, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                                        <strong style={{ fontSize: '18px' }}>{alt.name}</strong>
                                        <p style={{ margin: '5px 0 0 0', color: '#d1d5db' }}>{alt.reason}</p>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>

            <style>{`
                @keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
            `}</style>
        </div>
    );
}