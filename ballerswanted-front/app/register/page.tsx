'use client';

import { useEffect, useState } from 'react';

type Picto = {
    id: string;
    label: string;
    imageUrl: string;
};

const API_URL = 'http://localhost:3001';

export default function RegisterPage() {
    const [pictos, setPictos] = useState<Picto[]>([]);

    const [pseudo, setPseudo] = useState('');
    const [email, setEmail] = useState('');
    const [pictoId, setPictoId] = useState('');
    const [consentAccepted, setConsentAccepted] = useState(false);

    const [message, setMessage] = useState('');

    useEffect(() => {
        async function loadPictos() {
            try {
                const res = await fetch(`${API_URL}/pictos`);
                const data = await res.json();

                setPictos(data);
            } catch (error) {
                console.error(error);

                setMessage(
                    'Impossible de charger les pictos',
                );
            }
        }

        loadPictos();
    }, []);

    async function register() {
        setMessage('');

        if (!pseudo.trim()) {
            setMessage('Pseudo obligatoire');
            return;
        }

        if (!email.trim()) {
            setMessage('Email obligatoire');
            return;
        }

        if (!pictoId) {
            setMessage(
                'Veuillez sélectionner un picto',
            );
            return;
        }

        if (!consentAccepted) {
            setMessage(
                'Vous devez accepter la politique de confidentialité',
            );
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/users/register`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json',
                    },

                    body: JSON.stringify({
                        pseudo,
                        email,
                        pictoId,
                        consentAccepted,
                    }),
                },
            );

            const data = await res.json();

            if (!res.ok) {
                setMessage(
                    data.message ??
                    'Erreur lors de la création du compte',
                );
                return;
            }

            setMessage(
                '✅ Compte créé. Vérifiez votre boîte email.',
            );
        } catch (error) {
            console.error(error);

            setMessage(
                'Erreur technique',
            );
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="max-w-xl mx-auto px-6 py-10">

                <h1 className="text-3xl font-bold text-center mb-8">
                    Créer un compte
                </h1>

                <input
                    type="text"
                    placeholder="Pseudo"
                    value={pseudo}
                    onChange={(e) =>
                        setPseudo(e.target.value)
                    }
                    className="w-full mb-4 p-3 rounded text-black"
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    className="w-full mb-8 p-3 rounded text-black"
                />

                <h2 className="text-xl font-semibold mb-4">
                    Choisissez votre picto
                </h2>

                <div className="grid grid-cols-4 gap-4">
                    {pictos.map((picto) => (
                        <button
                            key={picto.id}
                            type="button"
                            onClick={() => setPictoId(picto.id)}
                            className={`border-2 rounded-xl p-3 flex justify-center items-center transition ${pictoId === picto.id
                                    ? 'border-orange-500 bg-slate-800'
                                    : 'border-slate-700'
                                }`}
                        >
                            <img
                                src={`${picto.imageUrl}`}
                                alt={picto.label}
                                title={picto.label}
                                className="w-16 h-16 object-contain"
                            />
                        </button>
                    ))}
                </div>

                <label className="flex items-center gap-3 mt-8">
                    <input
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(e) =>
                            setConsentAccepted(
                                e.target.checked,
                            )
                        }
                    />

                    <span>
                        J&apos;accepte la politique de
                        confidentialité
                    </span>
                </label>

                <button
                    onClick={register}
                    className="w-full mt-8 bg-orange-600 hover:bg-orange-500 p-3 rounded font-semibold"
                >
                    Créer mon compte
                </button>

                {message && (
                    <div className="mt-6 text-center">
                        {message}
                    </div>
                )}

            </div>
        </main>
    );
}