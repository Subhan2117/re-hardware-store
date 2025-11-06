'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleAuth } from '../../firebase/firebase';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}
function clearRoleCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'logged_in=; path=/; max-age=0; path=/';
  document.cookie = 'role=; path=/; max-age=0; path=/';
}


export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) =>
      setCurrentUser(user)
    );
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => {
    return googleAuth();
  };
  const logout = async () => {
    await signOut(auth);
    clearRoleCookies();
  };

  const value = {
    currentUser,
    login,
    logout,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
