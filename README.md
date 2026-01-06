# 🎴 Cards Manager - Sistema de Gestión de Cartas Coleccionables

Un sistema completo de gestión de cartas coleccionables con estética retro, inspirado en juegos de cartas modernos. Incluye sistema de packs, mesa de juego en tiempo real, gestión de inventario y colección.

## ✨ Características Principales

### Para Jugadores

- 🎁 **Sistema de Packs**: Abre packs con animaciones espectaculares y efectos de partículas
- 🃏 **Inventario Personal**: Gestiona tu mano de cartas con efectos 3D interactivos
- 📚 **Álbum de Colección**: Rastrea tu progreso con sistema de rareza (Común, Rara, Legendaria)
- 🎮 **Mesa de Juego**: Juega cartas en tiempo real con otros jugadores
- 📊 **Progreso Visual**: Sistema de seguimiento de colección completada

### Para Administradores

- 🛠️ **Creador de Cartas**: Sube imágenes, define rareza y gestiona cantidades
- 📦 **Distribución de Packs**: Da packs individuales o masivos a todos los jugadores
- 🔄 **Transferencia de Cartas**: Sistema completo para dar/quitar cartas a jugadores
- ⚖️ **Mesa de Juego**: Aprueba o rechaza cartas jugadas por los usuarios
- 📈 **Gestión de Mazo**: Control total sobre el pool de cartas disponibles

## 🎨 Características Visuales

- **Efectos CRT Retro**: Scanlines animadas y estética vintage
- **Cartas 3D Interactivas**:
    - Efecto tilt con movimiento del mouse
    - Shine y glare dinámicos
    - Tooltips informativos
- **Animaciones Fluidas**:
    - Apertura de packs con explosión de partículas
    - Transiciones suaves entre vistas
    - Efectos de pulso para cartas legendarias
- **Sistema de Notificaciones**: Toast messages contextuales con autodesaparición

## 🚀 Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Firestore + Authentication + Storage)
- **Estilos**: CSS personalizado con fuente VT323
- **Estado**: Context API (Auth, Notifications)
- **Tiempo Real**: Firestore Realtime Listeners

## 📦 Instalación

bash

````bash
# Clonar el repositorio
git clone https://github.com/s4mbu/Cards-Manager
cd cards-manager

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con las credenciales de Firebase:
VITE_API_KEY=tu_api_key
VITE_AUTH_DOMAIN=tu_auth_domain
VITE_PROJECT_ID=tu_project_id
VITE_STORAGE_BUCKET=tu_storage_bucket
VITE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_APP_ID=tu_app_id
VITE_MEASUREMENT_ID=tu_measurement_id

# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 🎮 Uso

### Primer Inicio
1. Regístrate con usuario y contraseña
2. El primer usuario con email `admin@example.game` será automáticamente Admin
3. El Admin debe usar el botón "SEED DB" para cargar las cartas iniciales

### Como Jugador
1. Espera a recibir packs del administrador
2. Abre tus packs desde el botón rojo de notificación
3. Juega cartas a la mesa haciendo click en ellas
4. Revisa tu álbum para ver tu progreso de colección

### Como Administrador
1. **Crear Cartas**: Sube imagen, define nombre, descripción, rareza y cantidad
2. **Gestionar Mazo**: Ajusta cantidades disponibles (+/-) o edita/elimina cartas
3. **Distribuir Packs**: 
   - Botón "PACKS A TODOS" da 1 pack a cada usuario
   - Botón "PACK A UNO" da pack a jugador específico
4. **Transferir Cartas**: Da o quita cartas específicas a cualquier jugador
5. **Mesa de Juego**: Aprueba ✔ o rechaza ✖ cartas jugadas

## 📁 Estructura del Proyecto
```
src/
├── components/
│   ├── game/           # GameTable, PackOpener
│   ├── modals/         # Modales de edición y transferencia
│   └── ui/             # Componentes reutilizables (Button, Card, Modal)
├── config/
│   └── firebase.js     # Configuración de Firebase
├── context/
│   ├── AuthContext     # Gestión de autenticación
│   └── NotificationContext # Sistema de notificaciones
├── hooks/
│   ├── useAdmin        # Lógica de administrador
│   ├── useCards        # CRUD de cartas
│   └── useGame         # Lógica de mesa de juego
├── layouts/
│   └── SidebarLayout   # Layout con sidebar reutilizable
├── models/
│   └── initialCards    # Cartas de ejemplo para seed
├── services/
│   ├── auth.service    # Autenticación
│   ├── cards.service   # Firestore - Cartas
│   └── users.service   # Firestore - Usuarios
└── views/
    ├── Admin/          # Dashboard de administrador
    ├── Auth/           # Login/Registro
    └── Player/         # Dashboard de jugador
````

## 🔥 Colecciones de Firestore

### `users`

javascript

```javascript
{
  name: string,           // Nombre de usuario
  role: 'user' | 'admin', // Rol del usuario
  inventory: Card[],      // Cartas en mano
  collection: string[],   // IDs de cartas coleccionadas
  packsAvailable: number  // Packs disponibles
}
```

### `cards`

javascript

```javascript
{
  name: string,           // Nombre de la carta
  desc: string,           // Descripción del efecto
  rarity: 'common' | 'rare' | 'legendary',
  img: string,            // Base64 o URL de imagen
  quantity: number        // Cantidad disponible en mazo
}
```

### `requests`

javascript

```javascript
{
  card: Card,             // Carta jugada
  userId: string,         // ID del jugador
  userName: string,       // Nombre del jugador
  timestamp: number,      // Timestamp de la jugada
  status: 'pending'       // Estado de la solicitud
}
```

## 🎯 Características Técnicas

### Optimizaciones

- **Compresión de Imágenes**: Las imágenes se comprimen automáticamente a 500px y 70% calidad
- **Listeners en Tiempo Real**: Sincronización automática con Firestore
- **Protección contra Crashes**: Validación de datos en componentes críticos
- **Lazy Loading**: Carga diferida de componentes pesados

### Seguridad

- Autenticación con Firebase Auth
- Variables de entorno para credenciales
- Validación de roles (Admin/User)
- `.gitignore` configurado para proteger `.env`
