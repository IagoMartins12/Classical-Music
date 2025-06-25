// app/study/[workId]/[[...scoreId]]/loading.tsx
export default function StudyModeLoading() {
  return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Logo/Icon animado */}
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center animate-pulse">
          <svg
            className="w-8 h-8 text-theme-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>

        {/* Texto de carregamento */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-theme-primary">
            Preparando Modo Estudo
          </h2>
          <p className="text-theme-secondary">
            Carregando partitura e configurações...
          </p>
        </div>

        {/* Progress bar animado */}
        <div className="w-64 h-2 bg-theme-elevated rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full animate-pulse"></div>
        </div>

        {/* Loading steps */}
        <div className="text-sm text-theme-tertiary space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
            <span>Verificando partitura</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div
              className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            ></div>
            <span>Carregando configurações</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div
              className="w-2 h-2 bg-accent-blue rounded-full animate-pulse"
              style={{ animationDelay: '1s' }}
            ></div>
            <span>Inicializando ambiente</span>
          </div>
        </div>
      </div>
    </div>
  );
}
