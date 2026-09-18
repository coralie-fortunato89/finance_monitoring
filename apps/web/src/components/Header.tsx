import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { authKeys } from '../lib/auth-keys'
import { clearAuthCache, meQueryOptions } from '../lib/auth-queries'

export default function Header() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const authPage = pathname === '/login' || pathname === '/register'

  const meQuery = useQuery({
    ...meQueryOptions(),
    enabled: !authPage,
  })

  const logoutMutation = useMutation({
    mutationFn: () => clearAuthCache(queryClient),
    onSuccess: async () => {
      await navigate({ to: '/login' })
    },
  })

  const authed = !authPage && Boolean(meQuery.data)

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(23,58,64,0.12)] bg-[rgba(255,255,255,0.72)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          to={authed ? '/' : '/login'}
          className="text-sm font-bold text-[var(--sea-ink)] no-underline"
        >
          Finance Monitoring
        </Link>
        <div className="flex items-center gap-3">
          {authed ? (
            <>
              <Link
                to="/"
                className="text-sm font-medium text-[var(--sea-ink-soft)] no-underline"
              >
                Accueil
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium text-[var(--sea-ink-soft)] no-underline"
              >
                À propos
              </Link>
              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                className="rounded-full border border-[rgba(23,58,64,0.2)] px-3 py-1 text-sm font-semibold disabled:opacity-60"
              >
                {logoutMutation.isPending ? '…' : 'Déconnexion'}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[var(--sea-ink-soft)] no-underline"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-[var(--lagoon-deep)] no-underline"
              >
                Inscription
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
