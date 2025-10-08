'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/api/login/context/AuthContext';
import { googleAuth } from '@/api/firebase/firebase';

export default function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  // form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsEmailLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError('Failed to log in: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsEmailLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await googleAuth();
      router.push('/');
    } catch (err) {
      setError('Google sign-in failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    // form state
    email, setEmail,
    password, setPassword,

    // ui state
    showPassword, setShowPassword,
    error,
    isEmailLoading,
    isGoogleLoading,

    // actions
    onEmailSubmit,
    onGoogleSignIn,
  };
}
