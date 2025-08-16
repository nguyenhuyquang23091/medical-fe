import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white border rounded-lg p-1">
              <div className="flex gap-1">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info Skeleton */}
            <div className="lg:col-span-1">
              <Card className="border shadow-sm mb-6 overflow-hidden">
                <div className="pt-6 px-6 flex flex-col items-center">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32 mt-4" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-4 w-44" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm mb-6">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-40" />
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-2 flex-1" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </CardHeader>
              </Card>    
            </div>

            {/* Right Column - Activities and Connections Skeleton */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border shadow-sm">
                  <CardHeader>
                    <Skeleton className="h-6 w-20" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-16 rounded-md" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}