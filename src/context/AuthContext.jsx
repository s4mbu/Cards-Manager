import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { UsersService } from '../services/users.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    // Iniciamos cargando
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            
            // Si NO hay usuario logueado, dejamos de cargar inmediatamente
            if (!currentUser) {
                setUserData(null);
                setLoading(false);
            }
            // Si HAY usuario, mantenemos loading en true hasta obtener sus datos (ver siguiente useEffect)
        });

        return () => unsubscribeAuth();
    }, []);

    // Segundo efecto: Escuchar datos del usuario
    useEffect(() => {
        if (user) {
            setLoading(true);
            const unsubscribeData = UsersService.subscribeToProfile(user.uid, (data) => {
                setUserData(data);
                setLoading(false); // ¡Datos listos! Dejamos de cargar
            });
            return () => unsubscribeData();
        }
    }, [user]);

    const isAdmin = userData?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, userData, isAdmin, loading }}>
            {/* Renderizamos children SIEMPRE para que el AppRouter decida qué mostrar (Loading/Login/App) */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);