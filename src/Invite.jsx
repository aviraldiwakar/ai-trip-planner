import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Invite({ userId }) {
    const { groupId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            // Save the destination so we remember where to send them after login
            localStorage.setItem('pendingInvite', groupId);
            navigate('/');
        } else {
            // If already logged in, join the group and go to the room
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/groups/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: parseInt(groupId), userId: userId })
            }).then(() => {
                navigate(`/room/${groupId}`);
            }).catch(() => alert("Failed to join group."));
        }
    }, [userId, groupId, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'white' }}>
            <h2>Joining Trip Room #{groupId}...</h2>
        </div>
    );
}