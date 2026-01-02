import React, { useState, useEffect } from 'react';
import { Card } from './components/Card';
import { PackOpener } from './components/PackOpener';

// Firebase imports
import { auth, db } from './firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
    collection, doc, setDoc, updateDoc, deleteDoc, 
    onSnapshot, query, orderBy, addDoc 
} from 'firebase/firestore';

// Datos iniciales para seedear la base de datos
// TODO: Reemplazar imágenes de PokeAPI con assets propios
export const INITIAL_CARDS = [
    { name: "Bomb", rarity: "common", desc: "Quema un ticket para añadir +15 Mult.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/100.png" },
    { name: "Document Burn", rarity: "rare", desc: "Destruye figuras y otorga $4.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png" },
    { name: "Steal", rarity: "common", desc: "Roba una carta al azar de otro jugador.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png" },
    { name: "Wild Card", rarity: "legendary", desc: "Actúa como cualquier carta.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png" },
    { name: "Shield", rarity: "common", desc: "Bloquea un efecto negativo.", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" }
];

function App() {
    const [user, setUser] = useState(null); 
    const [userData, setUserData] = useState(null); 
    const [allCards, setAllCards] = useState([]);
    const [requests, setRequests] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [view, setView] = useState('login'); 
    const [isRegistering, setIsRegistering] = useState(false); 
    const [showPack, setShowPack] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Observer de autenticación
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(u => {
            setUser(u);
            if (!u) {
                setUserData(null);
                setView('login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Observer de datos de usuario y roles
    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(data);
                
                // Nota: Lógica temporal para asignar admin basado en email hardcodeado.
                // Idealmente esto debería manejarse con Custom Claims o reglas de backend.
                if (user.email === 'admin@example.game' && data.role !== 'admin') {
                    updateDoc(doc(db, "users", user.uid), { role: 'admin' });
                }
                setView(v => v === 'login' ? (data.role === 'admin' ? 'admin' : 'dashboard') : v);
            } else {
                setDoc(doc(db, "users", user.uid), {
                    name: user.email.split('@')[0],
                    role: user.email === 'admin@example.game' ? 'admin' : 'user',
                    inventory: [],
                    collection: [],
                    packsAvailable: 0
                });
            }
        });
        return () => unsub();
    }, [user]);

    // Observer de Cartas y Solicitudes
    useEffect(() => {
        if (!user) return;
        const qCards = query(collection(db, "cards"));
        const unsubCards = onSnapshot(qCards, (snap) => {
            const cards = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllCards(cards);
        });
        const qReqs = query(collection(db, "requests"), orderBy("timestamp", "desc"));
        const unsubReqs = onSnapshot(qReqs, (snap) => {
            const reqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setRequests(reqs);
        });
        let unsubUsers = () => {};
        if (userData?.role === 'admin') {
            unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
                setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        }
        return () => { unsubCards(); unsubReqs(); unsubUsers(); };
    }, [user, userData?.role]);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        const username = e.target.user.value.trim();
        const password = e.target.pass.value;
        // Dominio dummy para simular usernames simples
        const email = `${username}@example.game`; 
        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name: username, role: 'user', inventory: [], collection: [], packsAvailable: 0
                });
                alert("¡Usuario creado!");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (error) { alert("Error: " + error.message); }
    };

    const handleLogout = () => { signOut(auth); setView('login'); };

    const playCard = async (cardIndex) => {
        if (!confirm("¿Jugar esta carta a la mesa?")) return;
        const cardToPlay = userData.inventory[cardIndex];
        const newInv = [...userData.inventory];
        newInv.splice(cardIndex, 1);
        try {
            await updateDoc(doc(db, "users", user.uid), { inventory: newInv });
            await addDoc(collection(db, "requests"), {
                card: cardToPlay, userId: user.uid, userName: userData.name, timestamp: Date.now(), status: 'pending'
            });
        } catch (e) { alert("Error: " + e.message); }
    };

    const finishPack = async (newCards) => {
        const currentInv = userData.inventory || [];
        const currentCol = userData.collection || [];
        const newInv = [...currentInv, ...newCards];
        const newColSet = new Set([...currentCol, ...newCards.map(c => c.id)]); 
        await updateDoc(doc(db, "users", user.uid), {
            inventory: newInv, collection: Array.from(newColSet), packsAvailable: (userData.packsAvailable || 1) - 1
        });
        setShowPack(false);
    };

    const distributePacks = async () => {
        if (!confirm("¿Dar 1 Pack a TODOS?")) return;
        const updates = allUsers.filter(u => u.role === 'user').map(u => updateDoc(doc(db, "users", u.id), { packsAvailable: (u.packsAvailable || 0) + 1 }));
        await Promise.all(updates);
        alert("Packs repartidos.");
    };

    const judgeRequest = async (reqId, approved, reqData) => {
        try {
            await deleteDoc(doc(db, "requests", reqId));
            if (!approved) {
                const targetUser = allUsers.find(u => u.id === reqData.userId);
                if (targetUser) {
                    const newInv = [...(targetUser.inventory || []), reqData.card];
                    await updateDoc(doc(db, "users", reqData.userId), { inventory: newInv });
                    alert(`Carta devuelta a ${reqData.userName}`);
                }
            }
        } catch (e) { console.error(e); }
    };

    // Función de creación de cartas con compresión de imagen
    const createCard = async (e) => {
        e.preventDefault();
        const form = e.target;
        const file = form.imgFile.files[0]; 

        if (!file) {
            alert("Selecciona una imagen.");
            return;
        }

        setUploading(true);

        try {
            const compressImage = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (event) => {
                        const img = new Image();
                        img.src = event.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 500; 
                            
                            let width = img.width;
                            let height = img.height;

                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }

                            canvas.width = width;
                            canvas.height = height;

                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);

                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                            resolve(dataUrl);
                        };
                        img.onerror = (err) => reject(err);
                    };
                    reader.onerror = (err) => reject(err);
                });
            };

            const compressedBase64 = await compressImage(file);

            // Validar límite de Firestore (~1MB)
            if (compressedBase64.length > 1000000) {
                throw new Error("La imagen es demasiado compleja. Intenta con una más simple o pequeña.");
            }

            const newCard = {
                name: form.name.value,
                desc: form.desc.value,
                rarity: form.rarity.value,
                img: compressedBase64 
            };
            
            await addDoc(collection(db, "cards"), newCard);
            form.reset();
            alert("Carta creada con éxito");
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const seedDatabase = async () => {
        if(!confirm("Se cargarán cartas base. ¿Seguir?")) return;
        for (const c of INITIAL_CARDS) {
            await addDoc(collection(db, "cards"), c);
        }
        alert("Cartas creadas.");
    };

    /* --- VISTAS --- */
    if (loading) return <div className="login-screen">Cargando...</div>;

    if (view === 'login') return (
        <div className="login-screen">
            <h1 style={{fontSize: '3rem', color: '#ff9f43', textShadow: '4px 4px 0 #000'}}>BALATRO MANAGER</h1>
            <div className="panel">
                <h2 style={{marginTop:0, textAlign:'center'}}>{isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}</h2>
                <form onSubmit={handleAuthAction}>
                    <input name="user" placeholder="Usuario (ej: juan)" required />
                    <input name="pass" type="password" placeholder="Contraseña" required />
                    <button className="btn btn-primary w-100">{isRegistering ? 'REGISTRARSE' : 'ENTRAR'}</button>
                </form>
                <div style={{marginTop: '20px', textAlign: 'center', fontSize: '0.9rem'}}>
                    <span style={{color: '#4facfe', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? "Inicia Sesión" : "¿Nuevo jugador? Regístrate aquí"}
                    </span>
                </div>
            </div>
        </div>
    );

    if (userData?.role === 'admin') return (
        <div className="app-container">
            <div className="sidebar">
                <h2>ADMIN PANEL</h2>
                <div style={{color: '#aaa'}}>GM: {userData.name}</div>
                <hr style={{width:'100%', borderColor:'#555'}}/>
                <button className="btn" onClick={distributePacks}>🎁 REPARTIR PACKS</button>
                <button className="btn btn-danger" onClick={handleLogout}>SALIR</button>
                <div style={{marginTop: 'auto'}}>
                    <button className="btn" style={{fontSize: '0.8rem'}} onClick={seedDatabase}>⚠️ SEED DB</button>
                </div>
            </div>
            <div className="main-content">
                <h3 className="mb-4">LA MESA ({requests.length})</h3>
                <div className="table-area">
                    {requests.length === 0 && <span className="table-label">MESA VACÍA</span>}
                    {requests.map(req => (
                        <div key={req.id} style={{textAlign:'center'}}>
                            <div style={{color: '#ff9f43'}}>{req.userName}</div>
                            <Card data={req.card} />
                            <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'10px'}}>
                                <button className="btn btn-success" onClick={() => judgeRequest(req.id, true, req)}>✔</button>
                                <button className="btn btn-danger" onClick={() => judgeRequest(req.id, false, req)}>✖</button>
                            </div>
                        </div>
                    ))}
                </div>

                <h3 className="mb-4">CREADOR DE CARTAS</h3>
                <div className="panel" style={{maxWidth: '500px'}}>
                    <form onSubmit={createCard}>
                        <input name="name" placeholder="Nombre" required />
                        <input name="desc" placeholder="Descripción" required />
                        <label style={{display:'block', marginBottom:'5px'}}>Imagen (Se optimizará):</label>
                        <input name="imgFile" type="file" accept="image/*" required style={{color: 'white'}} />
                        <select name="rarity">
                            <option value="common">Común</option>
                            <option value="rare">Rara</option>
                            <option value="legendary">Legendaria</option>
                        </select>
                        <button className="btn btn-primary" disabled={uploading}>
                            {uploading ? 'PROCESANDO...' : 'CREAR CARTA'}
                        </button>
                    </form>
                </div>

                <h3 className="mb-4" style={{marginTop:'30px'}}>BIBLIOTECA ({allCards.length})</h3>
                <div className="card-grid">
                    {allCards.map(c => <Card key={c.id} data={c} />)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="app-container">
            <div className="sidebar">
                <h2>{userData?.name || 'Jugador'}</h2>
                <hr style={{width:'100%', borderColor:'#555'}}/>
                <button className={`btn ${view === 'dashboard' ? 'btn-primary' : ''}`} onClick={() => setView('dashboard')}>MI MANO</button>
                <button className={`btn ${view === 'collection' ? 'btn-primary' : ''}`} onClick={() => setView('collection')}>ÁLBUM</button>
                {(userData?.packsAvailable > 0) && (
                    <div className="notification" onClick={() => setShowPack(true)}>! PACK DISPONIBLE</div>
                )}
                <div style={{flex:1}}></div>
                <button className="btn btn-danger" onClick={handleLogout}>SALIR</button>
            </div>
            <div className="main-content">
                {showPack && <PackOpener onClose={() => setShowPack(false)} onFinish={finishPack} cardPool={allCards} />}
                {view === 'dashboard' && (
                    <>
                        <h3 className="mb-4">MESA DE JUEGO</h3>
                        <div className="table-area" style={{transform: 'scale(0.8)', width: '125%', transformOrigin: 'top left'}}>
                             {requests.length === 0 && <span className="table-label">...</span>}
                             {requests.map(req => (
                                 <div key={req.id} style={{opacity: 0.8, textAlign: 'center'}}>
                                     <div>{req.userName}</div>
                                     <Card data={req.card} showTooltip={false} />
                                     <span style={{background:'yellow', color:'black', fontSize:'0.8rem'}}>PENDIENTE</span>
                                 </div>
                             ))}
                        </div>
                        <h3 className="mb-4">MI MANO</h3>
                        <div className="card-grid">
                            {(userData?.inventory || []).map((c, idx) => (
                                <div key={idx}>
                                    <Card data={c} onClick={() => playCard(idx)} />
                                    <div style={{textAlign:'center', fontSize:'0.8rem', color:'#aaa'}}>Click para jugar</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {view === 'collection' && (
                    <>
                        <h3 className="mb-4">MI COLECCIÓN</h3>
                        <div className="card-grid">
                            {allCards.map(c => {
                                const owned = (userData?.inventory || []).some(i => i.name === c.name);
                                const collected = (userData?.collection || []).includes(c.id);
                                let st = 'unseen';
                                if (owned) st = 'owned';
                                else if (collected) st = 'collected';
                                return <Card key={c.id} data={c} status={st} />;
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;