import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const TransferCardModal = ({ users, allCards, onClose, onTransfer }) => {
    const [selectedUser, setSelectedUser] = useState('');
    const [action, setAction] = useState('give');
    const [selectedCards, setSelectedCards] = useState([]);
    const [userInventory, setUserInventory] = useState([]);

    useEffect(() => {
        if (selectedUser && action === 'take') {
            const user = users.find(u => u.id === selectedUser);
            setUserInventory(user?.inventory || []);
            setSelectedCards([]);
        }
    }, [selectedUser, action, users]);

    const toggleCardSelection = (card, index = null) => {
        if (action === 'give') {
            const exists = selectedCards.find(c => c.id === card.id);
            if (exists) {
                setSelectedCards(selectedCards.filter(c => c.id !== card.id));
            } else {
                setSelectedCards([...selectedCards, card]);
            }
        } else {
            const cardWithIndex = {...card, inventoryIndex: index};
            const exists = selectedCards.find(c => c.inventoryIndex === index);
            if (exists) {
                setSelectedCards(selectedCards.filter(c => c.inventoryIndex !== index));
            } else {
                setSelectedCards([...selectedCards, cardWithIndex]);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCards.length === 0) {
            alert('Selecciona al menos una carta');
            return;
        }
        onTransfer(selectedUser, selectedCards, action);
    };

    return (
        <Modal title="TRANSFERIR CARTAS" onClose={onClose} className="transfer-modal">
            <form onSubmit={handleSubmit}>
                <label style={{display:'block', marginBottom:'5px'}}>Acción:</label>
                <select value={action} onChange={e => {
                    setAction(e.target.value);
                    setSelectedCards([]);
                }} required>
                    <option value="give">Dar cartas a jugador</option>
                    <option value="take">Quitar cartas a jugador</option>
                </select>

                <label style={{display:'block', marginBottom:'5px', marginTop: '10px'}}>Jugador:</label>
                <select value={selectedUser} onChange={e => {
                    setSelectedUser(e.target.value);
                    setSelectedCards([]);
                }} required>
                    <option value="">Seleccionar jugador...</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>
                            {u.name} {u.role === 'admin' ? '(Admin)' : ''}
                        </option>
                    ))}
                </select>

                {selectedCards.length > 0 && (
                    <div style={{
                        marginTop: '10px', padding: '10px', background: 'rgba(79, 172, 254, 0.2)',
                        borderRadius: '5px', border: '2px solid var(--primary)'
                    }}>
                        <strong>Seleccionadas: {selectedCards.length}</strong>
                    </div>
                )}

                {/* Selección para DAR cartas */}
                {action === 'give' && (
                    <>
                        <label style={{display:'block', marginBottom:'10px', marginTop: '15px'}}>
                            Selecciona las cartas a dar:
                        </label>
                        <div className="card-selection-grid">
                            {allCards.filter(c => c.quantity > 0).map(card => {
                                const isSelected = selectedCards.some(c => c.id === card.id);
                                return (
                                    <div key={card.id} onClick={() => toggleCardSelection(card)}
                                         style={{
                                             cursor: 'pointer', opacity: isSelected ? 1 : 0.6,
                                             transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                             border: isSelected ? '3px solid var(--primary)' : 'none',
                                             borderRadius: '10px', padding: isSelected ? '5px' : '0',
                                             position: 'relative'
                                         }}>
                                        {isSelected && <div style={{position:'absolute', top:'-5px', right:'-5px', background:'var(--primary)', borderRadius:'50%', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10}}>✓</div>}
                                        <Card data={card} showTooltip={false} />
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Selección para QUITAR cartas */}
                {action === 'take' && selectedUser && (
                    <>
                        <label style={{display:'block', marginBottom:'10px', marginTop: '15px'}}>
                            Cartas del jugador:
                        </label>
                        <div className="card-selection-grid">
                            {userInventory.length === 0 ? (
                                <div style={{color: '#aaa', padding: '20px'}}>Este jugador no tiene cartas</div>
                            ) : (
                                userInventory.map((card, idx) => {
                                    const isSelected = selectedCards.some(c => c.inventoryIndex === idx);
                                    return (
                                        <div key={idx} onClick={() => toggleCardSelection(card, idx)}
                                             style={{
                                                 cursor: 'pointer', opacity: isSelected ? 1 : 0.6,
                                                 transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                                 border: isSelected ? '3px solid var(--danger)' : 'none',
                                                 borderRadius: '10px', padding: isSelected ? '5px' : '0',
                                                 position: 'relative'
                                             }}>
                                            {isSelected && <div style={{position:'absolute', top:'-5px', right:'-5px', background:'var(--danger)', borderRadius:'50%', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10}}>✓</div>}
                                            <Card data={card} showTooltip={false} />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                    <Button type="submit" variant="primary" style={{flex: 1}}>
                        {action === 'give' ? `DAR` : `QUITAR`} ({selectedCards.length})
                    </Button>
                    <Button type="button" onClick={onClose} style={{flex: 1}}>CANCELAR</Button>
                </div>
            </form>
        </Modal>
    );
};