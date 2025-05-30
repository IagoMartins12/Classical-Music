// app/composers/ComposersLoading.tsx
export default function ComposersLoading() {
  return (
    <div className="space-y-6 section-wrap">
      {/* Skeleton dos filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="mt-4 h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
      </div>

      {/* Skeleton dos cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto animate-pulse"></div>
              <div className="space-y-1 mt-4">
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton da paginação */}
      <div className="flex justify-center items-center space-x-2 py-8">
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-10 bg-gray-200 rounded animate-pulse"
          ></div>
        ))}
        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded ml-4 animate-pulse"></div>
      </div>
    </div>
  );
}
