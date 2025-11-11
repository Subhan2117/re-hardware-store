// app/api/login/context/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleAuth, db } from '../../firebase/firebase'; // adjust path if needed
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

function setRoleCookies(role) {
  if (typeof document === 'undefined') return;

  const maxAge = 60 * 60 * 24 * 5; // 5 days
  document.cookie = `logged_in=true; max-age=${maxAge}; path=/`;
  document.cookie = `role=${encodeURIComponent(role)}; max-age=${maxAge}; path=/`;
}

function clearRoleCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'logged_in=; max-age=0; path=/';
  document.cookie = 'role=; max-age=0; path=/';
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'user' | null
  const [loading, setLoading] = useState(true);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setRole(null);
        clearRoleCookies();
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.data();
        const userRole = data?.role || 'user';

        setRole(userRole);
        setRoleCookies(userRole); // 🔥 keep cookies in sync with role
      } catch (err) {
        console.error('Failed to fetch user role', err);
        setRole('user');
        setRoleCookies('user');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = () => googleAuth();

  const logout = async () => {
    await signOut(auth);
    clearRoleCookies();
    setRole(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    role,
    loading,
    login,
    logout,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
