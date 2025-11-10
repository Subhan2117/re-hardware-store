'use client';

import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/api/firebase/firebase';

export default function LogoutPage() {
  useEffect(() => {
    const logout = async () => {
      await signOut(auth);

      // Clear admin cookies
      document.cookie = "logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      window.location.href = '/login';
    };

    logout();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-lg">
      Logging out...
    </div>
  );
}
