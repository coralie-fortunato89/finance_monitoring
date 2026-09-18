const PLACEHOLDERS = new Set([
  'change-me-in-local-env',
  'changeme',
  'change-me',
  'secret',
  'jwt_secret',
  'your-secret',
  'your_jwt_secret',
  'replace-me',
]);

/** Reject missing, short, or known-placeholder JWT secrets at boot. */
export function assertJwtSecret(value: string | undefined): string {
  const secret = value?.trim() ?? '';
  if (!secret) {
    throw new Error(
      'JWT_SECRET is required. Generate one with: openssl rand -hex 32',
    );
  }
  if (PLACEHOLDERS.has(secret.toLowerCase())) {
    throw new Error(
      'JWT_SECRET is a known placeholder. Generate a strong secret with: openssl rand -hex 32',
    );
  }
  if (secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters. Generate one with: openssl rand -hex 32',
    );
  }
  return secret;
}
