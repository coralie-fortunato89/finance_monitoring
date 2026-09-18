import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { fetchMe, logout, refreshSession } from '../lib/auth';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    try {
      const user = await fetchMe();
      return { user };
    } catch {
      try {
        const refreshed = await refreshSession();
        return { user: refreshed.user };
      } catch {
        await logout();
        throw redirect({ to: '/login' });
      }
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}
