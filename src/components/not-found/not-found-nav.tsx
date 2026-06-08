import Link from "next/link"
import { LekkaLogo } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"

function NotFoundNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-cream/85 py-3.5 backdrop-blur-sm backdrop-saturate-150">
      <div className="mx-auto flex max-w-310 items-center gap-7 px-8 max-mobile:px-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
        >
          <div className="flex size-9 items-center justify-center rounded-nav-item bg-coral shadow-coral">
            <LekkaLogo className="size-5" aria-hidden="true" />
          </div>
          <span className="text-20 font-extrabold tracking-tight">
            arthapatra<span className="text-coral">.</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="max-mobile:hidden">
            <PillButton
              tone="outline"
              size="md"
              render={<Link href="/" />}
            >
              Back to home
            </PillButton>
          </div>
          <PillButton
            tone="primary"
            size="md"
            render={<Link href="/dashboard" />}
          >
            Open dashboard
          </PillButton>
        </div>
      </div>
    </nav>
  )
}

export { NotFoundNav }
