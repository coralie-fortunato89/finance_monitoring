import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { login, mapAuthError } from '../lib/auth'
import { authKeys } from '../lib/auth-keys'
import { ensureAuthUser } from '../lib/auth-queries'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    try {
      await ensureAuthUser(context.queryClient)
      throw redirect({ to: '/' })
    } catch (error) {
      if (error && typeof error === 'object' && 'to' in error) {
        throw error
      }
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user)
    },
  })

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync({
        email: value.email,
        password: value.password,
      })
      await navigate({ to: '/' })
    },
  })

  const formError = loginMutation.isError
    ? mapAuthError(loginMutation.error, 'Email ou mot de passe incorrect.')
    : null

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-[var(--sea-ink)]">Connexion</h1>
      <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
        Accédez à votre espace finance monitoring.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="island-shell space-y-4 rounded-2xl p-6"
      >
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              !value.trim()
                ? 'Email requis'
                : !/^[^s@]+@[^s@]+.[^s@]+$/.test(value)
                  ? 'Email invalide'
                  : undefined,
          }}
        >
          {(field) => (
            <label className="block text-sm font-medium">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[rgba(23,58,64,0.2)] bg-white/80 px-3 py-2"
              />
              {field.state.meta.isTouched && field.state.meta.errors[0] ? (
                <span className="mt-1 block text-xs text-red-700">
                  {field.state.meta.errors[0]}
                </span>
              ) : null}
            </label>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              !value ? 'Mot de passe requis' : undefined,
          }}
        >
          {(field) => (
            <label className="block text-sm font-medium">
              Mot de passe
              <input
                type="password"
                required
                autoComplete="current-password"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[rgba(23,58,64,0.2)] bg-white/80 px-3 py-2"
              />
              {field.state.meta.isTouched && field.state.meta.errors[0] ? (
                <span className="mt-1 block text-xs text-red-700">
                  {field.state.meta.errors[0]}
                </span>
              ) : null}
            </label>
          )}
        </form.Field>

        {formError ? <p className="text-sm text-red-700">{formError}</p> : null}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting || loginMutation.isPending}
              className="w-full rounded-full bg-[rgba(79,184,178,0.9)] px-4 py-2.5 text-sm font-semibold text-[var(--sea-ink)] disabled:opacity-60"
            >
              {isSubmitting || loginMutation.isPending
                ? 'Connexion…'
                : 'Se connecter'}
            </button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--sea-ink-soft)]">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-semibold text-[var(--lagoon-deep)]">
          Créer un compte
        </Link>
      </p>
    </main>
  )
}
