import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { clearAuthCache, ensureAuthUser } from '../lib/auth-queries'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    try {
      const user = await ensureAuthUser(context.queryClient)
      return { user }
    } catch {
      await clearAuthCache(context.queryClient)
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet />
}
