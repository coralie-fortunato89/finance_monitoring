import { assertJwtSecret } from './jwt-secret';

describe('assertJwtSecret', () => {
  it('rejects missing and short secrets', () => {
    expect(() => assertJwtSecret(undefined)).toThrow(/JWT_SECRET/);
    expect(() => assertJwtSecret('short')).toThrow(/32/);
  });

  it('rejects known placeholders even when long enough', () => {
    expect(() => assertJwtSecret('change-me-in-local-env')).toThrow(/placeholder/);
  });

  it('accepts a strong secret', () => {
    const secret = 'a'.repeat(32);
    expect(assertJwtSecret(secret)).toBe(secret);
  });
});
