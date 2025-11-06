'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Lock, LogOut, Pencil } from 'lucide-react';
import { auth } from '@/app/api/firebase/firebase';
import {
  updateEmail,
  updatePassword,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';

export default function AdminSettings() {
  const [adminName, setAdminName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  // Email edit
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Password edit
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentEmail(user.email);
        setAdminName(user.displayName || 'Admin');
      }
    });

    return () => unsubscribe();
  }, []);

  const reauthenticate = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    return reauthenticateWithCredential(user, credential);
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    try {
      await reauthenticate();
      await updateEmail(auth.currentUser, newEmail);
      setCurrentEmail(newEmail);
      setNewEmail('');
      setShowEmailForm(false);
      alert('Email updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords do not match");
    try {
      await reauthenticate();
      await updatePassword(auth.currentUser, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      alert("Password updated!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Settings</h1>
          <p className="text-gray-600 text-lg">Logged in as: <span className="font-medium">{adminName}</span></p>
        </div>

        {/* Admin Info */}
        <section className="bg-white shadow-md rounded-2xl p-8 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Info</h2>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Email:</p>
              <p className="font-medium text-gray-700">{currentEmail}</p>
            </div>
            <button 
              className="text-orange-600 hover:text-orange-700 flex items-center gap-1"
              onClick={() => setShowEmailForm(true)}
            >
              <Pencil size={16}/> Edit
            </button>
          </div>
        </section>

        {/* Email Form */}
        {showEmailForm && (
          <form onSubmit={handleChangeEmail} className="bg-white shadow-md rounded-2xl p-6 border space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Mail /> Update Email</h3>

            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              required
            />

            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              required
            />

            <div className="flex gap-3">
              <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg">Save</button>
              <button type="button" onClick={() => setShowEmailForm(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        )}

        {/* Password Section */}
        <section className="bg-white shadow-md rounded-2xl p-8 border">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Lock /> Password</h2>
            <button 
              className="text-orange-600 hover:text-orange-700 flex items-center gap-1"
              onClick={() => setShowPasswordForm(true)}
            >
              <Pencil size={16}/> Edit
            </button>
          </div>
        </section>

        {/* Password Form */}
        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="bg-white shadow-md rounded-2xl p-6 border space-y-4">
            <input type="password" placeholder="Current Password" className="w-full px-4 py-3 border rounded-lg"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />

            <input type="password" placeholder="New Password" className="w-full px-4 py-3 border rounded-lg"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />

            <input type="password" placeholder="Confirm Password" className="w-full px-4 py-3 border rounded-lg"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

            <div className="flex gap-3">
              <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg">Save</button>
              <button type="button" onClick={() => setShowPasswordForm(false)} className="flex-1 border py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        )}

        {/* Logout */}
        <section className="bg-white shadow-md rounded-2xl p-8 border border-orange-200 text-center">
          <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2 justify-center"><LogOut /> Logout</h2>
          <button onClick={handleLogout} className="mt-4 w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600">
            Log Out
          </button>
        </section>

      </div>
    </div>
  );
}
