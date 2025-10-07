export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
      <div className="bg-white h-14 border-b border-gray-200"></div>
      
      <div className="bg-white">
        <div className="w-full h-[400px] bg-gray-200"></div>
      </div>

      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex items-baseline gap-2 mb-2">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>

      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 bg-white">
        <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
