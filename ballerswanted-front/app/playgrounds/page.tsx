'use client';

import { useEffect, useState } from 'react';

import { getValidToken, logout } from '@/lib/auth.utils';

export default function PlaygroundsPage() {

  const [authorized, setAuthorized] =
    useState(false);

  useEffect(() => {

    const token =
      getValidToken();

    if (!token) {

      window.location.href = '/';

      return;
    }

    setAuthorized(true);

  }, []);

  function handleLogout() {

    logout();

    window.location.href = '/';
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-4xl font-bold mb-4">
          🏀 Ballers Wanted
        </h1>

        <p className="mb-8">
          Connecté avec succès
        </p>

        <button
          onClick={handleLogout}
          className="
            bg-orange-600
            hover:bg-orange-500
            px-6
            py-3
            rounded
            font-semibold
          "
        >
          Déconnexion
        </button>

      </div>

    </main>
  );
}