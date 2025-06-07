import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      {/* Book header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Chapters section skeleton */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card className="overflow-hidden" key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
