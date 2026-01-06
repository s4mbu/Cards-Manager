import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const EditCardModal = ({ card, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: card.name,
        desc: card.desc,
        rarity: card.rarity,
        quantity: card.quantity || 0
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal title="EDITAR CARTA" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Nombre" 
                    required 
                />
                <textarea 
                    value={formData.desc}
                    onChange={e => setFormData({...formData, desc: e.target.value})}
                    placeholder="Descripción" 
                    required
                    rows={3}
                />
                <select 
                    value={formData.rarity}
                    onChange={e => setFormData({...formData, rarity: e.target.value})}
                >
                    <option value="common">Común</option>
                    <option value="rare">Rara</option>
                    <option value="legendary">Legendaria</option>
                </select>
                <label style={{display:'block', marginBottom:'5px'}}>Cantidad en mazo:</label>
                <input 
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    placeholder="Cantidad" 
                    required 
                />
                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <Button type="submit" variant="primary" style={{flex: 1}}>GUARDAR</Button>
                    <Button type="button" variant="danger" onClick={onClose} style={{flex: 1}}>CANCELAR</Button>
                </div>
            </form>
        </Modal>
    );
};