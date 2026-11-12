export function professionalErrorMessage(error: unknown, fallbackMessage: string) {
  const rawMessage = error instanceof Error ? error.message : "";
  const message = rawMessage.trim().toLowerCase();

  if (!message) {
    return fallbackMessage;
  }

  if (message.includes("failed to fetch") || message.includes("networkerror") || message.includes("network request failed")) {
    return "We could not complete your request. Check your connection and try again.";
  }

  if (message.includes("invalid credentials") || message.includes("email or password") || message.includes("password is incorrect")) {
    return "Email or password is incorrect.";
  }

  if (message.includes("verify your email")) {
    return "Please verify your email before signing in.";
  }

  if (message.includes("account is disabled") || message.includes("user disabled")) {
    return "This account is disabled. Please contact an administrator.";
  }

  if (message.includes("already exists")) {
    return "An account with this email already exists.";
  }

  if (message.includes("invalid admin invite code")) {
    return "The admin invite code is invalid.";
  }

  if ((message.includes("verification code") || message.includes("code")) && (message.includes("invalid") || message.includes("expired"))) {
    return "The verification code is invalid or has expired. Request a new code and try again.";
  }

  if (message.includes("deliver onboarding email") || message.includes("deliver email")) {
    return "We could not deliver the onboarding email. Confirm the email address and try again.";
  }

  if (message.includes("already completed onboarding")) {
    return "This user has already completed onboarding.";
  }

  if ((message.includes("reset token") || message.includes("reset session") || message.includes("token")) && (message.includes("invalid") || message.includes("expired"))) {
    return "Your reset session is invalid or has expired. Restart the password reset process.";
  }

  if (message.includes("current password")) {
    return "Current password is incorrect.";
  }

  return fallbackMessage;
}
