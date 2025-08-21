// app/work/[workId]/loading.tsx - Loading otimizado
export default function WorkDetailsLoading() {
  return (
    <div className="bg-gradient-primary min-h-screen">
      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb skeleton */}
        <nav className="flex items-center space-x-2 text-sm mb-6 pt-4">
          <div className="h-4 w-16 bg-theme-elevated rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-theme-elevated rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-theme-elevated rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-theme-elevated rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-theme-elevated rounded animate-pulse"></div>
        </nav>

        {/* Main content skeleton */}
        <div className="classical-card overflow-hidden relative animate-fade-in-up">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                {/* Title skeleton */}
                <div className="space-y-4">
                  <div className="h-12 w-3/4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl animate-pulse"></div>
                  <div className="h-6 w-1/2 bg-theme-elevated rounded animate-pulse"></div>
                  <div className="h-5 w-1/3 bg-theme-elevated rounded animate-pulse"></div>
                </div>

                {/* Info grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-theme-elevated rounded-xl animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-20 bg-theme-elevated rounded animate-pulse"></div>
                        <div className="h-4 w-16 bg-theme-elevated rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar skeleton */}
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="classical-card-simple p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-theme-elevated rounded-xl animate-pulse"></div>
                      <div className="h-5 w-24 bg-theme-elevated rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-10 w-full bg-theme-elevated rounded animate-pulse"></div>
                      <div className="h-10 w-full bg-theme-elevated rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scores section skeleton */}
        <div className="classical-card overflow-hidden">
          <div className="border-b border-theme-secondary p-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-theme-elevated rounded-2xl animate-pulse"></div>
              <div>
                <div className="h-6 w-32 bg-theme-elevated rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-theme-elevated rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-brand-secondary rounded-full animate-spin"
                  style={{
                    animationDirection: 'reverse',
                    animationDuration: '1.5s',
                  }}
                ></div>
              </div>
              <span className="ml-3 text-theme-primary font-medium">
                🚀 Carregando sistema otimizado de partituras...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
