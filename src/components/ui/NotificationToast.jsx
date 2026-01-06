import React, { useEffect } from 'react';

export const NotificationToast = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`notification-toast ${notification.type}`} onClick={onDismiss}>
            <div className="notification-content">
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
            </div>
        </div>
    );
};