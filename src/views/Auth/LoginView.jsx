import React, { useState } from 'react';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { useNotification } from '../../context/NotificationContext';

export const LoginView = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const username = e.target.user.value.trim();
        const password = e.target.pass.value;
        const email = AuthService.formatEmail(username);

        try {
            if (isRegistering) {
                const userCredential = await AuthService.register(email, password);
                // Determinar rol (admin hardcodeado por compatibilidad legacy)
                const isAdmin = email === 'admin@example.game';
                
                await UsersService.createProfile(userCredential.user.uid, username, isAdmin ? 'admin' : 'user');
                addNotification('¡Bienvenido!', `Usuario ${username} creado exitosamente`, 'success');
            } else {
                await AuthService.login(email, password);
                addNotification('¡Hola!', `Bienvenido de vuelta, ${username}`, 'success');
            }
        } catch (error) {
            addNotification('Error de Autenticación', error.message, 'error');
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <h1 style={{fontSize: '3rem', color: '#ff9f43', textShadow: '4px 4px 0 #000'}}>CARDS MANAGER</h1>
            <div className="panel">
                <h2 style={{marginTop:0, textAlign:'center'}}>
                    {isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <input name="user" placeholder="Usuario (ej: juan)" required disabled={loading} />
                    <input name="pass" type="password" placeholder="Contraseña" required disabled={loading} />
                    <button className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'CARGANDO...' : (isRegistering ? 'REGISTRARSE' : 'ENTRAR')}
                    </button>
                </form>
                <div style={{marginTop: '20px', textAlign: 'center', fontSize: '0.9rem'}}>
                    <span 
                        style={{color: '#4facfe', cursor: 'pointer', textDecoration: 'underline'}} 
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering ? "Inicia Sesión" : "¿Nuevo jugador? Regístrate aquí"}
                    </span>
                </div>
            </div>
        </div>
    );
};