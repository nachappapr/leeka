import { NotFoundCopy } from "@/components/not-found/not-found-copy"
import { NotFoundBrowserMock } from "@/components/not-found/not-found-browser-mock"

function NotFoundStage() {
  return (
    <main className="relative flex min-h-[calc(100vh-73px)] items-center overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 -right-44 size-130 rounded-full"
        // eslint-disable-next-line no-restricted-syntax -- decorative coral radial blob; single-use decorative element, no design token warranted
        style={{
          background:
            "radial-gradient(circle, rgba(244,106,57,0.16) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -bottom-36 -left-44 size-105 rounded-full"
        // eslint-disable-next-line no-restricted-syntax -- decorative green radial blob; single-use decorative element, no design token warranted
        style={{
          background:
            "radial-gradient(circle, rgba(31,157,85,0.09) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-310 px-8 max-mobile:px-5">
        <div className="grid lg:grid-cols-2 gap-16 items-center py-14 max-tablet:grid-cols-1 max-tablet:gap-10 max-tablet:max-w-140 max-tablet:mx-auto max-mobile:gap-8 max-mobile:py-7">
          <NotFoundCopy />
          <NotFoundBrowserMock />
        </div>
      </div>
    </main>
  )
}

export { NotFoundStage }
