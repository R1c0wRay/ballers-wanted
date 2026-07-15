'use client';

import { useEffect } from 'react';

function isTokenExpired(
  token: string,
): boolean {

  try {

    const payload =
      JSON.parse(
        atob(
          token.split('.')[1],
        ),
      );

    return (
      payload.exp * 1000 <
      Date.now()
    );

  } catch {

    return true;
  }
}

export default function HomePage() {

  useEffect(() => {

    function isTokenExpired(
      token: string,
    ): boolean {

      try {

        const payload =
          JSON.parse(
            atob(
              token.split('.')[1],
            ),
          );

        return (
          payload.exp * 1000 <
          Date.now()
        );

      } catch {

        return true;
      }
    }

  }, []);

  useEffect(() => {

    const token =
      localStorage.getItem(
        'accessToken',
      );

    if (!token) {
      return;
    }

    if (isTokenExpired(token)) {

      localStorage.removeItem(
        'accessToken',
      );

      return;
    }

    window.location.href =
      '/playgrounds';

  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">

        <h1 className="text-5xl font-bold mb-4">
          🏀 Ballers Wanted
        </h1>

        <p className="text-slate-300 mb-8">
          Trouve les playgrounds les plus fréquentés.
        </p>

        <div className="flex flex-col gap-4">

          <a href="/register" className="bg-orange-600 hover:bg-orange-500 p-3 rounded font-semibold">
            Créer un compte
          </a>

          <a href="/confirm" className="loginbg-slate-700 hover:bg-slate-600 p-3 rounded font-semibold">
            Se connecter
          </a>

        </div>
      </div>
    </main>
  );
}