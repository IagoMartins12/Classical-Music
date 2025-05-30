// app/composer/[composerId]/ComposerDetailsLoading.tsx
export default function ComposerDetailsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb skeleton */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>

        {/* Header skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Info do compositor */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-36 animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-44 animate-pulse"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-10 bg-gray-200 rounded w-28 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>

            {/* Imagem skeleton */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-64 h-80 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Biografia skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="h-8 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-28 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
