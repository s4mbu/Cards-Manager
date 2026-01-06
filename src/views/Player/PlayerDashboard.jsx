import React, { useState } from 'react';
import { SidebarLayout } from '../../layouts/SidebarLayout';
import { GameTable } from '../../components/game/GameTable';
import { PackOpener } from '../../components/game/PackOpener';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../hooks/useGame';
import { useCards } from '../../hooks/useCards'; 
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

const PlayerDashboard = () => {
    const { user, userData } = useAuth();
    const { requests, playCard } = useGame();
    const { allCards, adjustQuantity } = useCards(); // Importamos adjustQuantity
    
    const [view, setView] = useState('dashboard'); 
    const [showPack, setShowPack] = useState(false);
    
    const handlePackFinish = async (newCards) => {
        const currentInv = userData.inventory || [];
        const currentCol = userData.collection || [];
        const newInv = [...currentInv, ...newCards];
        // Usamos Set para evitar duplicados en la colección visual (Album), pero el inventario sí permite duplicados
        const newColSet = new Set([...currentCol, ...newCards.map(c => c.id)]);
        
        // 1. Actualizar inventario del usuario
        await UsersService.updateInventory(user.uid, newInv);
        // 2. Actualizar álbum del usuario
        await UsersService.updateCollection(user.uid, Array.from(newColSet));
        // 3. Quitar el pack disponible
        await UsersService.removePack(user.uid);
        
        // 4. RESTAR LAS CARTAS DEL MAZO GLOBAL (Base de Datos)
        // Hacemos esto en paralelo para que sea rápido
        const quantityUpdates = newCards.map(card => adjustQuantity(card.id, -1));
        await Promise.all(quantityUpdates);
        
        setShowPack(false);
    };

    const renderSidebarActions = (
        <>
            <Button className={view === 'dashboard' ? 'btn-primary' : ''} onClick={() => setView('dashboard')}>MI MANO</Button>
            <Button className={view === 'collection' ? 'btn-primary' : ''} onClick={() => setView('collection')}>ÁLBUM</Button>
            
            {(userData?.packsAvailable > 0) && (
                <div 
                    className="notification" 
                    onClick={() => setShowPack(true)} 
                >
                    ! {userData.packsAvailable} PACK(S) DISPONIBLE(S)
                </div>
            )}
        </>
    );

    return (
        <SidebarLayout 
            title={userData?.name || 'JUGADOR'} 
            user={userData} 
            onLogout={AuthService.logout}
            sidebarActions={renderSidebarActions}
        >
            {/* Modal de Pack */}
            {showPack && (
                <PackOpener 
                    onClose={() => setShowPack(false)} 
                    onFinish={handlePackFinish} 
                    cardPool={allCards.filter(c => (c.quantity || 0) > 0)} 
                />
            )}

            {view === 'dashboard' && (
                <>
                    <h3 className="mb-4">MESA DE JUEGO</h3>
                    <div style={{transform: 'scale(0.8)', width: '125%', transformOrigin: 'top left'}}>
                        <GameTable requests={requests} readOnly={true} />
                    </div>

                    <h3 className="mb-4" style={{marginTop:'20px'}}>MI MANO ({(userData?.inventory || []).length})</h3>
                    <div className="card-grid">
                        {(userData?.inventory || []).length === 0 ? (
                            <div style={{color: '#aaa', padding: '40px'}}>Esperando cartas...</div>
                        ) : (
                            (userData?.inventory || []).map((c, idx) => (
                                <div key={idx}>
                                    <Card data={c} onClick={() => playCard(idx)} />
                                    <div style={{textAlign:'center', fontSize:'0.8rem', color:'#aaa'}}>Click para jugar</div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {view === 'collection' && (
                <>
                    <h3 className="mb-4">MI COLECCIÓN</h3>
                    <div style={{marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px'}}>
                        <strong>Progreso:</strong> {(userData?.collection || []).length} / {allCards.length} cartas coleccionadas
                        ({Math.round(((userData?.collection || []).length / allCards.length) * 100) || 0}%)
                    </div>
                    <div className="card-grid">
                        {allCards.map(c => {
                            const owned = (userData?.inventory || []).some(i => i.id === c.id);
                            const collected = (userData?.collection || []).includes(c.id);
                            let st = 'unseen';
                            if (owned) st = 'owned';
                            else if (collected) st = 'collected';
                            
                            return <Card key={c.id} data={c} status={st} />;
                        })}
                    </div>
                </>
            )}
        </SidebarLayout>
    );
};

export default PlayerDashboard;