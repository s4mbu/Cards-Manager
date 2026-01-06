import React from 'react';

// Un componente Modal genérico para evitar repetir la estructura HTML/CSS del overlay y content
export const Modal = ({ title, children, onClose, className = '' }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${className}`} onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={onClose}>✖</button>
                {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
                {children}
            </div>
        </div>
    );
};