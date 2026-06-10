type AuthStep = "phone" | "otp" | "profile" | "done";

type AuthActionResult = { ok: true } | { ok: false; error: string };

export type { AuthStep, AuthActionResult };
