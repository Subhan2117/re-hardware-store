'use client';

import { useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
// ⬇️ Keep your original path; adjust if your structure differs
import { db, googleAuth, emailAuth } from '@/app/api/firebase/firebase.js';

export default function useRegister() {
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleGoogleSignUp = async () => {
    resetMessages();
    setIsGoogleLoading(true);
    try {
      const result = await googleAuth();
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || '',
        email: user.email,
        createdAt: new Date(),
      });

      setSuccess('Signed up successfully with Google!');
      return user;
    } catch (err) {
      setError(err?.message || 'Google sign up failed.');
      return null;
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // onSubmit handler (pass directly to <form onSubmit={onEmailSubmit}>)
  const onEmailSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setIsEmailLoading(true);
    try {
      const result = await emailAuth(email, password);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: fullName,
        email: user.email,
        createdAt: new Date(),
      });

      setSuccess('Account created successfully!');
      return user;
    } catch (err) {
      setError(err?.message || 'Failed to create account.');
      return null;
    } finally {
      setIsEmailLoading(false);
    }
  };

  return {
    // form state + setters
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,

    // status
    error,
    success,
    isGoogleLoading,
    isEmailLoading,

    // actions
    handleGoogleSignUp,
    onEmailSubmit,

    // utility
    resetMessages,
  };
}
