'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit3,
  FiActivity,
  FiUpload,
  FiFileText,
  FiClock,
  FiMail,
  FiRefreshCw,
  FiDownload,
  FiMoreHorizontal,
  FiX,
  FiShield,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { useAdminUsers, AdminUser } from '@/app/hooks/admin/useAdminUsers';
import { formatNumber, formatDuration } from '@/app/hooks/admin/useAdminStats';
import UserEditModal from '../../Modals/UserEditModal';
import UserDetailsModal from '../../Modals/UserDetailsModal';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import LoadingAdminState from '../../Common/LoadingState';
import { UserListFilters } from '@/app/api/admin/users/route';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

const USER_TYPE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'MUSIC_STUDENT', label: 'Estudantes' },
  { value: 'CASUAL_USER', label: 'Usuários Casuais' },
  { value: 'PROFESSIONAL', label: 'Profissionais' },
  { value: 'TEACHER', label: 'Professores' },
];

const EXPERIENCE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Todas as Experiências' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: 'createdAt', label: 'Data de Cadastro' },
  { value: 'name', label: 'Nome' },
  { value: 'totalStudyTime', label: 'Tempo de Estudo' },
  { value: 'annotationsCount', label: 'Anotações' },
  { value: 'uploadsCount', label: 'Uploads' },
];

const DIRECTION_OPTIONS: FilterOption[] = [
  { value: 'desc', label: 'Decrescente' },
  { value: 'asc', label: 'Crescente' },
];

export default function UsersList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados do componente
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<UserListFilters>({});

  // Hook de dados
  const {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    refreshData,
    exportUsers,
  } = useAdminUsers();

  // Filtros baseados na URL
  const urlFilters = useMemo(() => {
    const filters: UserListFilters = {
      search: searchParams.get('search') || undefined,
      userType: searchParams.get('userType') || undefined,
      experienceLevel: searchParams.get('experienceLevel') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      isActive: searchParams.get('active') === 'true' || undefined,
      hasUploads: searchParams.get('contributors') === 'true' || undefined,
      hasAnnotations: searchParams.get('annotators') === 'true' || undefined,
    };

    // Remover valores undefined/vazios
    return Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== undefined && value !== ''
      )
    );
  }, [searchParams]);

  // Aplicar filtros iniciais baseados na URL
  useEffect(() => {
    if (Object.keys(urlFilters).length > 0) {
      setLocalFilters(urlFilters);
      fetchUsers(urlFilters, 1);
    } else {
      fetchUsers({}, 1);
    }
  }, []);

  // Função para atualizar URL com novos filtros
  const updateURL = (newFilters: UserListFilters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value.toString());
      }
    });

    const newUrl = params.toString()
      ? `/admin/users/list?${params.toString()}`
      : '/admin/users/list';

    router.replace(newUrl);
  };

  // Aplicar filtros
  const applyFilters = (newFilters: UserListFilters) => {
    const combinedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(combinedFilters);
    updateURL(combinedFilters);
    fetchUsers(combinedFilters, 1);
  };

  // Busca por termo
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const newFilters = { ...localFilters, search: term || undefined };
    applyFilters(newFilters);
  };

  // Limpar filtros
  const clearFilters = () => {
    setLocalFilters({});
    setSearchTerm('');
    updateURL({});
    fetchUsers({}, 1);
  };

  // Carregar mais usuários (paginação)
  const loadMore = () => {
    if (pagination?.hasMore) {
      fetchUsers(localFilters, pagination.page + 1);
    }
  };

  // Filtros ativos
  const activeFiltersCount = useMemo(() => {
    return Object.values(localFilters).filter(
      (value) => value !== undefined && value !== '' && value !== 'all'
    ).length;
  }, [localFilters]);

  // Determinar tipo de filtro ativo baseado na URL
  const getActiveFilterType = () => {
    if (searchParams.get('contributors') === 'true') return 'contribuidores';
    if (searchParams.get('annotators') === 'true') return 'anotadores';
    if (searchParams.get('active') === 'true') return 'ativos';
    return null;
  };

  const activeFilterType = getActiveFilterType();

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiUsers className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar Usuários
          </h2>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Button
            variant="primary"
            leftIcon={<FiRefreshCw />}
            onClick={refreshData}
          >
            Tentar Novamente
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiUsers className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Lista de Usuários
              {activeFilterType && (
                <span className="text-lg md:text-xl text-accent-blue block mt-2">
                  {activeFilterType === 'contribuidores' && 'Contribuidores'}
                  {activeFilterType === 'anotadores' && 'Anotadores'}
                  {activeFilterType === 'ativos' && 'Usuários Ativos'}
                </span>
              )}
            </h1>
            <p className="text-lg md:text-xl text-theme-secondary classical-subtitle">
              Gerencie e visualize todos os usuários da plataforma
            </p>
          </div>
        </AnimatedItem>

        {/* Controles de Busca e Filtro */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Busca */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-theme-secondary border border-theme-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue text-theme-primary placeholder-theme-tertiary"
                />
                {searchTerm && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? 'primary' : 'secondary'}
                  leftIcon={<FiFilter />}
                  rightIcon={
                    activeFiltersCount > 0 && (
                      <span className="text-black px-2 py-0.5 rounded-full text-xs font-bold">
                        {activeFiltersCount}
                      </span>
                    )
                  }
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtros
                </Button>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    leftIcon={<FiX />}
                    onClick={clearFilters}
                  >
                    Limpar
                  </Button>
                )}

                <Button
                  variant="ghost"
                  leftIcon={<FiRefreshCw />}
                  onClick={refreshData}
                  disabled={loading}
                >
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Painel de Filtros */}
            {showFilters && (
              <AnimatedCard className="classical-card p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tipo de Usuário */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Tipo de Usuário
                    </label>
                    <Select
                      options={USER_TYPE_OPTIONS}
                      value={localFilters.userType || 'all'}
                      onChange={(e) =>
                        applyFilters({
                          userType:
                            e.target.value === 'all'
                              ? undefined
                              : e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Nível de Experiência */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Experiência
                    </label>
                    <Select
                      options={EXPERIENCE_OPTIONS}
                      value={localFilters.experienceLevel || 'all'}
                      onChange={(e) =>
                        applyFilters({
                          experienceLevel:
                            e.target.value === 'all'
                              ? undefined
                              : e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Ordenação */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Ordenar por
                    </label>
                    <Select
                      options={SORT_OPTIONS}
                      value={localFilters.sortBy || 'createdAt'}
                      onChange={(e) =>
                        applyFilters({ sortBy: e.target.value as any })
                      }
                    />
                  </div>

                  {/* Direção da Ordenação */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Direção
                    </label>
                    <Select
                      options={DIRECTION_OPTIONS}
                      value={localFilters.sortOrder || 'desc'}
                      onChange={(e) =>
                        applyFilters({ sortOrder: e.target.value as any })
                      }
                    />
                  </div>
                </div>

                {/* Filtros Rápidos */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-theme-primary">
                  <Button
                    size="sm"
                    variant={localFilters.isActive ? 'primary' : 'ghost'}
                    leftIcon={<FiActivity />}
                    onClick={() =>
                      applyFilters({
                        isActive: localFilters.isActive ? undefined : true,
                      })
                    }
                  >
                    Apenas Ativos
                  </Button>

                  <Button
                    size="sm"
                    variant={localFilters.hasUploads ? 'primary' : 'ghost'}
                    leftIcon={<FiUpload />}
                    onClick={() =>
                      applyFilters({
                        hasUploads: localFilters.hasUploads ? undefined : true,
                      })
                    }
                  >
                    Contribuidores
                  </Button>

                  <Button
                    size="sm"
                    variant={localFilters.hasAnnotations ? 'primary' : 'ghost'}
                    leftIcon={<FiFileText />}
                    onClick={() =>
                      applyFilters({
                        hasAnnotations: localFilters.hasAnnotations
                          ? undefined
                          : true,
                      })
                    }
                  >
                    Anotadores
                  </Button>

                  <Button
                    size="sm"
                    variant={localFilters.hasModerations ? 'primary' : 'ghost'}
                    leftIcon={<FiShield />}
                    onClick={() =>
                      applyFilters({
                        hasModerations: localFilters.hasModerations
                          ? undefined
                          : true,
                      })
                    }
                  >
                    Moderadores
                  </Button>
                </div>
              </AnimatedCard>
            )}

            {/* Estatísticas Rápidas */}
            {pagination && (
              <div className="flex items-center justify-between text-sm text-theme-tertiary mb-4">
                <span>
                  Mostrando {users.length} de {formatNumber(pagination.total)}{' '}
                  usuários
                </span>
                <span>
                  Página {pagination.page} de {pagination.pages}
                </span>
              </div>
            )}
          </div>
        </AnimatedItem>

        {/* Lista de Usuários */}
        {loading && users.length === 0 ? (
          <LoadingAdminState loadingName="usuários" />
        ) : users.length === 0 ? (
          <AnimatedCard className="classical-card p-8 text-center">
            <FiUsers className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-theme-secondary mb-4">
              Tente ajustar os filtros ou termo de busca
            </p>
            <Button
              variant="secondary"
              leftIcon={<FiX />}
              onClick={clearFilters}
            >
              Limpar Filtros
            </Button>
          </AnimatedCard>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <AnimatedCard
                key={user.id}
                className="classical-card hover:shadow-theme-glow transition-all duration-300"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Informações Principais */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center text-theme-primary font-bold text-lg">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>

                      {/* Dados Básicos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-theme-primary truncate">
                            {user.name || 'Usuário Sem Nome'}
                          </h3>
                          {user.userType && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.userType === 'TEACHER'
                                  ? 'bg-accent-purple/20 text-accent-purple'
                                  : user.userType === 'PROFESSIONAL'
                                  ? 'bg-accent-green/20 text-accent-green'
                                  : user.userType === 'MUSIC_STUDENT'
                                  ? 'bg-accent-blue/20 text-accent-blue'
                                  : 'bg-theme-secondary text-theme-tertiary'
                              }`}
                            >
                              {user.userType === 'MUSIC_STUDENT'
                                ? 'Estudante'
                                : user.userType === 'CASUAL_USER'
                                ? 'Casual'
                                : user.userType === 'PROFESSIONAL'
                                ? 'Profissional'
                                : user.userType === 'TEACHER'
                                ? 'Professor'
                                : user.userType}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-theme-tertiary">
                          <span className="flex items-center gap-1">
                            <FiMail className="w-4 h-4" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {new Date(user.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="hidden md:flex items-center gap-6 mx-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-accent-blue">
                          {formatDuration(user.totalStudyTime)}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Estudo
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-accent-green">
                          {formatNumber(user.annotationsCount)}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Anotações
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-accent-purple">
                          {formatNumber(user.uploadsCount)}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Uploads
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FiEye />}
                        onClick={() => setSelectedUser(user)}
                      >
                        Ver
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FiEdit3 />}
                        onClick={() => setEditingUser(user)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>

                  {/* Estatísticas Mobile */}
                  <div className="md:hidden mt-4 pt-4 border-t border-theme-primary">
                    <div className="flex justify-around text-center">
                      <div>
                        <div className="text-sm font-bold text-accent-blue">
                          {formatDuration(user.totalStudyTime)}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Estudo
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-accent-green">
                          {formatNumber(user.annotationsCount)}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Anotações
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-accent-purple">
                          {formatNumber(user.uploadsCount)}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          Uploads
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}

            {/* Botão Carregar Mais */}
            {pagination?.hasMore && (
              <div className="text-center pt-6">
                <Button
                  variant="secondary"
                  leftIcon={<FiMoreHorizontal />}
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Carregar Mais'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Ações em Lote */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-theme-secondary">
            <Button
              variant="primary"
              leftIcon={<FiUsers />}
              onClick={() => router.push('/admin/users')}
              className="flex-1"
            >
              Ver Analytics
            </Button>

            <Button
              variant="secondary"
              leftIcon={<FiDownload />}
              onClick={() => exportUsers(localFilters)}
              className="flex-1"
              disabled={loading}
            >
              Exportar Lista
            </Button>
          </div>
        </AnimatedItem>
      </AnimatedContainer>

      {/* Modals */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={() => {
            // TODO: Atualizar usuário na lista local
            setEditingUser(null);
            refreshData();
          }}
        />
      )}
    </PageContainer>
  );
}
