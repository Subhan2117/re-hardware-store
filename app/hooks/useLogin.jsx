// app/hooks/useLogin.jsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/api/login/context/AuthContext';
import { db } from '@/app/api/firebase/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function useLogin() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/store';

  const { login, signInWithGoogle } = useAuth();

  // form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ui
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function ensureUserDoc(user) {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // default user; you can manually change to 'admin' in Firestore
      await setDoc(ref, {
        email: user.email || null,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return 'user';
    } else {
      const data = snap.data();
      await setDoc(
        ref,
        {
          email: user.email || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return data.role || 'user';
    }
  }

  function handlePostLogin(role, mode) {
    if (mode === 'admin') {
      if (role !== 'admin') {
        setError("This account doesn't have admin access.");
        return;
      }
      router.push('/admin/dashboard');
    } else {
      router.push(next);
    }
  }

  const onEmailSubmit = async ({ mode = 'user' } = {}) => {
    setError('');
    setIsEmailLoading(true);
    try {
      const cred = await login(email, password);
      const role = await ensureUserDoc(cred.user);
      handlePostLogin(role, mode);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Failed to log in');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const onGoogleSignIn = async ({ mode = 'user' } = {}) => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const cred = await signInWithGoogle();
      const role = await ensureUserDoc(cred.user);
      handlePostLogin(role, mode);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    isEmailLoading,
    isGoogleLoading,
    onEmailSubmit,
    onGoogleSignIn,
  };
}
