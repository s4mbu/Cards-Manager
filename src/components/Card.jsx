import React, { useRef } from 'react';

export const Card = ({ data, onClick, status = 'owned', showTooltip = true, style }) => {
    const tiltRef = useRef(null);
    const shineRef = useRef(null);
    const glareRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!tiltRef.current) return;
        const rect = tiltRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        
        // Efecto Tilt 3D
        const rotateY = ((x - cx) / cx) * 20;
        const rotateX = ((y - cy) / cy) * -20;
        
        tiltRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
        tiltRef.current.style.zIndex = 100;

        // Efecto Brillo (Shine & Glare)
        if (shineRef.current && glareRef.current) {
            const percentX = (x / rect.width) * 100;
            const percentY = (y / rect.height) * 100;
            
            shineRef.current.style.opacity = 1;
            glareRef.current.style.opacity = 1;
            
            shineRef.current.style.backgroundPosition = `${percentX}% ${percentY}%`;
            glareRef.current.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.3) 0%, transparent 50%)`;
        }
    };

    const handleMouseLeave = () => {
        if (!tiltRef.current) return;
        tiltRef.current.style.transform = `rotateX(0) rotateY(0) scale(1)`;
        tiltRef.current.style.zIndex = 1;

        if (shineRef.current) shineRef.current.style.opacity = 0;
        if (glareRef.current) glareRef.current.style.opacity = 0;
    };

    let filterClass = '';
    if (status === 'unseen') filterClass = 'card-unseen';
    if (status === 'collected') filterClass = 'card-collected';

    return (
        <div className="card-wrapper" style={style} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => onClick && onClick(data)}>
            <div className={`card-inner rarity-${data.rarity} ${filterClass}`} ref={tiltRef}>
                <div className="clipper">
                    <img src={data.img} className="card-img" alt={data.name} />
                    
                    <div ref={shineRef} className="shine-effect" style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(125deg, transparent 0%, rgba(255, 255, 255, 0.4) 45%, rgba(255, 255, 255, 0.7) 50%, transparent 60%)',
                        backgroundSize: '250% 250%', mixBlendMode: 'overlay', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.1s', zIndex: 10
                    }}></div>
                    <div ref={glareRef} className="glare-effect" style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)',
                        mixBlendMode: 'hard-light', opacity: 0, pointerEvents: 'none', zIndex: 11
                    }}></div>
                </div>

                {showTooltip && (
                    <div className="card-tooltip">
                        <div className="tooltip-header">{data.name}</div>
                        <div className="tooltip-body">{data.desc}</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '5px', color: '#aaa' }}>{data.rarity.toUpperCase()}</div>
                    </div>
                )}
            </div>
        </div>
    );
};