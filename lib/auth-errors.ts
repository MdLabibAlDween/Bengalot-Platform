export type FriendlyAuthError = {
  title: string;
  description: string;
};

const generic: FriendlyAuthError = {
  title: "We couldn't complete that",
  description:
    "Please try again in a moment. If it keeps happening, contact support@bengalot.com.",
};

/** Turn raw Supabase Auth errors into customer-facing copy. */
export function friendlyAuthError(message?: string | null): FriendlyAuthError {
  const text = (message ?? "").trim().toLowerCase();
  if (!text) return generic;

  if (
    text.includes("expired") ||
    text.includes("otp_expired") ||
    text.includes("invalid or has expired") ||
    text.includes("token has expired") ||
    text.includes("session missing") ||
    text.includes("auth session missing")
  ) {
    return {
      title: "This link has expired",
      description:
        "Reset links are valid for a limited time and can only be used once. Request a new link below.",
    };
  }

  if (
    text.includes("rate limit") ||
    text.includes("too many") ||
    text.includes("security purposes") ||
    (text.includes("after") && text.includes("seconds"))
  ) {
    return {
      title: "Please wait a moment",
      description:
        "Too many email requests were made. Wait a minute, then try again. Check spam and junk too.",
    };
  }

  if (text.includes("already registered") || text.includes("already exists")) {
    return {
      title: "That email already has an account",
      description: "Sign in instead, or use “Forgot password” if you need a new password.",
    };
  }

  if (
    text.includes("signups not allowed") ||
    text.includes("signup is disabled") ||
    text.includes("registration is disabled")
  ) {
    return {
      title: "Registration is currently closed",
      description:
        "You can still checkout as a guest. Please try creating an account again shortly.",
    };
  }

  if (
    text.includes("smtp") ||
    text.includes("mailer") ||
    text.includes("failed to send") ||
    text.includes("error sending") ||
    text.includes("sending confirmation email") ||
    text.includes("sending recovery email")
  ) {
    return {
      title: "We couldn't send the email",
      description:
        "The account service is temporarily unable to send email. Please try again in a few minutes or contact support@bengalot.com.",
    };
  }

  if (text.includes("invalid email") || (text.includes("email") && text.includes("invalid"))) {
    return {
      title: "Check that email address",
      description: "Enter a valid email address, for example you@example.com.",
    };
  }

  if (text.includes("network") || text.includes("fetch") || text.includes("timeout")) {
    return {
      title: "Connection problem",
      description:
        "We couldn't reach the account service. Check your connection and try again.",
    };
  }

  if (text.includes("password")) {
    return {
      title: "That password can't be used",
      description:
        "Use at least 8 characters and try a password you haven't used before.",
    };
  }

  return generic;
}
