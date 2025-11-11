'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleAuth, db } from '../../firebase/firebase';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function clearRoleCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'logged_in=; max-age=0; path=/';
  document.cookie = 'role=; max-age=0; path=/';
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // 🔥 new

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setRole(null);
        clearRoleCookies();
        return;
      }

      // 🔥 fetch role from Firestore users/{uid}
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.data();
        setRole(data?.role || 'user');
      } catch (err) {
        console.error('Failed to fetch user role', err);
        setRole('user');
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = () => {
    return googleAuth();
  };

  const logout = async () => {
    await signOut(auth);
    clearRoleCookies();
    setRole(null);
  };

  const value = {
    currentUser,
    role,              // 🔥 expose role here
    login,
    logout,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
