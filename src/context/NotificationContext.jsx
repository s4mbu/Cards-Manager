import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationToast } from '../components/ui/NotificationToast'; // Crearemos este componente más adelante

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((title, message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, title, message, type }]);
    }, []);

    const dismissNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification, dismissNotification }}>
            {children}
            <div className="notification-container">
                {notifications.map(notif => (
                    <NotificationToast 
                        key={notif.id} 
                        notification={notif} 
                        onDismiss={() => dismissNotification(notif.id)} 
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);