import { BentoGrid, BentoItem } from '@/components/dashboard/bento/BentoGrid';

export default function Loading() {
  return (
    <div className="space-y-4">
      <BentoGrid>
        {/* Welcome Widget Skeleton */}
        <BentoItem colSpan={2} className="h-full min-h-[300px] animate-pulse bg-white/5">
          <div className="h-8 w-32 bg-white/10 rounded-full mb-8" />
          <div className="h-12 w-64 bg-white/10 rounded-lg mb-4" />
          <div className="h-6 w-48 bg-white/10 rounded-lg" />
          <div className="flex gap-4 mt-8">
             <div className="h-12 w-32 bg-white/10 rounded-xl" />
             <div className="h-12 w-32 bg-white/10 rounded-xl" />
          </div>
        </BentoItem>

        {/* Stats Skeletons */}
        <BentoItem colSpan={1} className="animate-pulse bg-white/5">
           <div className="flex justify-between mb-4">
             <div className="h-10 w-10 rounded-xl bg-white/10" />
             <div className="h-5 w-16 rounded-full bg-white/10" />
           </div>
           <div className="h-3 w-20 bg-white/10 rounded mb-2" />
           <div className="h-8 w-32 bg-white/10 rounded" />
        </BentoItem>
        <BentoItem colSpan={1} className="animate-pulse bg-white/5">
           <div className="flex justify-between mb-4">
             <div className="h-10 w-10 rounded-xl bg-white/10" />
             <div className="h-5 w-16 rounded-full bg-white/10" />
           </div>
           <div className="h-3 w-20 bg-white/10 rounded mb-2" />
           <div className="h-8 w-32 bg-white/10 rounded" />
        </BentoItem>
        <BentoItem colSpan={1} className="animate-pulse bg-white/5">
           <div className="flex justify-between mb-4">
             <div className="h-10 w-10 rounded-xl bg-white/10" />
             <div className="h-5 w-16 rounded-full bg-white/10" />
           </div>
           <div className="h-3 w-20 bg-white/10 rounded mb-2" />
           <div className="h-8 w-32 bg-white/10 rounded" />
        </BentoItem>
        <BentoItem colSpan={1} className="animate-pulse bg-white/5">
           <div className="flex justify-between mb-4">
             <div className="h-10 w-10 rounded-xl bg-white/10" />
             <div className="h-5 w-16 rounded-full bg-white/10" />
           </div>
           <div className="h-3 w-20 bg-white/10 rounded mb-2" />
           <div className="h-8 w-32 bg-white/10 rounded" />
        </BentoItem>

        {/* Chart Skeleton */}
        <BentoItem colSpan={2} rowSpan={2} className="animate-pulse bg-white/5 min-h-[400px]">
           <div className="flex justify-between mb-6">
              <div className="h-6 w-48 bg-white/10 rounded" />
              <div className="h-8 w-32 bg-white/10 rounded" />
           </div>
           <div className="h-64 w-full bg-white/10 rounded-xl mt-8" />
        </BentoItem>

        {/* Top Products Skeleton */}
        <BentoItem colSpan={1} rowSpan={2} className="animate-pulse bg-white/5">
           <div className="h-6 w-32 bg-white/10 rounded mb-6" />
           <div className="space-y-4">
              {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex gap-3 items-center">
                     <div className="h-8 w-8 rounded bg-white/10" />
                     <div className="flex-1 space-y-1">
                        <div className="h-3 w-24 bg-white/10 rounded" />
                        <div className="h-2 w-16 bg-white/10 rounded" />
                     </div>
                  </div>
              ))}
           </div>
        </BentoItem>

        {/* Recent Orders Skeleton */}
        <BentoItem colSpan={2} className="animate-pulse bg-white/5">
           <div className="flex justify-between mb-4">
              <div className="h-6 w-48 bg-white/10 rounded" />
           </div>
           <div className="space-y-3">
              <div className="h-8 w-full bg-white/10 rounded" />
              <div className="h-8 w-full bg-white/10 rounded" />
              <div className="h-8 w-full bg-white/10 rounded" />
           </div>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
