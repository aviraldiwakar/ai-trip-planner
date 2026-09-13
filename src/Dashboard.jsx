import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

export default function Dashboard({ userId }) {
    const [joinId, setJoinId] = useState('');
    const [myGroups, setMyGroups] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) return;

        fetch(`http://localhost:8080/api/groups/user/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error("Network response was not OK");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setMyGroups(data);
                } else {
                    setMyGroups([]);
                }
            })
            .catch(err => console.error("Failed to load groups", err));
    }, [userId]);

    const handleCreateTrip = async () => {
        const newGroupId = Math.floor(1000 + Math.random() * 9000);
        try {
            await fetch('http://localhost:8080/api/groups/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: newGroupId, userId: userId })
            });
            navigate(`/room/${newGroupId}`);
        } catch (err) {
            alert("Server error creating trip.");
        }
    };

    const handleJoinTrip = async (e) => {
        e.preventDefault();
        if (!joinId.trim()) return;
        const targetGroupId = parseInt(joinId.trim());

        try {
            await fetch('http://localhost:8080/api/groups/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: targetGroupId, userId: userId })
            });
            navigate(`/room/${targetGroupId}`);
        } catch (err) {
            alert("Server error joining trip.");
        }
    };

    return (
        <>
            <video autoPlay loop muted playsInline className="video-bg">
                <source src="/background.mp4" type="video/mp4" />
            </video>
            <div className="video-overlay"></div>

            <div className="dashboard-container" style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px', letterSpacing: '-1px', color: 'white' }}>
                    Your Travel Hub
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>

                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <h3 style={{ marginTop: 0, fontSize: '20px', color: '#1f2937' }}>Start a New Adventure</h3>
                        <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.5' }}>Create a fresh itinerary and invite your travel group to collaborate.</p>
                        <button onClick={handleCreateTrip} className="btn btn-success">
                            Create New Trip
                        </button>
                    </div>

                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <h3 style={{ marginTop: 0, fontSize: '20px', color: '#1f2937' }}>Join Existing Trip</h3>
                        <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.5' }}>Enter a Group ID to sync up and add your travel preferences.</p>
                        <form onSubmit={handleJoinTrip} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="number"
                                placeholder="e.g. 1234"
                                value={joinId}
                                onChange={(e) => setJoinId(e.target.value)}
                                className="input-field"
                                required
                            />
                            <button type="submit" className="btn btn-primary">
                                Join Trip
                            </button>
                        </form>
                    </div>
                </div>

                {Array.isArray(myGroups) && myGroups.length > 0 && (
                    <div className="glass-card">
                        <h3 style={{ marginTop: 0, borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', color: '#1f2937' }}>Active Trips</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
                            {myGroups.map((group) => (
                                <div
                                    key={group.groupId}
                                    onClick={() => navigate(`/room/${group.groupId}`)}
                                    style={{
                                        padding: '20px',
                                        background: '#f8fafc',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: '1px solid #e2e8f0',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: '#3b82f6',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                                >
                                    Trip Room #{group.groupId}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}