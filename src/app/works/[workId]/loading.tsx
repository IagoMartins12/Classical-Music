// app/work/[workId]/loading.tsx
export default function WorkDetailsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <span className="text-gray-300">›</span>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <span className="text-gray-300">›</span>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Header Principal Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Informações Principais */}
            <div className="lg:col-span-3 space-y-6">
              {/* Título e Compositor */}
              <div>
                <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mt-0.5"></div>
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informações Adicionais */}
              <div className="border-t pt-6">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-full bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="border-t pt-6">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  <div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="flex flex-wrap gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Player */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Links Externos */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Informações Técnicas */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="h-6 w-28 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-full bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Obras Relacionadas Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
