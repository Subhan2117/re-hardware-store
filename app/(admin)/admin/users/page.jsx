'use client';

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/app/api/firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Search, User } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userSnap = await getDocs(collection(db, "users"));
        const userList = userSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
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

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setUpdatingId(userId);

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-gray-500">All users in Re's Hardware Store</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or role"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3">First Name</th>
                <th className="px-6 py-3">Last Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Change Role</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-600" />
                      {user.firstName || "—"}
                    </td>

                    <td className="px-6 py-4">{user.lastName || "—"}</td>
                    <td className="px-6 py-4">{user.email}</td>

                    <td className="px-6 py-4 font-medium capitalize">
                      {user.role}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRoleToggle(user.id, user.role)}
                        disabled={updatingId === user.id}
                        className={`px-3 py-1 rounded text-white font-semibold ${
                          user.role === "admin"
                            ? "bg-orange-500 hover:bg-orange-600"
                            : "bg-orange-200 hover:bg-orange-300"
                        } ${updatingId === user.id && "opacity-60 cursor-not-allowed"}`}
                      >
                        {updatingId === user.id
                          ? "Updating..."
                          : user.role === "admin"
                          ? "Make User"
                          : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
