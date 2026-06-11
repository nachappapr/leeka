type AuthStep = "phone" | "otp" | "profile" | "done";

type AuthActionResult = { ok: true; profileComplete?: boolean } | { ok: false; error: string };

export type { AuthStep, AuthActionResult };
