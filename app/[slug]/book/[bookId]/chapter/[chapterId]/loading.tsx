import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      {/* Chapter header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <Tabs defaultValue="editor">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">
            <Skeleton className="h-4 w-16" />
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
          <TabsTrigger value="entities">
            <Skeleton className="h-4 w-20" />
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Card>
            <CardContent className="p-0">
              <Skeleton className="h-[500px] w-full rounded-md" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
