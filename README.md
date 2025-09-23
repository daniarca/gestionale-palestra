### README.md

# 🏋️ asdgympointOS

### Panoramica

**asdgympointOS** è una Single Page Application (SPA) per la gestione completa di un'Associazione Sportiva Dilettantistica (ASD). L'applicazione è progettata per semplificare e digitalizzare le operazioni di segreteria, dall'anagrafica soci alla gestione dei pagamenti e degli orari, fino alla reportistica finanziaria.

### 🎯 Obiettivi Principali

  - **Anagrafica Soci:** Gestione completa di iscritti e staff con dati anagrafici, stato di iscrizione, e documenti.
  - **Gestione Pagamenti:** Registrazione e monitoraggio dei pagamenti mensili e delle quote associative.
  - **Monitoraggio Scadenze:** Notifiche automatiche e filtri rapidi per certificati medici e abbonamenti in scadenza o scaduti.
  - **Dashboard Intuitiva:** Un'interfaccia utente chiara e moderna che fornisce una panoramica immediata delle metriche chiave e delle attività giornaliere.

-----

### 💻 Stack Tecnologico

  - **Frontend:**
      - **React:** La libreria UI principale.
      - **Vite:** Un build tool moderno e veloce.
      - **MUI (Material-UI):** Un sistema di componenti UI robusto e personalizzabile per una grafica coerente.
      - **React Router DOM:** Gestione del routing client-side.
      - **Moment.js:** Libreria per la gestione e la formattazione delle date.
      - **GitHub Actions:** Automazione dei flussi di lavoro (es. test, deploy).
  - **Backend:**
      - **Firebase:** Un'architettura serverless di Google.
      - **Firestore:** Database NoSQL per la memorizzazione dei dati.
      - **Firebase Authentication:** Gestione sicura dell'autenticazione degli utenti.
      - **Firebase Storage:** Archiviazione dei documenti e file caricati dai soci.

-----

### 🚀 Come Iniziare

Segui questi passaggi per avviare il progetto in locale.

**1. Clonare il repository**

```bash
git clone https://github.com/daniarca/gestionale-palestra.git
cd gestionale-palestra
```

**2. Installare le dipendenze**

```bash
npm install
# oppure
yarn install
```

**3. Configurare Firebase**

  - Crea un nuovo progetto su [Firebase Console](https://console.firebase.google.com/).
  - Abilita **Firestore**, **Authentication** e **Storage**.
  - Crea il file di configurazione `src/firebase.js` con le tue credenziali:

<!-- end list -->

```javascript
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

**4. Avviare l'applicazione**

```bash
npm run dev
# oppure
yarn dev
```

L'applicazione sarà disponibile su `http://localhost:5173`.

-----

### 🧩 Struttura del Progetto

Il progetto segue una struttura standard di React con una chiara separazione dei ruoli per i file e le cartelle:

  - `src/pages/`: Componenti che rappresentano intere pagine (es. `DashboardPage.jsx`).
  - `src/components/`: Componenti riutilizzabili e generici (es. `StatCard.jsx`).
  - `src/context/`: Contesti React per la gestione dello stato globale (`AuthContext.jsx`).
  - `src/services/`: Logica di business e interazione con Firebase (`firebaseService.js`).
  - `src/utils/`: Funzioni di utilità pure e helper (`numberToWords.js`).

-----

### 📝 Contribuire

Sentiti libero di aprire Issues o inviare Pull Request per migliorare il progetto. Ogni contributo è ben accetto\!

### Sviluppatore

**Daniele Arcangeli**
