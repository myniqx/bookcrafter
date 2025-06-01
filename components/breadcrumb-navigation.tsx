import Link from "next/link"
import { ChevronRight, Home, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[]
  projectId: string
}

export function BreadcrumbNavigation({ items, projectId }: BreadcrumbNavigationProps) {
  return (
    <div className="flex items-center justify-between w-full px-4 py-2 border-b">
      <div className="flex items-center">
        <Link href={`/project/${projectId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Home className="h-4 w-4" />
          </Button>
        </Link>

        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
            {item.href ? (
              <Link href={item.href} className="text-sm hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </div>

      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}
