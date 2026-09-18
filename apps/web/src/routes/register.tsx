import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { fetchMe, mapAuthError, register } from '../lib/auth';

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    try {
      await fetchMe();
      throw redirect({ to: '/' });
    } catch (error) {
      if (error && typeof error === 'object' && 'to' in error) {
        throw error;
      }
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register({ firstName, lastName, email, password });
      await navigate({ to: '/' });
    } catch (err) {
      setError(
        mapAuthError(
          err,
          'Impossible de créer le compte. Mot de passe : 10+ caractères, majuscule, minuscule, chiffre.',
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-[var(--sea-ink)]">Inscription</h1>
      <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
        Créez votre compte pour accéder à l’application.
      </p>
      <form onSubmit={onSubmit} className="island-shell space-y-4 rounded-2xl p-6">
        <label className="block text-sm font-medium">
          Prénom
          <input
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[rgba(23,58,64,0.2)] bg-white/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Nom
          <input
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[rgba(23,58,64,0.2)] bg-white/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[rgba(23,58,64,0.2)] bg-white/80 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Mot de passe
          <input
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[rgba(23,58,64,0.2)] bg-white/80 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-[var(--sea-ink-soft)]">
            Au moins 10 caractères, une majuscule, une minuscule et un chiffre.
          </span>
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-[rgba(79,184,178,0.9)] px-4 py-2.5 text-sm font-semibold text-[var(--sea-ink)] disabled:opacity-60"
        >
          {pending ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--sea-ink-soft)]">
        Déjà inscrit ?{' '}
        <Link to="/login" className="font-semibold text-[var(--lagoon-deep)]">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
