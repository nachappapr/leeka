import { NotFoundNav } from "@/components/not-found/not-found-nav"
import { NotFoundStage } from "@/components/not-found/not-found-stage"

function NotFoundContainer() {
  return (
    <div className="min-h-screen bg-background">
      <NotFoundNav />
      <NotFoundStage />
    </div>
  )
}

export { NotFoundContainer }
