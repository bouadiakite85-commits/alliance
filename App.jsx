import React, { useState, useEffect } from 'react';
// import { collection, onSnapshot } from "firebase/firestore"; 
// import { db } from './firebase'; // Import de votre config Firebase

export default function ArmMediaApp() {
  const [messages, setMessages] = useState([]);

  // Exemple de connexion temps réel Firebase (Cloud)
  /*
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chat"), (doc) => {
      // Mise à jour en temps réel des données
    });
    return () => unsub();
  }, []);
  */

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* HEADER / NAVIGATION MODERNE */}
      <header className="flex items-center justify-between p-6 bg-gray-800 shadow-lg">
        <div className="flex items-center gap-4">
          {/* LOGO */}
          <img 
            src="/votre-logo.png" // Placez le logo dans le dossier 'public'
            alt="Logo du Projet" 
            className="w-12 h-12 rounded-full border-2 border-blue-500"
          />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            ARM Network
          </h1>
        </div>
        <nav>
          <ul className="flex gap-6 font-semibold">
            <li className="hover:text-blue-400 cursor-pointer transition">Accueil</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Direct</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Chat Temps Réel</li>
          </ul>
        </nav>
      </header>

      <main className="p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* SECTION ARM TV */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📺 ARM TV en Direct
          </h2>
          <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
            {/* Remplacez l'URL par le flux HLS (.m3u8) ou le lien d'intégration de ARM TV */}
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://votre-lien-flux-video-arm-tv.com/embed" 
              frameBorder="0" 
              allow="autoplay; encrypted-media" 
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* SECTION ARM RADIO */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 flex flex-col justify-center items-center">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            📻 ARM Radio
          </h2>
          <div className="w-full bg-gray-700 p-4 rounded-xl shadow-inner text-center">
            <p className="mb-4 text-gray-300">Écoutez le direct 24/7</p>
            {/* Remplacez le src par le flux de stream audio ARM Radio */}
            <audio controls className="w-full">
              <source src="https://votre-lien-flux-audio-arm-radio.mp3" type="audio/mpeg" />
              Votre navigateur ne supporte pas l'élément audio.
            </audio>
          </div>
        </div>

      </main>
    </div>
  );
}
