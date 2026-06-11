import { Skeleton } from "@/components/ui/skeleton";

const SkeletonPrice = () => {
  return (
    <div className="overflow-y-auto px-5 pt-4 pb-2 flex-1 min-h-[570px]">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>

        {/* First row - Effective Date and Expiry Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Second row - Price Name and Account Item Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Third row - Credit Limit */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full md:w-1/2" />
        </div>

        {/* Fourth row - Pay Indicator and Price Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Remarks section */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Base Price Configuration Section */}
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <Skeleton className="h-6 w-48" />

          {/* Configuration fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* Billing Scenarios */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />

            {/* Scenario cards */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-3"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, radioIndex) => (
                    <div
                      key={radioIndex}
                      className="flex items-center space-x-3"
                    >
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab section skeleton */}
        <div className="w-full mt-10">
          <div className="grid grid-cols-3 border-b">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24 mb-2" />
            ))}
          </div>
          <div className="mt-4">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonPrice;
