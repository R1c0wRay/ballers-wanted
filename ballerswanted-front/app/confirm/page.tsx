'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = 'http://localhost:3001';
const BLOCK_DURATION = 20 * 1000;

export default function ConfirmPage() {

    const searchParams = useSearchParams();

    const [confirmed, setConfirmed] =
        useState(false);

    const [email, setEmail] =
        useState('');

    const [code, setCode] =
        useState('');

    const [message, setMessage] =
        useState('Activation du compte...');

    const [countdown, setCountdown] =
        useState('');

    useEffect(() => {

        const token =
            searchParams.get('token');

        if (!token) {
            setMessage(
                '❌ Lien de confirmation invalide',
            );
            return;
        }

        confirmAccount(token);

    }, [searchParams]);

    useEffect(() => {
        updateBlockUI();
    }, []);

    async function confirmAccount(
        token: string,
    ) {

        try {

            const res =
                await fetch(
                    `${API_URL}/users/confirm/${token}`,
                    {
                        method: 'POST',
                    },
                );

            const data =
                await res.json();

            if (!res.ok) {

                switch (data.errorCode) {

                    case 'TOKEN_EXPIRED':

                        setMessage(
                            '❌ Votre lien de confirmation a expiré. Veuillez recréer votre compte.'
                        );

                        window.location.href =
                            `/register?expired=true`
                            + `&pseudo=${encodeURIComponent(data.pseudo)}`
                            + `&email=${encodeURIComponent(data.email)}`;

                        return;

                        break;

                    case 'TOKEN_ALREADY_USED':

                        setMessage(
                            '⚠️ Ce lien de confirmation a déjà été utilisé.'
                        );

                        break;

                    case 'TOKEN_NOT_FOUND':

                        setMessage(
                            '❌ Lien de confirmation invalide.'
                        );

                        break;

                    default:

                        setMessage(
                            data.message ??
                            '❌ Impossible de confirmer votre compte.'
                        );
                }

                return;
            }

            setEmail(data.email ?? '');

            setConfirmed(true);

            setMessage(
                '✅ Compte activé',
            );

        } catch {

            setMessage(
                'Erreur serveur',
            );
        }
    }

    async function requestOtp() {

        if (!email?.trim()) {
            setMessage(
                '❌ Email obligatoire',
            );
            return;
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setMessage(
                '❌ Format d’email invalide',
            );
            return;
        }

        const res =
            await fetch(
                `${API_URL}/users/otp/request`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',
                    },

                    body: JSON.stringify({
                        email,
                    }),
                },
            );

        const data =
            await res.json();

        if (!res.ok) {
            handleError(data);
            return;
        }

        setMessage(
            '✅ OTP envoyé par email. Saisissez le code reçu. Il expirera dans 1 minute.',
        );
    }

    async function verifyOtp() {

        const res =
            await fetch(
                `${API_URL}/users/otp/verify`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',
                    },

                    body: JSON.stringify({
                        email,
                        code,
                    }),
                },
            );

        const data =
            await res.json();

        if (!res.ok) {
            handleError(data);
            return;
        }

        localStorage.setItem(
            'accessToken',
            data.accessToken,
        );

        setMessage(
            '✅ Connecté',
        );

        // future navigation
        // router.push('/playgrounds')
    }

    function handleError(data: any) {

        switch (data.errorCode) {

            case 'OTP_INVALID':

                setMessage(
                    '❌ OTP invalide',
                );

                break;

            case 'OTP_MAX_ATTEMPTS':

                setMessage(
                    '⚠️ Dernier essai avant blocage',
                );

                break;

            case 'OTP_BLOCKED':

                setMessage(
                    '🚫 OTP bloqué pendant 20 secondes',
                );

                startBlockTimer();

                break;

            case 'OTP_EXPIRED':

                setMessage(
                    '⏱️ OTP expiré',
                );

                break;

            default:

                setMessage(
                    data.message ??
                    'Erreur',
                );
        }
    }

    function startBlockTimer() {

        const blockedUntil =
            Date.now() + BLOCK_DURATION;

        localStorage.setItem(
            'otpBlockedUntil',
            blockedUntil.toString(),
        );

        updateBlockUI();
    }

    function updateBlockUI() {

        const blockedUntil =
            Number(
                localStorage.getItem(
                    'otpBlockedUntil',
                ),
            );

        if (!blockedUntil) {
            setCountdown('');
            return;
        }

        const interval =
            setInterval(() => {

                const remaining =
                    blockedUntil - Date.now();

                if (remaining <= 0) {

                    localStorage.removeItem(
                        'otpBlockedUntil',
                    );

                    setCountdown('');

                    clearInterval(interval);

                    return;
                }

                const sec =
                    Math.floor(
                        remaining / 1000,
                    );

                const min =
                    Math.floor(sec / 60);

                const seconds =
                    sec % 60;

                setCountdown(
                    `⏳ ${min}:${seconds
                        .toString()
                        .padStart(2, '0')}`,
                );

            }, 1000);
    }

    return (
        <main className="min-h-screen bg-slate-950 text-white flex justify-center items-center">

            <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md">

                <h1 className="text-3xl font-bold text-center mb-6">
                    🏀 Ballers Wanted
                </h1>

                <div className="text-center mb-6">
                    {message}
                </div>

                {confirmed && (

                    <>
                        <h2 className="text-xl font-semibold mb-4">
                            Connexion OTP
                        </h2>

                        <label className="block mb-2 font-medium">
                            Adresse email
                        </label>

                        <input
                            type="email"
                            value={email}
                            readOnly
                            className="
                                w-full
                                p-3
                                rounded
                                bg-slate-200
                                text-black
                                mb-4
                                cursor-not-allowed
                            "
                        />

                        <button
                            onClick={requestOtp}
                            disabled={!!countdown}
                            className="w-full bg-orange-600 p-3 rounded mb-4"
                        >
                            Recevoir un code
                        </button>

                        {countdown && (
                            <div className="text-center mb-4">
                                {countdown}
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder="Code OTP"
                            value={code}
                            onChange={(e) =>
                                setCode(
                                    e.target.value,
                                )
                            }
                            className="
                                w-full
                                p-3
                                rounded
                                bg-white
                                text-black
                                border
                                border-slate-300
                                mb-3
                            "
                        />

                        <button
                            onClick={verifyOtp}
                            disabled={!!countdown}
                            className="w-full bg-orange-600 p-3 rounded"
                        >
                            Se connecter
                        </button>
                    </>
                )}

            </div>

        </main>
    );
}