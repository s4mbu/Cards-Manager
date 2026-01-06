import React from 'react';
import { Button } from '../components/ui/Button';

export const SidebarLayout = ({ title, user, onLogout, sidebarActions, children }) => {
    return (
        <div className="app-container">
            <div className="sidebar">
                <h2>{title}</h2>
                {user && <div style={{color: '#aaa', fontSize: '0.9rem'}}>Usuario: {user.name}</div>}
                <hr style={{width:'100%', borderColor:'#555'}}/>
                
                {/* Acciones dinámicas de la barra lateral */}
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px', width: '100%'}}>
                    {sidebarActions}
                </div>

                <div style={{flex:1}}></div>
                <Button variant="danger" onClick={onLogout}>SALIR</Button>
            </div>
            
            <div className="main-content">
                {children}
            </div>
        </div>
    );
};