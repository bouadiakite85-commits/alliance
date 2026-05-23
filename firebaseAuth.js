import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

const loginWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("Utilisateur connecté :", user.displayName);
    }).catch((error) => {
      console.error("Erreur de connexion :", error);
    });
};
