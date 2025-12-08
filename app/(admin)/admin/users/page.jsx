'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/app/api/firebase/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Search, User, ShieldCheck, Plus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [roles, setRoles] = useState(['user', 'admin']);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userSnap = await getDocs(collection(db, 'users'));
        const userList = userSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setUsers(userList);

        // collect existing roles from users and merge with defaults
        const existingRoles = Array.from(
          new Set(
            userList
              .map((u) => (u.role || '').toLowerCase())
              .filter(Boolean)
          )
        );
        setRoles((prev) =>
          Array.from(new Set([...prev, ...existingRoles]))
        );
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const lower = searchTerm.toLowerCase();

    return users.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(lower) ||
        u.lastName?.toLowerCase().includes(lower) ||
        u.email?.toLowerCase().includes(lower) ||
        u.role?.toLowerCase().includes(lower)
    );
  }, [users, searchTerm]);

  const handleRoleChange = async (userId, newRole) => {
    if (!newRole) return;
    setUpdatingId(userId);

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      // make sure this role is in the list (in case it was typed in elsewhere later)
      setRoles((prev) =>
        prev.includes(newRole) ? prev : [...prev, newRole]
      );
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    const trimmed = newRole.trim().toLowerCase();
    if (!trimmed) return;

    setRoles((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed]
    );
    setNewRole('');
  };

  const roleBadgeClasses = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') {
      return 'bg-rose-100/70 text-rose-700 border-rose-200';
    }
    if (r === 'advisor') {
      return 'bg-emerald-100/70 text-emerald-700 border-emerald-200';
    }
    if (r === 'manager') {
      return 'bg-amber-100/70 text-amber-700 border-amber-200';
    }
    return 'bg-slate-100/70 text-slate-700 border-slate-200';
  };

  const prettyRole = (role) =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-rose-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-orange-500" />
              <span className="uppercase tracking-wide text-orange-700">
                Admin • User Management
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Users
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage all users and roles for Re&apos;s Hardware Store.
            </p>
          </div>

          {/* Add New Role */}
          <form
            onSubmit={handleAddRole}
            className="flex w-full max-w-md items-center gap-2 rounded-2xl bg-white/70 p-2 shadow-sm backdrop-blur-md border border-white/50"
          >
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500">
                Add new role
              </label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. advisor, manager"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-md hover:shadow-lg transition"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </form>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or role"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border-none bg-transparent py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Users Table / Card */}
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-xl backdrop-blur-2xl">
          <div className="hidden md:block">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-amber-50/80 to-rose-50/80 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Current Role</th>
                  <th className="px-6 py-3 font-medium">Set Role</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100/70 transition hover:bg-slate-50/60"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-100 to-rose-100 text-orange-700 shadow-inner">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                : 'Unnamed User'}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {user.email || '—'}
                      </td>

                      {/* Role badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${roleBadgeClasses(
                            user.role
                          )}`}
                        >
                          {prettyRole(user.role)}
                        </span>
                      </td>

                      {/* Role select */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-1 shadow-sm">
                          <select
                            value={user.role || ''}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            disabled={updatingId === user.id}
                            className="bg-transparent text-xs font-medium text-slate-800 outline-none focus:ring-0"
                          >
                            <option value="" disabled>
                              Select role
                            </option>
                            {roles.map((r) => (
                              <option key={r} value={r}>
                                {prettyRole(r)}
                              </option>
                            ))}
                          </select>
                          {updatingId === user.id && (
                            <span className="ml-2 text-[10px] text-amber-600">
                              Updating...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            {loading ? (
              <div className="py-6 text-center text-sm text-slate-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                No users found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-100 to-rose-100 text-orange-700 shadow-inner">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-900">
                            {user.firstName || user.lastName
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : 'Unnamed User'}
                          </div>
                          <span
                            className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${roleBadgeClasses(
                              user.role
                            )}`}
                          >
                            {prettyRole(user.role)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {user.email || '—'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-[11px] font-medium text-slate-500">
                        Set role
                      </label>
                      <div className="mt-1 inline-flex items-center rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-1 shadow-sm">
                        <select
                          value={user.role || ''}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          disabled={updatingId === user.id}
                          className="bg-transparent text-xs font-medium text-slate-800 outline-none focus:ring-0"
                        >
                          <option value="" disabled>
                            Select role
                          </option>
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {prettyRole(r)}
                            </option>
                          ))}
                        </select>
                        {updatingId === user.id && (
                          <span className="ml-2 text-[10px] text-amber-600">
                            Updating...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
