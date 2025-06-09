'use client';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center items-center mb-8 space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
              <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
            </div>

            <div className="space-y-4 mb-8">
              <div className="h-16 bg-white/20 rounded-lg mx-auto max-w-2xl animate-pulse" />
              <div className="h-12 bg-white/20 rounded-lg mx-auto max-w-xl animate-pulse" />
            </div>

            <div className="h-6 bg-white/20 rounded-lg mx-auto max-w-4xl animate-pulse mb-8" />
            <div className="h-6 bg-white/20 rounded-lg mx-auto max-w-3xl animate-pulse" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-16 text-slate-50"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C300,90 900,30 1200,60 L1200,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs Skeleton */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 h-20 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1 h-20 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Epoch Sections Skeleton */}
        <div className="space-y-16">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="flex flex-col lg:flex-row gap-12 items-start"
            >
              {/* Content Section */}
              <div className="relative flex justify-center lg:justify-start">
                {/* Header */}
                <div className="h-16 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full animate-pulse max-w-md" />

                {/* Description */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
                    <div className="grid md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="space-y-3">
                          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Composers Section */}
              <div className="flex-1 lg:max-w-md">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((composer) => (
                    <div
                      key={composer}
                      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
