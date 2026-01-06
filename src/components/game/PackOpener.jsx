import React, { useState } from 'react';
import { Card } from '../ui/Card';

export const PackOpener = ({ onClose, onFinish, cardPool }) => {
    const [stage, setStage] = useState('idle'); // idle, vibrating, dissolving, open
    const [cards, setCards] = useState([]);
    const [particles, setParticles] = useState([]);

    const spawnParticles = (count, x, y) => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 100 + Math.random() * 200;
            const size = 10 + Math.random() * 15;
            
            newParticles.push({
                id: Math.random(),
                x: (x || window.innerWidth / 2) + (Math.random() - 0.5) * 50,
                y: (y || window.innerHeight / 2) + (Math.random() - 0.5) * 50,
                size: size,
                style: {
                    '--tx': `${Math.cos(angle) * velocity}px`,
                    '--ty': `${Math.sin(angle) * velocity}px`,
                    '--rot': `${(Math.random() - 0.5) * 720}deg`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animation: `particle-fly ${0.5 + Math.random() * 0.5}s ease-out forwards`
                }
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => { setParticles(prev => prev.slice(count)); }, 1000);
    };

    const handlePackClick = (e) => {
        if (stage !== 'idle') return;
        setStage('vibrating');
        
        const interval = setInterval(() => { spawnParticles(3, e.clientX, e.clientY); }, 100);

        setTimeout(() => {
            setStage('dissolving');
            clearInterval(interval);
            const finalBurst = setInterval(() => spawnParticles(10), 50);
            setTimeout(() => clearInterval(finalBurst), 500);
        }, 1000);

        setTimeout(() => {
            setStage('open');
            generateCards();
        }, 1600);
    };

    const generateCards = () => {
        const pool = cardPool || [];
        if (pool.length === 0) {
            alert('No hay cartas disponibles en el mazo');
            onClose();
            return;
        }

        const generated = [];
        const availableCards = [...pool];
        
        for (let i = 0; i < 4; i++) {
            if (availableCards.length === 0) break;

            const rand = Math.random();
            let targetRarity = 'common';
            if (rand > 0.95) targetRarity = 'legendary';
            else if (rand > 0.70) targetRarity = 'rare';

            let filtered = availableCards.filter(c => 
                c.rarity === targetRarity && (c.quantity || 0) > 0
            );
            
            if (filtered.length === 0) {
                filtered = availableCards.filter(c => (c.quantity || 0) > 0);
            }

            if (filtered.length === 0) break;

            const selectedCard = filtered[Math.floor(Math.random() * filtered.length)];
            generated.push(selectedCard);

            const cardIndex = availableCards.findIndex(c => c.id === selectedCard.id);
            if (cardIndex !== -1) {
                availableCards[cardIndex] = {
                    ...availableCards[cardIndex],
                    quantity: availableCards[cardIndex].quantity - 1
                };
                if (availableCards[cardIndex].quantity <= 0) {
                    availableCards.splice(cardIndex, 1);
                }
            }
        }

        setCards(generated);
    };

    return (
        <div className="pack-scene">
            {particles.map(p => (
                <div key={p.id} className="particle" style={{ left: p.x, top: p.y, ...p.style }} />
            ))}

            {stage !== 'open' && (
                <div className={`booster-pack ${stage}`} onClick={handlePackClick}>
                    <div className="pack-label" style={{fontSize: '3rem', textShadow: '4px 4px 0 #000', transform: 'rotate(-10deg)'}}>
                        ABRIR<br/>PACK
                    </div>
                </div>
            )}

            {stage === 'open' && (
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px',
                    width: '100%', height: '100%', perspective: '1000px'
                }}>
                    {cards.map((c, i) => (
                        <div key={i} style={{ animation: `fly-out 0.8s ease-out forwards ${i * 0.2}s`, opacity: 0, transform: 'scale(0)' }}>
                            <Card data={c} />
                        </div>
                    ))}
                    
                    <div style={{position:'absolute', bottom:'50px', left:0, right:0, textAlign:'center'}}>
                         <button className="btn btn-primary" onClick={() => onFinish(cards)}>GUARDAR TODO</button>
                    </div>
                </div>
            )}
        </div>
    );
};