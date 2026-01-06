import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const GivePackModal = ({ users, onClose, onGivePack }) => {
    const [selectedUser, setSelectedUser] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        onGivePack(selectedUser);
    };

    return (
        <Modal title="DAR PACK A JUGADOR" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <label style={{display:'block', marginBottom:'5px'}}>Selecciona un jugador:</label>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required>
                    <option value="">Seleccionar...</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>
                            {u.name} {u.role === 'admin' ? '(Admin)' : ''} - {u.packsAvailable || 0} packs
                        </option>
                    ))}
                </select>

                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                    <Button type="submit" variant="primary" style={{flex: 1}}>DAR PACK</Button>
                    <Button type="button" onClick={onClose} style={{flex: 1}}>CANCELAR</Button>
                </div>
            </form>
        </Modal>
    );
};