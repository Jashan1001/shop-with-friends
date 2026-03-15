export default function Skeleton({ className = '' }) {
  return (
    <div className={`bg-black/10 animate-pulse ${className}`} />
  )
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-white border-[2.5px] border-black/20 p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-14 h-5" />
      </div>
      <Skeleton className="w-3/4 h-5 mb-2" />
      <Skeleton className="w-full h-4 mb-1" />
      <Skeleton className="w-2/3 h-4 mb-4" />
      <div className="flex gap-4">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border-[2.5px] border-black/20">
      <Skeleton className="w-full aspect-video" />
      <div className="p-4">
        <Skeleton className="w-16 h-4 mb-3" />
        <Skeleton className="w-full h-5 mb-1" />
        <Skeleton className="w-3/4 h-5 mb-2" />
        <Skeleton className="w-24 h-6 mb-2" />
        <Skeleton className="w-32 h-3 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="w-16 h-8" />
          <Skeleton className="w-16 h-8" />
        </div>
      </div>
    </div>
  )
}
