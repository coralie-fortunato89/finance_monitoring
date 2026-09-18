import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { mapAuthError, register } from '../lib/auth'
import { authKeys } from '../lib/auth-keys'
import { ensureAuthUser } from '../lib/auth-queries'

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*d).{10,}$/

export const Route = createFileRoute('/register')({
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
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data.user)
    },
  })

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await registerMutation.mutateAsync({
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        password: value.password,
      })
      await navigate({ to: '/' })
    },
  })

  const formError = registerMutation.isError
    ? mapAuthError(
        registerMutation.error,
        'Impossible de créer le compte. Mot de passe : 10+ caractères, majuscule, minuscule, chiffre.',
      )
    : null

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-[var(--sea-ink)]">Inscription</h1>
      <p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
        Créez votre compte pour accéder à l’application.
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
          name="firstName"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? 'Prénom requis' : undefined,
          }}
        >
          {(field) => (
            <label className="block text-sm font-medium">
              Prénom
              <input
                required
                autoComplete="given-name"
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
          name="lastName"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? 'Nom requis' : undefined,
          }}
        >
          {(field) => (
            <label className="block text-sm font-medium">
              Nom
              <input
                required
                autoComplete="family-name"
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
              !passwordRule.test(value)
                ? 'Au moins 10 caractères, une majuscule, une minuscule et un chiffre.'
                : undefined,
          }}
        >
          {(field) => (
            <label className="block text-sm font-medium">
              Mot de passe
              <input
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[rgba(23,58,64,0.2)] bg-white/80 px-3 py-2"
              />
              <span className="mt-1 block text-xs text-[var(--sea-ink-soft)]">
                Au moins 10 caractères, une majuscule, une minuscule et un chiffre.
              </span>
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
              disabled={
                !canSubmit || isSubmitting || registerMutation.isPending
              }
              className="w-full rounded-full bg-[rgba(79,184,178,0.9)] px-4 py-2.5 text-sm font-semibold text-[var(--sea-ink)] disabled:opacity-60"
            >
              {isSubmitting || registerMutation.isPending
                ? 'Création…'
                : 'Créer mon compte'}
            </button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--sea-ink-soft)]">
        Déjà inscrit ?{' '}
        <Link to="/login" className="font-semibold text-[var(--lagoon-deep)]">
          Se connecter
        </Link>
      </p>
    </main>
  )
}
