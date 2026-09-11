import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
                // Ensure we only set the state if Java actually sent an Array
                if (Array.isArray(data)) {
                    setMyGroups(data);
                } else {
                    setMyGroups([]);
                }
            })
            .catch(err => console.error("Failed to load groups", err));
    }, [userId]);

    const handleCreateTrip = async () => {
        // Generate a random 4-digit Group ID for the new trip
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
    }
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
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#111827' }}>Trip Planner Dashboard</h2>

            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>

                {/* Create Trip Card */}
                <div style={{ flex: '1 1 300px', padding: '30px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0 }}>Start a New Adventure</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Create a fresh itinerary and invite your travel group.</p>
                    <button
                        onClick={handleCreateTrip}
                        style={{ padding: '12px 24px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%' }}
                    >
                        Create New Trip
                    </button>
                </div>

                {/* Join Trip Card */}
                <div style={{ flex: '1 1 300px', padding: '30px', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <h3 style={{ marginTop: 0 }}>Join Existing Trip</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Enter a Group ID to add your travel preferences.</p>
                    <form onSubmit={handleJoinTrip} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                            type="number"
                            placeholder="e.g. 1234"
                            value={joinId}
                            onChange={(e) => setJoinId(e.target.value)}
                            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '16px' }}
                            required
                        />
                        <button
                            type="submit"
                            style={{ padding: '12px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%' }}
                        >
                            Join Trip
                        </button>
                    </form>
                </div>
            </div>

            {/* New Active Trips Section */}
            {Array.isArray(myGroups) && myGroups.length > 0 && (
                <div>
                    <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>Your Active Trips</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
                        {myGroups.map((group) => (
                            <div
                                key={group.groupId}
                                onClick={() => navigate(`/room/${group.groupId}`)}
                                style={{ padding: '15px 20px', background: '#f3f4f6', borderRadius: '8px', cursor: 'pointer', border: '1px solid #d1d5db', flex: '1 1 200px', textAlign: 'center', fontWeight: 'bold', color: '#374151' }}
                            >
                                Trip Room #{group.groupId}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}