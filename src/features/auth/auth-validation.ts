const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return emailPattern.test(email);
}

export function validatePasswordForSignUp(password: string) {
  if (!password.trim()) {
    return 'Crie uma senha para continuar.';
  }

  if (password.trim().length < 8) {
    return 'Use pelo menos 8 caracteres para criar sua senha.';
  }

  return null;
}
