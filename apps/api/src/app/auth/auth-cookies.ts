import type { Response } from 'express';

export const ACCESS_COOKIE = 'fm_access_token';
export const REFRESH_COOKIE = 'fm_refresh_token';

const isProd = process.env.NODE_ENV === 'production';

const baseCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessMaxAgeMs: number,
  refreshMaxAgeMs: number,
): void {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookie,
    maxAge: accessMaxAgeMs,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookie,
    maxAge: refreshMaxAgeMs,
    path: '/api/auth',
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookie });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookie, path: '/api/auth' });
}
