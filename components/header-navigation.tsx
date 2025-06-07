import { Save } from "lucide-react"
import { useParams } from "next/navigation"

import { goToProject } from "@/lib/utils/navigateTo"
import { useProject } from "@/providers/project-provider"

import { BreadcrumbNavigation } from "./breadcrumb-navigation"
import { ExportDialog } from "./export-dialog"
import { Button } from "./ui/button"



export const HeaderNavigation = () => {
  const { saveProject } = useProject()


  return (
    <nav className="flex items-center space-x-4 h-15 w-full p-2 overflow-hidden border-b">
      <div className="flex flex-row justify-between w-full">
        <div className="flex items-center space-x-4 flex-row">
          <BreadcrumbNavigation />
        </div>
        <div className="flex flex-row items-center space-x-4">
          <Button
            className="rounded-full"
            onClick={() => saveProject()}
            size="icon"
            title="Projeyi Kaydet"
            variant="outline"
          >
            <Save className="h-4 w-4" />
          </Button>
          <ExportDialog />
        </div>
      </div>
    </nav>
  )
}
