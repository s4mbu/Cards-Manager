import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const GameTable = ({ requests, onJudge, readOnly = false }) => {
    return (
        <div className="table-area">
            {requests.length === 0 && <span className="table-label">{readOnly ? "..." : "MESA VACÍA"}</span>}
            
            {requests.map(req => (
                <div key={req.id} style={{textAlign:'center', opacity: readOnly ? 0.8 : 1}}>
                    <div style={{color: '#ff9f43', marginBottom: '5px'}}>{req.userName}</div>
                    
                    {/* En modo solo lectura (jugador), quitamos el tooltip para menos ruido visual si se desea */}
                    <Card data={req.card} showTooltip={!readOnly} />
                    
                    {/* Controles para Admin */}
                    {!readOnly && onJudge && (
                        <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'10px'}}>
                            <Button variant="success" className="btn-sm" onClick={() => onJudge(req.id, true, req)}>✔ APROBAR</Button>
                            <Button variant="danger" className="btn-sm" onClick={() => onJudge(req.id, false, req)}>✖ RECHAZAR</Button>
                        </div>
                    )}

                    {/* Etiqueta para Jugador */}
                    {readOnly && (
                        <span style={{
                            background:'yellow', color:'black', fontSize:'0.8rem', 
                            padding: '2px 8px', borderRadius: '3px', display: 'inline-block', marginTop: '5px'
                        }}>
                            PENDIENTE
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};