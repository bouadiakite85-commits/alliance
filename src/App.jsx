import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

// ---------------------------------------------------------
// 1. INITIALISATION FIREBASE (Utilise vos variables Vercel)
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function ArmNetworkApp() {
  // États de l'application
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  // ---------------------------------------------------------
  // 3. GESTION DU DARK MODE (Changement de thème)
  // ---------------------------------------------------------
  toggleDarkMode(() => {
    setDarkMode(!darkMode);
  });

  // ---------------------------------------------------------
  // AUTHENTIFICATION & FLUX TEMPS RÉEL (FIREBASE)
  // ---------------------------------------------------------
  useEffect(() => {
    // Écouter l'état de connexion de l'utilisateur
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Écouter le Chat en temps réel dans le Cloud Firestore
    const q = query(collection(db, "chat_arm"), orderBy("createdAt", "asc"), limit(50));
    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      const msgList = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgList);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeChat();
    };
  }, []);

  const handleLogin = () => signInWithPopup(auth, provider);
  const handleLogout = () => signOut(auth);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await addDoc(collection(db, "chat_arm"), {
      text: newMessage,
      createdAt: new Date(),
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
    setNewMessage("");
  };

  // ---------------------------------------------------------
  // 2. CONTRÔLES ÉCRAN DE VERROUILLAGE (Media Session API)
  // ---------------------------------------------------------
  useEffect(() => {
    if ('mediaSession' in navigator && isPlayingRadio) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'ARM Radio en Direct',
        artist: 'Alliance pour le Rassemblement Malien',
        album: 'ARM Network',
        artwork: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current.play();
        setIsPlayingRadio(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current.pause();
        setIsPlayingRadio(false);
      });
    }
  }, [isPlayingRadio]);

  const toggleRadio = () => {
    if (isPlayingRadio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlayingRadio(!isPlayingRadio);
  };

  function toggleDarkMode() {
    // Cette fonction sera déclenchée par le bouton de thème
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* BARRE DE NAVIGATION GLASSMORPHISM */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b flex items-center justify-between p-4 ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <img src="/votre-logo.png" alt="ARM Logo" className="w-10 h-10 rounded-full border-2 border-blue-500" />
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">ARM NETWORK</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Bouton Dark Mode */}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
            {darkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
          </button>

          {/* Profil / Connexion */}
          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
              <button onClick={handleLogout} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition">Déconnexion</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition shadow-md">
              Se connecter
            </button>
          )}
        </div>
      </header>

      {/* CONTENU PRINCIPAL GRILLE INTERACTIVE */}
      <main className="p-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE MÉDIAS (ARM TV & RADIO) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* LECTEUR VIVANT : ARM TV */}
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">📺 ARM TV en Direct</h2>
            <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg">
              <iframe className="absolute top-0 left-0 w-full h-full" src="https://votre-lien-flux-video-arm-tv.com/embed" frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>

          {/* LECTEUR DESIGN : ARM RADIO */}
          <div className={`p-6 rounded-2xl border text-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <h2 className="text-lg font-bold mb-2 flex justify-center items-center gap-2">📻 ARM Radio</h2>
            <p className="text-sm text-gray-400 mb-4">Flux audio haute qualité en direct</p>
            
            <audio ref={audioRef} src="https://votre-lien-flux-audio-arm-radio.mp3" />
            
            <button onClick={toggleRadio} className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold transition transform active:scale-95 shadow-lg ${isPlayingRadio ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
              {isPlayingRadio ? '⏸️' : '▶️'}
            </button>
          </div>
        </div>

        {/* COLONNE CHAT EN TEMPS RÉEL (FIREBASE) */}
        <div className={`rounded-2xl border flex flex-col h-[600px] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="p-4 border-b border-gray-700 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Discussion en Direct
          </div>

          {/* Fenêtre des messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 items-start ${msg.uid === user?.uid ? 'flex-row-reverse' : ''}`}>
                <img src={msg.photoURL} alt="" className="w-7 h-7 rounded-full" />
                <div className={`p-2.5 rounded-2xl max-w-[75%] text-sm ${msg.uid === user?.uid ? 'bg-blue-600 text-white rounded-tr-none' : (darkMode ? 'bg-gray-700 text-white rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-tl-none')}`}>
                  <p className="text-[10px] opacity-75 font-semibold">{msg.displayName}</p>
                  <p className="mt-0.5">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-700 flex gap-2">
            {user ? (
              <>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Écrivez votre message..." className={`flex-1 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`} />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition">Envoyer</button>
              </>
            ) : (
              <p className="text-xs text-center w-full text-gray-400 py-2">💡 Connectez-vous avec Google pour participer au chat.</p>
            )}
          </form>
        </div>

      </main>
    </div>
  );
}
