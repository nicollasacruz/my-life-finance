import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useCategoriesStore } from '../stores/categoriesStore';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import CreateCategoryModal from '../components/categories/CreateCategoryModal';

export default function Categories() {
  const { activeWorkspace } = useWorkspaceStore();
  const { categories, fetchCategories, deleteCategory, seedDefaults, isLoading } = useCategoriesStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<null | (typeof categories)[number]>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'accounts-desc' | 'accounts-asc'>('name-asc');
  const [filterBy, setFilterBy] = useState<'all' | 'with-accounts' | 'empty'>('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchCategories(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchCategories]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async (category: (typeof categories)[number]) => {
    if (!activeWorkspace) return;
    const accountsCount = category._count?.accounts ?? 0;
    if (accountsCount > 0) {
      showToast('Não é possível excluir categorias com contas. Mova ou remova as contas antes.', 'error');
      return;
    }
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategory(activeWorkspace.id, category.id);
        showToast('Categoria removida.');
      } catch (error) {
        console.error('Failed to delete category:', error);
        showToast('Erro ao excluir categoria.', 'error');
      }
    }
  };

  const handleSeedDefaults = async () => {
    if (!activeWorkspace) return;
    setIsSeeding(true);
    try {
      await seedDefaults(activeWorkspace.id);
      await fetchCategories(activeWorkspace.id);
      showToast('Categorias padrão importadas.');
    } catch (error) {
      console.error('Failed to seed categories:', error);
      showToast('Erro ao importar categorias.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredCategories = categories
    .filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .filter((category) => {
      const count = category._count?.accounts ?? 0;
      if (filterBy === 'with-accounts') return count > 0;
      if (filterBy === 'empty') return count === 0;
      return true;
    });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const countA = a._count?.accounts ?? 0;
    const countB = b._count?.accounts ?? 0;

    switch (sortBy) {
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'accounts-desc':
        return countB - countA || a.name.localeCompare(b.name);
      case 'accounts-asc':
        return countA - countB || a.name.localeCompare(b.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (category: (typeof categories)[number]) => {
    setSelectedCategory(category);
    setIsCreateModalOpen(true);
  };

  if (!activeWorkspace) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Selecione um workspace</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="px-4 py-8 space-y-6">
        {/* Feedback */}
        {toast && (
          <div
            className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-sm font-semibold hover:underline"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
            <p className="mt-1 text-sm text-gray-500">
              Organize suas contas em categorias
            </p>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row sm:items-center">
            <button
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {isSeeding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                  Importando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Importar 40 Categorias
                </>
              )}
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Categoria
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar categoria..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1111.5 4a7.5 7.5 0 015.15 12.65z" />
              </svg>
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">A → Z</option>
                <option value="name-desc">Z → A</option>
                <option value="accounts-desc">Mais contas</option>
                <option value="accounts-asc">Menos contas</option>
              </select>

              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="with-accounts">Com contas</option>
                <option value="empty">Sem contas</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {sortedCategories.length} de {categories.length} categorias
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma categoria</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando uma categoria ou importe as categorias padrão
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={handleSeedDefaults}
                disabled={isSeeding}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {isSeeding ? 'Importando...' : 'Importar 40 Categorias'}
              </button>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Nova Categoria
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2"
              >
                <div className="flex flex-col items-center text-center flex-1">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl mb-3"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon || category.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {category._count?.accounts ?? 0} {(category._count?.accounts ?? 0) === 1 ? 'conta' : 'contas'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-center pt-1 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(category)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    disabled={(category._count?.accounts ?? 0) > 0}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-red-700 hover:bg-red-50"
                    title={(category._count?.accounts ?? 0) > 0 ? 'Não pode excluir categoria com contas' : 'Excluir'}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Category Modal */}
        <CreateCategoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          initialCategory={selectedCategory}
          onSaved={(mode) => showToast(mode === 'create' ? 'Categoria criada.' : 'Categoria atualizada.')}
        />
      </div>
    </AuthenticatedLayout>
  );
}
