import type { QueryClient } from '@tanstack/react-query'
import { authKeys } from './auth-keys'
import {
  fetchMe,
  logout as logoutRequest,
  refreshSession,
  type AuthUser,
} from './auth'

export function meQueryOptions() {
  return {
    queryKey: authKeys.me(),
    queryFn: fetchMe,
  }
}

export async function ensureAuthUser(
  queryClient: QueryClient,
): Promise<AuthUser> {
  try {
    return await queryClient.ensureQueryData(meQueryOptions())
  } catch {
    const refreshed = await refreshSession()
    queryClient.setQueryData(authKeys.me(), refreshed.user)
    return refreshed.user
  }
}

export async function clearAuthCache(queryClient: QueryClient): Promise<void> {
  await logoutRequest()
  queryClient.removeQueries({ queryKey: authKeys.all })
}
