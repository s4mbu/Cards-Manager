import { db } from '../config/firebase';
import { 
    doc, 
    setDoc, 
    updateDoc, 
    getDoc, 
    onSnapshot,
    collection 
} from 'firebase/firestore';

const COLLECTION_NAME = 'users';

export const UsersService = {
    // Crear perfil inicial
    createProfile: async (uid, username, role = 'user') => {
        return await setDoc(doc(db, COLLECTION_NAME, uid), {
            name: username,
            role: role,
            inventory: [],
            collection: [],
            packsAvailable: 0
        });
    },

    // Obtener perfil (Listener)
    subscribeToProfile: (uid, callback) => {
        return onSnapshot(doc(db, COLLECTION_NAME, uid), (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data());
            } else {
                callback(null);
            }
        });
    },

    // Obtener todos los usuarios (Solo Admin)
    subscribeToAllUsers: (callback) => {
        return onSnapshot(collection(db, COLLECTION_NAME), (snap) => {
            const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(users);
        });
    },

    updateInventory: async (uid, newInventory) => {
        return await updateDoc(doc(db, COLLECTION_NAME, uid), { 
            inventory: newInventory 
        });
    },

    updateCollection: async (uid, newCollection) => {
        return await updateDoc(doc(db, COLLECTION_NAME, uid), { 
            collection: newCollection 
        });
    },
    
    addPack: async (uid) => {
        const userRef = doc(db, COLLECTION_NAME, uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            const current = snap.data().packsAvailable || 0;
            await updateDoc(userRef, { packsAvailable: current + 1 });
        }
    },

    removePack: async (uid) => {
        const userRef = doc(db, COLLECTION_NAME, uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
            const current = snap.data().packsAvailable || 0;
            if (current > 0) {
                await updateDoc(userRef, { packsAvailable: current - 1 });
            }
        }
    }
};