import { LekkaLogo } from "@/components/icons";

function OnboardingTopbar() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-coral shadow-coral">
          <LekkaLogo className="size-5.5" />
        </div>
        <span className="text-20 font-extrabold tracking-tight">
          arthapatra<span className="text-coral">.</span>
        </span>
      </div>
    </div>
  );
}

export { OnboardingTopbar };
