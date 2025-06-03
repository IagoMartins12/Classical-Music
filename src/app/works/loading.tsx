// app/works/loading.tsx
export default function WorksLoading() {
  // Skeleton para um card de obra
  const WorkCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        {/* Título da Obra */}
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>

        {/* Opus/Catálogo */}
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>

        {/* Compositor */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>

        {/* Informações adicionais */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>

          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
          </div>

          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/5"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
        </div>

        {/* Botão de ação */}
        <div className="h-9 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded animate-pulse mb-2 w-80"></div>
        <div className="h-5 bg-gray-200 rounded animate-pulse w-60"></div>
      </div>

      {/* Barra de Busca e Filtros Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex gap-4 mb-4">
          {/* Campo de busca */}
          <div className="flex-1 relative">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          {/* Botão buscar */}
          <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          {/* Botão filtros */}
          <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Estatísticas */}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
      </div>

      {/* Grid de Obras Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Renderizar 24 cards skeleton (padrão da paginação) */}
        {Array.from({ length: 24 }, (_, index) => (
          <WorkCardSkeleton key={index} />
        ))}
      </div>

      {/* Paginação Skeleton */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border p-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>

        <div className="flex items-center gap-2">
          {/* Botão anterior */}
          <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>

          {/* Números das páginas */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>

          {/* Botão próxima */}
          <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
