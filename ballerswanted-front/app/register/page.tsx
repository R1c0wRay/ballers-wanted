'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

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

    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

    const router = useRouter()

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
            setMessage(
                '❌ Le pseudo est obligatoire'
            );
            return;
        }

        if (!email.trim()) {
            setMessage(
                '❌ L’email est obligatoire'
            );
            return;
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setMessage(
                '❌ Format d’email invalide'
            );
            return;
        }

        if (!pictoId) {
            setMessage(
                '❌ Vous devez sélectionner un picto'
            );
            return;
        }

        if (!consentAccepted) {
            setMessage(
                '❌ Vous devez accepter la politique de confidentialité'
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

                switch (data.errorCode) {

                    case 'EMAIL_ALREADY_USED':
                        setMessage(
                            '❌ Cette adresse email est déjà utilisée'
                        );
                        break;

                    case 'INVALID_EMAIL_FORMAT':
                        setMessage(
                            '❌ Format d’email invalide'
                        );
                        break;

                    case 'PSEUDO_ALREADY_USED':
                        setMessage(
                            '❌ Ce pseudo est déjà utilisé'
                        );
                        break;

                    case 'PICTO_REQUIRED':
                        setMessage(
                            '❌ Vous devez sélectionner un picto'
                        );
                        break;

                    case 'CONSENT_REQUIRED':
                        setMessage(
                            '❌ Vous devez accepter la politique de confidentialité'
                        );
                        break;

                    default:
                        setMessage(
                            data.message ??
                            '❌ Erreur lors de la création du compte'
                        );
                }

                return;
            }
            setMessage(
                '✅ Vérifiez votre boîte email pour valider votre inscription.',
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
                <div className="bg-slate-900 rounded-2xl p-8 shadow-xl">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Créer un compte
                    </h1>

                    <input
                        type="text"
                        placeholder="Pseudo"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        className="w-full mb-4 p-3 rounded bg-white text-black border border-slate-300"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mb-8 p-3 rounded bg-white text-black border border-slate-300"
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
                                    ? 'border-orange-500 bg-slate-800 scale-105 shadow-lg shadow-orange-500/30'
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
                                    e.target.checked
                                )
                            }
                        />

                        <span>
                            J'accepte la{' '}

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPrivacyPolicy(true)
                                }
                                className="underline text-orange-400 hover:text-orange-300"
                            >
                                politique de confidentialité
                            </button>

                        </span>

                    </label>

                    <button
                        onClick={register}
                        className="w-full mt-8 bg-orange-600 hover:bg-orange-500 p-3 rounded font-semibold"
                    >
                        Créer mon compte
                    </button>

                    {message && (
                        <div className="mt-6 text-center text-orange-400 font-medium">
                            {message}
                        </div>
                    )}

                </div>
            </div>
            {
                showPrivacyPolicy && (

                    <div
                        className="
        fixed
        inset-0
        bg-black/80

        flex
        items-center
        justify-center

        z-50
      "
                    >

                        <div
                            className="
          bg-white
          text-black

          max-w-2xl
          max-h-[80vh]

          overflow-y-auto

          rounded-xl

          p-6
          mx-4
        "
                        >

                            <h2 className="text-2xl font-bold mb-4">
                                Politique de confidentialité
                            </h2>

                            <p className="mb-3">
                                Bienvenue sur Ballers Wanted.
                            </p>

                            <p className="mb-3">
                                Dans le cadre du fonctionnement
                                de l'application, nous collectons
                                uniquement les informations
                                nécessaires à la création et à la
                                gestion de votre compte :
                            </p>

                            <ul className="list-disc ml-6 mb-4">
                                <li>Pseudo</li>
                                <li>Adresse email</li>
                                <li>Picto sélectionné</li>
                            </ul>

                            <p className="mb-3">
                                Ces données sont utilisées
                                exclusivement pour :
                            </p>

                            <ul className="list-disc ml-6 mb-4">
                                <li>
                                    L'authentification des utilisateurs
                                </li>

                                <li>
                                    La sécurisation des accès
                                </li>

                                <li>
                                    Le bon fonctionnement
                                    de Ballers Wanted
                                </li>
                            </ul>

                            <p className="mb-3">
                                Aucune donnée n'est vendue
                                à des tiers.
                            </p>

                            <p className="mb-3">
                                Vous pouvez demander la suppression
                                de votre compte et de vos données
                                à tout moment.
                            </p>

                            <p className="mb-6">
                                En cochant la case de consentement,
                                vous acceptez cette politique de
                                confidentialité version v1.
                            </p>

                            <div className="text-center">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPrivacyPolicy(false)
                                    }
                                    className="
              bg-orange-600
              hover:bg-orange-500

              text-white

              px-6
              py-3

              rounded
            "
                                >
                                    Fermer
                                </button>

                            </div>

                        </div>

                    </div>
                )
            }
        </main>
    );
}