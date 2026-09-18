import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '../lib/auth';

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}
