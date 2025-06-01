import { useProject } from "@/providers/project-provider"
import { ExportDialog } from "./export-dialog"
import { Button } from "./ui/button"
import { Save } from "lucide-react"



export const HeaderNavigation = () => {
  const { saveProject } = useProject()
  return (
    <nav className="flex items-center space-x-4 h-15 w-full p-2 overflow-hidden border-b">
      <div className="flex flex-row justify-between w-full">
        <div className="flex items-center space-x-4 flex-row">
          .
        </div>
        <div className="flex flex-row items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => saveProject()}
            className="rounded-full"
            title="Projeyi Kaydet"
          >
            <Save className="h-4 w-4" />
          </Button>
          <ExportDialog />
        </div>
      </div>
    </nav>
  )
}
