# 🃏 Cards Manager

**Cards Manager** es una aplicación web interactiva diseñada para gestionar partidas de rol o eventos en vivo con mecánicas de juego de cartas inspiradas en *Balatro*.

Construida con **React** y **Firebase**, la aplicación ofrece una experiencia en tiempo real con una estética retro CRT, permitiendo a los jugadores coleccionar cartas, abrir sobres y jugar cartas en una "mesa" compartida que es moderada por un Administrador (Game Master).

## ✨ Características

* **Sistema de Cuentas:** Registro e inicio de sesión de jugadores.
* **Roles:**
  * **Jugador:** Puede abrir sobres, gestionar su inventario, ver su álbum de colección y jugar cartas a la mesa.
  * **Admin (GM):** Puede ver todas las cartas, repartir sobres a todos los jugadores, crear nuevas cartas (con compresión automática de imágenes) y aprobar/rechazar las jugadas en la mesa.
* **Tiempo Real:** Toda la acción (jugar cartas, recibir sobres, actualizaciones de inventario) ocurre en tiempo real gracias a Firestore.
* **Efectos Visuales:**
  * Estética pixel-art / CRT.
  * Cartas con efectos holográficos 3D (Tilt/Glare).
  * Animación de apertura de sobres con partículas.

## 🛠️ Tecnologías

* **Frontend:** React 18, Vite.
* **Backend / BaaS:** Firebase (Authentication, Firestore, Storage).
* **Estilos:** CSS3 puro con variables y animaciones personalizadas.

## 🚀 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### 1. Clonar el repositorio
```bash
git clone [https://github.com/s4mbu/Cards-Manager.git](https://github.com/s4mbu/Cards-Manager.git)
cd cards-manager
```

### 2. Instalar dependencias
npm install

### 3. Configurar Variables de Entorno

El proyecto utiliza Firebase. Por seguridad, las credenciales no están incluidas en el código. Debes crear un archivo .env en la raíz del proyecto.

## Crea un archivo llamado .env.
## Copia el siguiente contenido y reemplaza los valores con los de tu proyecto de Firebase:

```bash
VITE_API_KEY=tu_api_key
VITE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_PROJECT_ID=tu_proyecto
VITE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_MESSAGING_SENDER_ID=tu_sender_id
VITE_APP_ID=tu_app_id
VITE_MEASUREMENT_ID=tu_measurement_id
```

* **Nota:** Asegúrate de habilitar Authentication (Email/Password), Firestore Database y Storage en tu consola de Firebase.

### 3. Ejecutar el proyecto

```bash
npm run dev
```
La aplicación estará disponible en http://localhost:5173.

### 5. Cómo Jugar

```markdown
## 🎮 Cómo Jugar

### Acceso Admin (Game Master)
Para acceder a las funciones de administrador, debes registrarte o iniciar sesión con el correo electrónico reservado (actualmente hardcodeado en `src/App.jsx`):

* **Email:** `admin@example.game`
* **Rol:** Automáticamente obtendrá permisos de administrador y acceso al panel de control.

### Flujo de Juego
1. **Admin:** Desde el panel, reparte packs a los jugadores ("Repartir Packs").
2. **Jugadores:** Reciben una notificación, abren el pack y obtienen cartas aleatorias.
3. **Jugadores:** Seleccionan una carta de su mano para "Jugarla".
4. **Mesa:** La carta aparece en la sección "Mesa de Juego" en estado Pendiente.
5. **Admin:** Aprueba (✔) o Rechaza (✖) la carta. Si se rechaza, la carta vuelve a la mano del jugador.

### 6. Estructura y Notas Finales

## 📂 Estructura del Proyecto

src/
├── components/      # Componentes UI (Card, PackOpener)
├── firebase.js      # Configuración de Firebase
├── App.jsx          # Lógica principal y enrutamiento
├── main.jsx         # Punto de entrada
└── index.css        # Estilos globales y efectos CRT

## ⚠️ Nota sobre Assets
Este proyecto utiliza sprites de Pokémon (vía PokeAPI) como placeholders para las imágenes de las cartas. Para un entorno de producción comercial, se recomienda reemplazar estos assets.
