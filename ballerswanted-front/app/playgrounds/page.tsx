'use client';

import { useEffect, useState } from 'react';

export default function PlaygroundsPage() {

  const [authorized, setAuthorized] =
    useState(false);

  useEffect(() => {

    const token =
      localStorage.getItem(
        'accessToken',
      );

    if (!token) {

      window.location.href = '/';

      return;
    }

    setAuthorized(true);

  }, []);

  function logout() {

    localStorage.removeItem(
      'accessToken',
    );

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
          onClick={logout}
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