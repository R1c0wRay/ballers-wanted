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

    const [showRegisterButton, setShowRegisterButton] =
        useState(false);

    const [unknownEmail, setUnknownEmail] =
        useState('');

    const [accountNotConfirmed, setAccountNotConfirmed] =
        useState(false);


    const [otpCooldown, setOtpCooldown] =
        useState(0);


    useEffect(() => {

        const token =
            searchParams.get('token');

        if (!token) {

            setConfirmed(true);

            setMessage(
                'Connexion'
            );

            return;
        }

        confirmAccount(token);

    }, [searchParams]);

    useEffect(() => {

        const otpAvailableAt =
            Number(
                localStorage.getItem(
                    'otpAvailableAt',
                ),
            );

        if (!otpAvailableAt) {
            return;
        }

        const remaining =
            Math.max(
                0,
                Math.floor(
                    (otpAvailableAt - Date.now()) / 1000,
                ),
            );

        setOtpCooldown(remaining);

    }, []);

    useEffect(() => {

        if (otpCooldown <= 0) {
            return;
        }

        const interval =
            setInterval(() => {

                setOtpCooldown(
                    previous => {

                        if (previous <= 1) {

                            localStorage.removeItem(
                                'otpAvailableAt',
                            );

                            clearInterval(interval);

                            return 0;
                        }

                        return previous - 1;
                    },
                );

            }, 1000);

        return () =>
            clearInterval(interval);

    }, [otpCooldown]);

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
                        email: email.trim().toLowerCase(),
                    }),
                },
            );

        const data =
            await res.json();

        if (!res.ok) {
            handleError(data);
            return;
        }

        const availableAt =
            Date.now() + 60 * 1000;

        localStorage.setItem(
            'otpAvailableAt',
            availableAt.toString(),
        );

        setOtpCooldown(60);

        setMessage(
            '✅ OTP envoyé par email. Le code est valable 1 minute.'
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
                        email: email.trim().toLowerCase(),
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

        window.location.href =
            '/playgrounds';
    }

    function handleError(data: any) {

        switch (data.errorCode) {

            case 'USER_NOT_FOUND':

                setUnknownEmail(email);

                setShowRegisterButton(true);

                setMessage(
                    '❌ Aucun compte actif n’est associé à cette adresse email'
                );

                break;

            case 'ACCOUNT_NOT_CONFIRMED':

                setAccountNotConfirmed(true);

                setMessage(
                    '⚠️ Votre compte n’est pas encore activé. Vérifiez votre boîte email et cliquez sur le lien de confirmation.'
                );

                break;

            case 'CONFIRMATION_LINK_RESENT':

                setMessage(
                    '✅ Votre lien de confirmation avait expiré. Votre compte n’est pas encore actif. Un nouvel email vient de vous être envoyé.'
                );

                break;

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

                {
                    showRegisterButton && (

                        <button
                            type="button"
                            onClick={() => {

                                window.location.href =
                                    `/register?email=${encodeURIComponent(
                                        unknownEmail,
                                    )}`;
                            }}
                            className="
                                mb-6
                                w-full
                                bg-orange-600
                                hover:bg-orange-500
                                p-3
                                rounded
                                font-semibold
                            "
                        >
                            Créer un compte
                        </button>

                    )
                }

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
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            readOnly={
                                !!searchParams.get('token')
                            }
                            className="
                                w-full
                                p-3
                                rounded
                                bg-white
                                text-black
                                mb-4
                            "
                        />

                        <button
                            onClick={requestOtp}
                            disabled={otpCooldown > 0}
                            className="
                                w-full
                                bg-orange-600
                                disabled:bg-slate-600
                                disabled:cursor-not-allowed
                                p-3
                                rounded
                                mb-4
                            "
                        >
                            Recevoir un code
                        </button>

                        {
                            otpCooldown > 0 && (

                                <div className="text-center mt-3 text-orange-300">

                                    ⏳ Nouveau code disponible dans&nbsp;

                                    {Math.floor(otpCooldown / 60)}
                                    :
                                    {(otpCooldown % 60)
                                        .toString()
                                        .padStart(2, '0')}

                                </div>

                            )
                        }

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
                                setCode(e.target.value)
                            }
                            disabled={accountNotConfirmed}
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
                            disabled={
                                !!countdown ||
                                accountNotConfirmed
                            }

                            className="
                                w-full
                                bg-orange-600
                                disabled:bg-slate-600
                                disabled:cursor-not-allowed
                                p-3
                                rounded
                                "
                        >
                            Se connecter
                        </button>
                    </>
                )}

            </div>

        </main>
    );
}