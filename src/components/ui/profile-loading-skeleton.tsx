import { Skeleton } from "@/components/ui/skeleton";

export function ProfileLoadingSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
    </div>
  );
}

export function NavbarLoadingSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <Skeleton className="h-6 w-[180px] mx-auto" />
        <Skeleton className="h-4 w-[120px] mx-auto" />
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-6 mb-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-[120px]" />
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-[80px] mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-[60px] mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-[100px] mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-5 w-[150px]" />
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-[90px] mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-[70px] mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-[110px] mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}