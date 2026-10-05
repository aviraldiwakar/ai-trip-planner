import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


// Sticker component to handle the random placement and delay
const FloatingStickers = ({ destination }) => {
    const stickers = useMemo(() => {
        const isBeach = destination.toLowerCase().includes('goa') || destination.toLowerCase().includes('bali');

        const baseSymbols = isBeach
            ? ['🌴', '⛪', '🏖️', '⛵', '🏄', '⛯', destination, `Explore ${destination}`, 'Sunny Vibes']
            : ['✈️', '🗺️', '📸', '🏛️', '☕', '🚂', destination, `Love ${destination}`, 'Adventure'];

        // Duplicate the array to ensure we have enough stickers to cover a wide desktop monitor
        const symbols = [...baseSymbols, ...baseSymbols];

        return symbols.map((symbol, i) => {
            // Divide the 100vw screen into equal slices based on total stickers
            const sliceWidth = 100 / symbols.length;

            // Force this specific sticker into its assigned slice, with a tiny bit of random padding
            const guaranteedLeftPosition = (i * sliceWidth) + (Math.random() * (sliceWidth * 0.5));

            return {
                id: i,
                content: symbol,
                isText: symbol.length > 2,
                left: `${guaranteedLeftPosition}vw`,
                fontSize: `${Math.random() * 20 + 35}px`,
                animDuration: `${Math.random() * 15 + 25}s`, // Slightly slower drift
                // NEGATIVE delay forces the animation to be active instantly on page load
                animDelay: `-${Math.random() * 30}s`
            };
        });
    }, [destination]);

    return (
        <>
            {stickers.map(sticker => (
                <div
                    key={sticker.id}
                    className={`sticker ${!sticker.isText ? 'sticker-emoji' : ''}`}
                    style={{
                        left: sticker.left,
                        fontSize: sticker.fontSize,
                        animationDuration: sticker.animDuration,
                        animationDelay: sticker.animDelay,
                    }}
                >
                    {sticker.content}
                </div>
            ))}
        </>
    );
};

export default function TripResult() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    // Set a high-quality fallback image just in case the API fails
    const [destinationImage, setDestinationImage] = useState(
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1920&auto=format&fit=crop"
    );

    // 1. Fetch Session Storage Data
    useEffect(() => {
        const cached = sessionStorage.getItem(`trip_result_${groupId}`);
        if (cached) {
            setResult(JSON.parse(cached));
        }
    }, [groupId]);

    // 2. Fetch Dynamic Image from Pixabay (Bulletproof Version)
    useEffect(() => {
        if (!result?.topDestination) return;

        const fetchDynamicImage = async () => {
            // A guaranteed high-res mountain landscape fallback if the API completely fails
            const fallbackImage = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop";

            try {
                const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;

                // Strike 1: Try searching with "landscape" for the best scenic shots
                let query = encodeURIComponent(`${result.topDestination} landscape`);
                let response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal`);
                let data = await response.json();

                // Strike 2: If 0 results, broaden the search to just the destination name
                if (!data.hits || data.hits.length === 0) {
                    query = encodeURIComponent(result.topDestination);
                    response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal`);
                    data = await response.json();
                }

                // Evaluate results
                if (data.hits && data.hits.length > 0) {
                    setDestinationImage(data.hits[0].largeImageURL || data.hits[0].webformatURL);
                } else {
                    console.warn(`No images found on Pixabay for ${result.topDestination}. Using fallback.`);
                    setDestinationImage(fallbackImage);
                }
            } catch (err) {
                console.error("Pixabay fetch failed (likely blocked by adblocker). Using fallback.", err);
                setDestinationImage(fallbackImage);
            }
        };

        fetchDynamicImage();
    }, [result]);

    if (!result) return null;

    return (
        <>
            {/* 1. Full Page Background */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundImage: `url('${destinationImage}')`, /* Added single quotes here */
                backgroundSize: 'cover', backgroundPosition: 'center',
                zIndex: -2,
                transition: 'background-image 1s ease-in-out'
            }} />

            {/* 2. Dark Tint Overlay */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(17,24,39,0.5) 100%)',
                zIndex: 0,
            }} />

            {/* 3. Floating Pencil Stickers */}
            <FloatingStickers destination={result.topDestination} />

            {/* 4. Main UI Container */}
            <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <button
                        onClick={() => navigate(`/room/${groupId}`)}
                        style={{
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', borderRadius: '50%', width: '45px', height: '45px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: '22px', backdropFilter: 'blur(10px)', transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        ←
                    </button>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '32px', fontWeight: '600', letterSpacing: '-0.5px' }}>
                        Group Consensus
                    </h2>
                </div>

                {/* Bento Grid Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

                    {/* Top Choice with Dynamic Image */}
                    <div className="glass-card" style={{ gridRow: 'span 2', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '28px', zIndex: 2 }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Choice</span>
                            <h3 style={{ margin: '8px 0 0 0', fontSize: '42px', fontWeight: '700', color: '#ffffff', letterSpacing: '-1px' }}>
                                {result.topDestination}
                            </h3>
                        </div>
                        <div style={{
                            flex: 1,
                            backgroundImage: `url(${destinationImage})`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            minHeight: '220px', marginTop: '-20px',
                            transition: 'background-image 1s ease-in-out'
                        }} />
                    </div>

                    {/* Dates */}
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Dates</span>
                        <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '600', color: '#ffffff' }}>
                            {result.commonDates?.hasOverlap ? `${result.commonDates.startDate} to ${result.commonDates.endDate}` : "No Overlap"}
                        </h3>
                    </div>

                    {/* Best Season */}
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Best Season</span>
                        <h3 style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '600', color: '#ffffff' }}>
                            {result.bestMonths?.join(', ') || 'N/A'}
                        </h3>
                    </div>
                </div>

                {/* Conditional Weather Alert */}
                {!result.datesAligned && result.alternativeSuggestions?.length > 0 && (
                    <div className="glass-card" style={{ marginBottom: '24px', borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <span style={{ fontSize: '24px' }}>⚠️</span>
                            <h3 style={{ margin: 0, fontSize: '20px', color: '#fcd34d', fontWeight: '600' }}>Seasonal Weather Alert</h3>
                        </div>
                        <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                            {result.seasonalAdvice}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {result.alternativeSuggestions.map((alt, idx) => (
                                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <span style={{ fontWeight: '600', color: '#93c5fd', fontSize: '16px' }}>✨ {alt.name}</span>
                                    <span style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5' }}>{alt.reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Must-Visit */}
                <div className="glass-card">
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Must-Visit Attractions in {result.topDestination}
                    </span>
                    <ul style={{ color: '#e5e7eb', lineHeight: '1.8', margin: '16px 0 0 0', paddingLeft: '20px', fontSize: '16px' }}>
                        {result.mustVisitPlaces?.map((place, idx) => (
                            <li key={idx} style={{ paddingBottom: '8px' }}>{place}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}