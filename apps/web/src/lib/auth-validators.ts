const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) {
    return 'Email requis'
  }
  if (!EMAIL_PATTERN.test(value)) {
    return 'Email invalide'
  }
  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (!PASSWORD_PATTERN.test(value)) {
    return 'Au moins 10 caractères, une majuscule, une minuscule et un chiffre.'
  }
  return undefined
}

export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) {
    return `${label} requis`
  }
  return undefined
}
