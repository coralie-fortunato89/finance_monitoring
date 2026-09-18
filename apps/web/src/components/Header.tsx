import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import ThemeToggle from './ThemeToggle';
import { logout } from '../lib/auth';

export default function Header() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const authPage = pathname === '/login' || pathname === '/register';
  const authed = !authPage;

  async function onLogout() {
    await logout();
    await navigate({ to: '/login' });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(23,58,64,0.12)] bg-[rgba(255,255,255,0.72)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to={authed ? '/' : '/login'} className="text-sm font-bold text-[var(--sea-ink)] no-underline">
          Finance Monitoring
        </Link>
        <div className="flex items-center gap-3">
          {authed ? (
            <>
              <Link to="/" className="text-sm font-medium text-[var(--sea-ink-soft)] no-underline">
                Accueil
              </Link>
              <Link to="/about" className="text-sm font-medium text-[var(--sea-ink-soft)] no-underline">
                À propos
              </Link>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="rounded-full border border-[rgba(23,58,64,0.2)] px-3 py-1 text-sm font-semibold"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-[var(--sea-ink-soft)] no-underline">
                Connexion
              </Link>
              <Link to="/register" className="text-sm font-semibold text-[var(--lagoon-deep)] no-underline">
                Inscription
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
