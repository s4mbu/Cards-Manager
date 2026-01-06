import { db } from '../config/firebase';
import { 
    collection, 
    addDoc, 
    deleteDoc, 
    updateDoc, 
    doc, 
    getDoc,
    query,
    onSnapshot 
} from 'firebase/firestore';

const COLLECTION_NAME = 'cards';

export const CardsService = {
    // Obtener todas las cartas (Listener)
    subscribeToAll: (callback) => {
        const q = query(collection(db, COLLECTION_NAME));
        return onSnapshot(q, (snapshot) => {
            const cards = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(cards);
        });
    },

    create: async (cardData) => {
        return await addDoc(collection(db, COLLECTION_NAME), cardData);
    },
  
    update: async (id, data) => {
        return await updateDoc(doc(db, COLLECTION_NAME, id), data);
    },

    delete: async (id) => {
        return await deleteDoc(doc(db, COLLECTION_NAME, id));
    },

    // Ajuste atómico de cantidad (Transaccional simple)
    adjustQuantity: async (id, delta) => {
        const cardRef = doc(db, COLLECTION_NAME, id);
        const snap = await getDoc(cardRef);
        if (snap.exists()) {
            const current = snap.data().quantity || 0;
            // Evitar cantidades negativas
            const newQuantity = Math.max(0, current + delta);
            await updateDoc(cardRef, { quantity: newQuantity });
        }
    }
};