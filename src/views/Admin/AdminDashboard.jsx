import React, { useState } from 'react';
import { SidebarLayout } from '../../layouts/SidebarLayout';
import { GameTable } from '../../components/game/GameTable';
import { PackOpener } from '../../components/game/PackOpener'; // Importar PackOpener
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../hooks/useGame';
import { useAdmin } from '../../hooks/useAdmin';
import { useCards } from '../../hooks/useCards';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { useNotification } from '../../context/NotificationContext';

import { EditCardModal } from '../../components/modals/EditCardModal';
import { TransferCardModal } from '../../components/modals/TransferCardModal';
import { GivePackModal } from '../../components/modals/GivePackModal';

const AdminDashboard = () => {
    const { user, userData } = useAuth(); // Necesitamos 'user' para el ID
    const { requests, judgeRequest } = useGame();
    const { allUsers, distributePacksToAll, seedDatabase, givePackToPlayer, transferCards } = useAdmin();
    const { allCards, createCard, updateCard, deleteCard, adjustQuantity } = useCards();
    const { addNotification } = useNotification();
    
    const [view, setView] = useState('mesa'); 
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showGivePackModal, setShowGivePackModal] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showPack, setShowPack] = useState(false); // Estado para abrir pack

    // Lógica para que el Admin abra sus propios packs
    const handlePackFinish = async (newCards) => {
        const currentInv = userData.inventory || [];
        const currentCol = userData.collection || [];
        const newInv = [...currentInv, ...newCards];
        const newColSet = new Set([...currentCol, ...newCards.map(c => c.id)]);
        
        await UsersService.updateInventory(user.uid, newInv);
        await UsersService.updateCollection(user.uid, Array.from(newColSet));
        await UsersService.removePack(user.uid);
        
        const quantityUpdates = newCards.map(card => adjustQuantity(card.id, -1));
        await Promise.all(quantityUpdates);
        
        setShowPack(false);
    };

    const handleCreateCard = async (e) => {
        e.preventDefault();
        const form = e.target;
        const file = form.imgFile.files[0];

        if (!file) {
            addNotification('Error', 'Selecciona una imagen', 'error');
            return;
        }

        setUploading(true);

        try {
            const compressImage = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 500;
                            let width = img.width;
                            let height = img.height;

                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            resolve(canvas.toDataURL('image/jpeg', 0.7));
                        };
                        img.onerror = reject;
                    };
                    reader.onerror = reject;
                });
            };

            const compressedBase64 = await compressImage(file);
            if (compressedBase64.length > 1000000) throw new Error("Imagen demasiado grande/compleja.");

            const newCard = {
                name: form.name.value,
                desc: form.desc.value,
                rarity: form.rarity.value,
                quantity: parseInt(form.quantity.value) || 1,
                img: compressedBase64 
            };
            
            await createCard(newCard);
            form.reset();
        } catch (error) {
            addNotification('Error', error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveEdit = async (formData) => {
        if(editingCard) {
            await updateCard(editingCard.id, formData);
            setEditingCard(null);
        }
    };

    const renderSidebarActions = (
        <>
            <Button className={view === 'mesa' ? 'btn-primary' : ''} onClick={() => setView('mesa')}>🎴 MESA</Button>
            <Button className={view === 'deck' ? 'btn-primary' : ''} onClick={() => setView('deck')}>🃏 VER MAZO</Button>
            <Button className={view === 'my-cards' ? 'btn-primary' : ''} onClick={() => setView('my-cards')}>👤 MIS CARTAS</Button>
            
            {/* BOTÓN ROJO DE PACKS PARA ADMIN */}
            {(userData?.packsAvailable > 0) && (
                <div className="notification" onClick={() => setShowPack(true)}>
                    ! {userData.packsAvailable} PACK(S) - ABRIR
                </div>
            )}

            <hr style={{width:'100%', borderColor:'#555'}}/>
            <Button onClick={distributePacksToAll}>🎁 PACKS A TODOS</Button>
            <Button onClick={() => setShowGivePackModal(true)}>🎁 PACK A UNO</Button>
            <Button onClick={() => setShowTransferModal(true)}>🔄 TRANSFERIR</Button>
            <div style={{marginTop: 'auto'}}>
                <Button style={{fontSize: '0.8rem'}} onClick={seedDatabase}>⚠️ SEED DB</Button>
            </div>
        </>
    );

    return (
        <SidebarLayout title="ADMIN PANEL" user={userData} onLogout={AuthService.logout} sidebarActions={renderSidebarActions}>
            
            {/* COMPONENTE DE ABRIR PACKS */}
            {showPack && (
                <PackOpener 
                    onClose={() => setShowPack(false)} 
                    onFinish={handlePackFinish} 
                    cardPool={allCards.filter(c => (c.quantity || 0) > 0)} 
                />
            )}

            {/* VISTA: MESA */}
            {view === 'mesa' && (
                <>
                    <h3 className="mb-4">MI MANO ({(userData?.inventory || []).length} cartas)</h3>
                    <div className="card-grid">
                        {(userData?.inventory || []).length === 0 && <div style={{color:'#aaa'}}>Mano vacía</div>}
                        {(userData?.inventory || []).map((c, idx) => (
                            <Card key={idx} data={c} />
                        ))}
                    </div>

                    <h3 className="mb-4" style={{marginTop: '30px'}}>MESA DE JUEGO ({requests.length})</h3>
                    <GameTable requests={requests} onJudge={judgeRequest} />
                </>
            )}

            {/* VISTA: GESTIÓN DE MAZO (DECK) */}
            {view === 'deck' && (
                <>
                     <h3 className="mb-4">CREADOR DE CARTAS</h3>
                     <div className="panel" style={{maxWidth: '500px', marginBottom: '30px'}}>
                        <form onSubmit={handleCreateCard}>
                            <input name="name" placeholder="Nombre" required />
                            <input name="desc" placeholder="Descripción" required />
                            <label style={{display:'block', marginBottom:'5px'}}>Imagen:</label>
                            <input name="imgFile" type="file" accept="image/*" required style={{color: 'white'}} />
                            <label style={{display:'block', marginBottom:'5px'}}>Cantidad en mazo:</label>
                            <input name="quantity" type="number" min="1" defaultValue="1" required />
                            <select name="rarity">
                                <option value="common">Común</option>
                                <option value="rare">Rara</option>
                                <option value="legendary">Legendaria</option>
                            </select>
                            <Button variant="primary" disabled={uploading} style={{marginTop:'10px', width:'100%'}}>
                                {uploading ? 'PROCESANDO...' : 'CREAR CARTA'}
                            </Button>
                        </form>
                     </div>

                     <h3 className="mb-4">MAZO COMPLETO ({allCards.length} tipos)</h3>
                     <div className="card-grid">
                        {allCards.map(c => (
                            <div key={c.id} className="admin-card-container">
                                <Card data={c} showTooltip={true} />
                                
                                {/* Controles de Cantidad Estilizados */}
                                <div style={{textAlign:'center', marginTop:'10px', display:'flex', gap:'5px', justifyContent:'center', alignItems:'center'}}>
                                    <Button className="btn-sm" onClick={() => adjustQuantity(c.id, -1)} disabled={c.quantity<=0}>-</Button>
                                    <span style={{
                                        background: c.quantity > 0 ? 'rgba(46,204,113,0.3)' : 'rgba(255,77,77,0.3)',
                                        border: `1px solid ${c.quantity > 0 ? '#2ecc71' : '#ff4d4d'}`,
                                        padding: '2px 10px', borderRadius: '4px', minWidth: '30px', textAlign: 'center'
                                    }}>
                                        {c.quantity || 0}
                                    </span>
                                    <Button className="btn-sm" onClick={() => adjustQuantity(c.id, 1)}>+</Button>
                                </div>

                                {/* Botones de Edición */}
                                <div className="admin-controls" style={{marginTop:'10px'}}>
                                    <Button className="btn-sm" onClick={() => setEditingCard(c)}>✏️</Button>
                                    <Button variant="danger" className="btn-sm" onClick={() => deleteCard(c.id, c.name)}>🗑️</Button>
                                </div>
                            </div>
                        ))}
                     </div>
                </>
            )}

            {/* VISTA: MIS CARTAS (Como Admin también eres jugador) */}
            {view === 'my-cards' && (
                <>
                    <h3>MI INVENTARIO</h3>
                    <div className="card-grid">
                        {(userData?.inventory || []).length === 0 && <div style={{color:'#aaa'}}>Vacío</div>}
                        {(userData?.inventory || []).map((c, i) => <Card key={i} data={c} />)}
                    </div>
                </>
            )}

            {/* MODALES */}
            {editingCard && (
                <EditCardModal card={editingCard} onClose={() => setEditingCard(null)} onSave={handleSaveEdit} />
            )}
            {showTransferModal && (
                <TransferCardModal 
                    users={allUsers} 
                    allCards={allCards} 
                    onClose={() => setShowTransferModal(false)} 
                    onTransfer={(uid, cards, action) => {
                        transferCards(uid, cards, action);
                        setShowTransferModal(false);
                    }} 
                />
            )}
            {showGivePackModal && (
                <GivePackModal 
                    users={allUsers} 
                    onClose={() => setShowGivePackModal(false)} 
                    onGivePack={(uid) => {
                        givePackToPlayer(uid);
                        setShowGivePackModal(false);
                    }} 
                />
            )}

        </SidebarLayout>
    );
};

export default AdminDashboard;