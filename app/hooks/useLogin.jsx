'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/api/login/context/AuthContext';
import { googleAuth } from '@/app/api/firebase/firebase';

export default function useLogin() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') || '/';

  const { login, signInWithGoogle } = useAuth();

  // form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function postSessionLogin({ idToken, mode, pin }) {
    const resp = await fetch('/api/auth/session-login', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ idToken, mode, pin }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error || 'Failed to create session');

    // If admin toggle was on but Pin / role failed, server returns ok:true + adminUnlocked:false
    if (mode === 'admin' && data?.adminUnlocked === false) {
      throw new Error(
        'Admin Pin incorrect or you are not an admin. Logged in as normal user'
      );
    }
  }
  const onEmailSubmit = async (mode = 'user', pin) => {
    setError('');
    setIsEmailLoading(true);
    try {
      const cred = await login(email, password); // firebase sign-in
      const idToken = await cred.user.getIdToken(); // get ID token
      await postSessionLogin({ idToken, mode, pin }); // create __session(+admin unlock)
      router.push(next);
    } catch (err) {
      setError(err?.message || 'Failed to log in: ');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const onGoogleSignIn = async ({ mode = 'user', pin }) => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const cred = await signInWithGoogle();
      const idToken = await cred.user.getIdToken();
      await postSessionLogin({ idToken, mode, pin });

      router.push(next);
    } catch (err) {
      setError(err?.message || 'Google sign-in failed: ');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    // form state
    email,
    setEmail,
    password,
    setPassword,

    // ui state
    showPassword,
    setShowPassword,
    error,
    isEmailLoading,
    isGoogleLoading,

    // actions
    onEmailSubmit,
    onGoogleSignIn,
  };
}
