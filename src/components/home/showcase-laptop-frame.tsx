import { BrowserChrome } from "@/components/home/browser-chrome"
import { ShowcaseLaptopFormPane } from "@/components/home/showcase-laptop-form-pane"
import { ShowcaseLaptopTotalsPane } from "@/components/home/showcase-laptop-totals-pane"

function ShowcaseLaptopFrame() {
  return (
    <div className="relative w-full px-3.5 pt-3.5 max-mobile:px-1.5 max-mobile:pt-1.5 bg-ink rounded-t-xl rounded-b-md max-mobile:rounded-b-sm shadow-float">
      <div className="bg-background overflow-hidden rounded-lg max-mobile:rounded-sm aspect-video max-mobile:aspect-auto flex flex-col">
        <BrowserChrome host="app.arthapatra.in" path="/invoices/new" />
        <div className="flex-1 grid grid-cols-5 min-h-0 max-mobile:grid-cols-1">
          <ShowcaseLaptopFormPane />
          <ShowcaseLaptopTotalsPane />
        </div>
      </div>
    </div>
  )
}

export { ShowcaseLaptopFrame }
