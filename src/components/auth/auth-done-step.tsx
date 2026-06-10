import { CheckCircle2 } from "@/components/icons";
import type { AuthMode } from "@/components/auth/auth-pill-toggle";

interface AuthDoneStepProps {
  mode: AuthMode;
  yourName: string;
}

function AuthDoneStep({ mode, yourName }: AuthDoneStepProps) {
  const firstName = yourName.trim().split(" ")[0];

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-paid-soft">
        <CheckCircle2 className="size-10 text-paid" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-h2 font-extrabold tracking-tight text-ink">
          {mode === "login"
            ? "Welcome to ArthaPatra"
            : `You're all set${firstName ? `, ${firstName}` : ""}!`}
        </h2>
        <p className="mt-2 text-body text-ink-2">Opening your dashboard…</p>
      </div>
    </div>
  );
}

export { AuthDoneStep };
