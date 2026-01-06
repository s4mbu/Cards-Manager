import { useState, useEffect } from 'react';
import { UsersService } from '../services/users.service';
import { CardsService } from '../services/cards.service';
import { useNotification } from '../context/NotificationContext';
import { INITIAL_CARDS } from '../models/initialCards';

export const useAdmin = () => {
    const [allUsers, setAllUsers] = useState([]);
    const { addNotification } = useNotification();

    // Suscribirse a todos los usuarios
    useEffect(() => {
        const unsubscribe = UsersService.subscribeToAllUsers((users) => {
            setAllUsers(users);
        });
        return () => unsubscribe();
    }, []);

    const distributePacksToAll = async () => {
        if (!confirm("¿Dar 1 Pack a TODOS los usuarios?")) return;
        try {
            const updates = allUsers.map(u => UsersService.addPack(u.id));
            await Promise.all(updates);
            addNotification('Packs distribuidos', 'Todos los usuarios recibieron un pack', 'success');
        } catch (error) {
            addNotification('Error', error.message, 'error');
        }
    };

    const givePackToPlayer = async (userId) => {
        try {
            await UsersService.addPack(userId);
            const user = allUsers.find(u => u.id === userId);
            addNotification('Pack entregado', `Pack dado a ${user ? user.name : 'jugador'}`, 'success');
        } catch (error) {
            addNotification('Error', error.message, 'error');
        }
    };

    const transferCards = async (userId, cards, action) => {
        try {
            const user = allUsers.find(u => u.id === userId);
            if (!user) return;

            let newInventory = [...(user.inventory || [])];

            if (action === 'give') {
                newInventory = [...newInventory, ...cards];
                await UsersService.updateInventory(userId, newInventory);
                addNotification('Transferencia', `${cards.length} cartas dadas a ${user.name}`, 'success');
            } else if (action === 'take') {
                // Ordenar índices para eliminar sin romper el array
                const sortedCards = [...cards].sort((a, b) => b.inventoryIndex - a.inventoryIndex);
                for (const card of sortedCards) {
                    newInventory.splice(card.inventoryIndex, 1);
                }
                await UsersService.updateInventory(userId, newInventory);
                addNotification('Transferencia', `${cards.length} cartas quitadas de ${user.name}`, 'warning');
            }
        } catch (error) {
            addNotification('Error', error.message, 'error');
        }
    };

    const seedDatabase = async () => {
        if (!confirm("Se cargarán cartas base. ¿Seguir?")) return;
        try {
            for (const c of INITIAL_CARDS) {
                await CardsService.create(c);
            }
            addNotification('Base de datos', 'Cartas iniciales creadas', 'success');
        } catch (error) {
            addNotification('Error', error.message, 'error');
        }
    };

    return {
        allUsers,
        distributePacksToAll,
        givePackToPlayer,
        transferCards,
        seedDatabase
    };
};