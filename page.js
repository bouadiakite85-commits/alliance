import React, { useState, useEffect, useRef } from 'react';
import { db, auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Sun, Moon, Tv, Radio, Send, LogOut, LogIn } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  // Écoute de l'authentification et du Chat Firestore en temps réel
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

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

  // Configuration MediaSession (Contrôle écran de verrouillage téléphone)
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

      navigator.mediaSession.setActionHandler('play', () => { audioRef.current.play(); setIsPlayingRadio(true); });
      navigator.mediaSession.setActionHandler('pause', () => { audioRef.current.pause(); setIsPlayingRadio(false); });
    }
  }, [isPlayingRadio]);

  const handleLogin = () => signInWithPopup(auth, googleProvider).catch(err => console.error(err));
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

  const toggleRadio = () => {
    if (isPlayingRadio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlayingRadio(!isPlayingRadio);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER GLASSMORPHISM */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b p-4 flex items-center justify-between ${darkMode ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ARM Logo" className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" />
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 tracking-wider">ARM NETWORK</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl border transition ${darkMode ? 'border-gray-800 hover:bg-gray-900' : 'border-slate-200 hover:bg-slate-100'}`}>
            {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3 bg-blue-500/10 p-1.5 pr-3 rounded-xl border border-blue-500/20">
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-lg" />
              <button onClick={handleLogout} className="text-xs font-semibold text-red-400 hover:text-red-500 transition flex items-center gap-1">
                <LogOut size={12} /> Quitter
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-white px-4 py-2 rounded-xl font-bold transition shadow-lg shadow-blue-500/20 flex items-center gap-2">
              <LogIn size={16} /> Connexion
            </button>
          )}
        </div>
      </header>

      {/* GRILLE PRINCIPALE */}
      <main className="p-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* FLUX MÉDIAS */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* LECTEUR VIVANT : ARM TV */}
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-500"><Tv size={20} /> ARM TV en Direct</h2>
            <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl">
              {/* Remplacez par votre lien de flux vidéo réel */}
              <iframe className="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/live_stream?channel=VOTRE_ID_CHAINE" frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>

          {/* LECTEUR DESIGN : ARM RADIO */}
          <div className={`p-6 rounded-2xl border text-center relative overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500" />
            <h2 className="text-lg font-bold mb-1 flex justify-center items-center gap-2 text-green-500"><Radio size={20} /> ARM Radio</h2>
            <p className="text-xs text-slate-400 mb-6">Émission en direct 24h/7j</p>
            
            {/* Remplacez par votre lien de flux audio .mp3 ou icecast réel */}
            <audio ref={audioRef} src="https://votre-flux-radio.mp3" preload="none" />
            
            <button onClick={toggleRadio} className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center text-white transition transform active:scale-95 shadow-xl font-bold text-lg ${isPlayingRadio ? 'bg-red-500 shadow-red-500/20 animate-pulse' : 'bg-green-500 shadow-green-500/20'}`}>
              {isPlayingRadio ? "PAUSE" : "ÉCOUTER"}
            </button>
          </div>
        </div>

        {/* CHAT CLOUD TEMPS RÉEL */}
        <div className={`rounded-2xl border flex flex-col h-[600px] sticky top-24 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="p-4 border-b border-gray-800 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Espace de Discussion</span>
          </div>

          {/* Zone des messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 items-start ${msg.uid === user?.uid ? 'flex-row-reverse' : ''}`}>
                <img src={msg.photoURL} alt="" className="w-8 h-8 rounded-xl object-cover" />
                <div className={`p-3 rounded-2xl max-w-[75%] text-sm ${msg.uid === user?.uid ? 'bg-blue-600 text-white rounded-tr-none' : (darkMode ? 'bg-gray-800 text-slate-100 rounded-tl-none' : 'bg-slate-100 text-slate-800 rounded-tl-none')}`}>
                  <p className="text-[10px] font-bold opacity-60 mb-0.5">{msg.displayName}</p>
                  <p className="break-words leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-800 bg-gray-950/20 flex gap-2 rounded-b-2xl">
            {user ? (
              <>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ajouter un message public..." className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-gray-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`} />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition flex items-center justify-center"><Send size={16} /></button>
              </>
            ) : (
              <button type="button" onClick={handleLogin} className="text-xs text-center w-full text-blue-400 font-medium py-2 hover:underline">
                💡 Connectez-vous avec Google pour écrire un message en direct.
              </button>
            )}
          </form>
        </div>

      </main>
    </div>
  );
}
