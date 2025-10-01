"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { auth, googleAuth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => {
    return googleAuth();
  }

  const value = {
    currentUser,
    login,
    logout: () => signOut(auth),
    signInWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
