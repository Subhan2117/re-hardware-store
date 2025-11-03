'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Lock, LogOut } from 'lucide-react';
import { auth } from '@/api/firebase/firebase';
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
  const [newEmail, setNewEmail] = useState('');

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
      alert('Email updated successfully');
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update email");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill out all password fields.');
      return;
    }

    try {
      await reauthenticate();
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert("Password updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update password");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Settings</h1>
          <p className="text-gray-600 text-lg">
            Logged in as: <span className="font-medium">{adminName}</span>
          </p>
        </div>

        <div className="space-y-8">
          {/* Admin Info */}
          <section className="bg-white shadow-md rounded-2xl p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Admin Info</h2>
            <p className="text-gray-500">Current Email:</p>
            <p className="font-medium text-gray-700">{currentEmail}</p>
          </section>

          {/* Change Email */}
          <section className="bg-white shadow-md rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-semibold text-gray-800">Change Email</h2>
            </div>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <input
                type="email"
                placeholder="Enter new email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
              >
                Update Email
              </button>
            </form>
          </section>

          {/* Change Password */}
          <section className="bg-white shadow-md rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-semibold text-gray-800">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
              >
                Update Password
              </button>
            </form>
          </section>

          {/* Logout */}
          <section className="bg-white shadow-md rounded-2xl p-8 border border-orange-200">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-semibold text-orange-600">Logout</h2>
            </div>
            <p className="text-gray-500 mb-4">Sign out of your admin account.</p>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
            >
              Log Out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
