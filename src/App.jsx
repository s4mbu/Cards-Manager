import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LoginView } from './views/Auth/LoginView';
import AdminDashboard from './views/Admin/AdminDashboard';
import PlayerDashboard from './views/Player/PlayerDashboard';
import { useCards } from './hooks/useCards'; // Importante invocar esto en un nivel alto si queremos compartir datos, o dentro de cada vista.

// Componente Wrapper para manejar la lógica de ruteo según autenticación
const AppRouter = () => {
  const { user, userData, loading, isAdmin } = useAuth();
  
  // Hook dummy para cargar cartas globalmente si se desea (opcional)
  // useCards(); 

  if (loading) return <div className="login-screen">Cargando sistema...</div>;

  if (!user) {
    return <LoginView />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <PlayerDashboard />;
};

function App() {
  return (
    <NotificationProvider>
        <AuthProvider>
            <div className="scanlines"></div>
            <AppRouter />
        </AuthProvider>
    </NotificationProvider>
  );
}

export default App;