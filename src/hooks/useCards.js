import { useState, useEffect } from 'react';
import { CardsService } from '../services/cards.service';
import { useNotification } from '../context/NotificationContext';

export const useCards = () => {
    const [allCards, setAllCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();

    // Suscribirse a cambios en las cartas
    useEffect(() => {
        const unsubscribe = CardsService.subscribeToAll((cards) => {
            setAllCards(cards);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const createCard = async (cardData) => {
        try {
            await CardsService.create(cardData);
            addNotification('Carta creada', `${cardData.name} agregada al mazo`, 'success');
            return true;
        } catch (error) {
            addNotification('Error', error.message, 'error');
            return false;
        }
    };

    const deleteCard = async (cardId, cardName) => {
        if (!confirm(`¿Eliminar "${cardName}" permanentemente?`)) return;
        try {
            await CardsService.delete(cardId);
            addNotification('Carta eliminada', `${cardName} fue eliminada del mazo`, 'warning');
        } catch (error) {
            addNotification('Error', error.message, 'error');
        }
    };

    const updateCard = async (cardId, cardData) => {
        try {
            await CardsService.update(cardId, cardData);
            addNotification('Carta actualizada', `${cardData.name} guardada exitosamente`, 'success');
            return true;
        } catch (error) {
            addNotification('Error', error.message, 'error');
            return false;
        }
    };

    const adjustQuantity = async (cardId, delta) => {
        try {
            await CardsService.adjustQuantity(cardId, delta);
        } catch (error) {
            addNotification('Error', error.message, 'error');
        }
    };

    return {
        allCards,
        loading,
        createCard,
        deleteCard,
        updateCard,
        adjustQuantity
    };
};