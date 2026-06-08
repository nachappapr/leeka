import Link from "next/link"
import { Home, ArrowRight } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import { FourOhFour } from "@/components/not-found/four-oh-four"
import { HelpLinks } from "@/components/not-found/help-links"

function NotFoundCopy() {
  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full bg-overdue-soft px-3.5 py-1.5 text-label font-extrabold text-overdue-ink mb-6">
        <span
          className="size-2 rounded-full bg-overdue ring-4 ring-overdue/20 shrink-0"
          aria-hidden="true"
        />
        Error 404 · Page not found
      </span>

      <FourOhFour />

      <h1 className="mt-4.5 text-h1 font-extrabold text-ink">
        This page slipped out of the ledger.
      </h1>

      <p className="mt-4.5 text-lead font-medium text-ink-2 max-w-115">
        The link you followed is missing, renamed, or never existed — a bit like
        an invoice filed under the wrong customer. Your bills and payments are
        safe and sound back on the dashboard.
      </p>

      <div className="mt-8 flex gap-3 items-center flex-wrap max-mobile:flex-col max-mobile:items-stretch">
        <PillButton
          tone="primary"
          size="lg"
          render={<Link href="/" />}
        >
          <Home className="size-5" aria-hidden="true" />
          Take me home
        </PillButton>
        <PillButton
          tone="outline"
          size="lg"
          render={<Link href="/dashboard" />}
        >
          <ArrowRight className="size-5" aria-hidden="true" />
          Go to dashboard
        </PillButton>
      </div>

      <HelpLinks />
    </div>
  )
}

export { NotFoundCopy }
