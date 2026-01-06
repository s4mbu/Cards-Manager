import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const AuthService = {
    login: (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    },

    register: (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    },

    logout: () => {
        return signOut(auth);
    },

    // Generador de email consistente para el sistema
    formatEmail: (username) => {
        return `${username.trim()}@example.game`;
    }
};