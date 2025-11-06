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
  const [activeTab, setActiveTab] = useState("profile");
  const [adminName, setAdminName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  // Edit form states
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
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
      setShowEmailForm(false);
      alert('Email updated');
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
      setShowPasswordForm(false);
      alert('Password updated');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        <div className="text-left mb-6">
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <p className="text-gray-600">Logged in as: <span className="font-medium">{adminName}</span></p>
        </div>

        {/* Tabs Navbar */}
        <div className="flex bg-white rounded-xl shadow overflow-hidden border">
          {['profile', 'security', 'notifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center font-medium transition ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-orange-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content Card */}
        <div className="bg-white rounded-xl shadow p-6">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Email</p>
                  <p>{currentEmail}</p>
                </div>
                <button onClick={() => setShowEmailForm(!showEmailForm)} className="text-orange-600 flex items-center gap-1"><Pencil size={16}/> Edit</button>
              </div>

              {showEmailForm && (
                <form onSubmit={handleChangeEmail} className="space-y-3 mt-2">
                  <input className="border p-2 w-full rounded" placeholder="New Email" value={newEmail} onChange={(e)=>setNewEmail(e.target.value)} required/>
                  <input className="border p-2 w-full rounded" type="password" placeholder="Current Password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} required/>
                  <button className="bg-orange-500 text-white p-2 rounded w-full">Save</button>
                </form>
              )}
      
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold flex items-center gap-2"><Lock/> Password</h2>
                <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-orange-600 flex items-center gap-1"><Pencil size={16}/> Edit</button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-3 mt-2">
                  <input className="border p-2 w-full rounded" type="password" placeholder="Current Password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} required/>
                  <input className="border p-2 w-full rounded" type="password" placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required/>
                  <input className="border p-2 w-full rounded" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required/>
                  <button className="bg-orange-500 text-white p-2 rounded w-full">Save</button>
                </form>
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="text-gray-600 text-center">
              Notification preferences coming soon
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="bg-orange-500 text-white w-full p-3 rounded-xl hover:bg-orange-600">Logout</button>
      </div>
    </div>
  );
}
