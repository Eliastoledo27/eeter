export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-white/10 rounded" />
          <div className="h-10 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/10 rounded" />
        </div>
        <div className="h-10 w-40 bg-white/10 rounded" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
