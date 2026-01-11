import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useCategoriesStore } from '../stores/categoriesStore';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import CreateCategoryModal from '../components/categories/CreateCategoryModal';

export default function Categories() {
  const { activeWorkspace } = useWorkspaceStore();
  const { categories, fetchCategories, deleteCategory, seedDefaults, isLoading } = useCategoriesStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchCategories(activeWorkspace.id);
    }
  }, [activeWorkspace]);

  const handleDelete = async (id: string) => {
    if (!activeWorkspace) return;
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategory(activeWorkspace.id, id);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleSeedDefaults = async () => {
    if (!activeWorkspace) return;
    setIsSeeding(true);
    try {
      await seedDefaults(activeWorkspace.id);
      await fetchCategories(activeWorkspace.id);
    } catch (error) {
      console.error('Failed to seed categories:', error);
    } finally {
      setIsSeeding(false);
    }
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
      <div className="px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
            <p className="mt-1 text-sm text-gray-500">
              Organize suas contas em categorias
            </p>
          </div>
          <div className="flex gap-3">
            {categories.length === 0 && (
              <button
                onClick={handleSeedDefaults}
                disabled={isSeeding}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
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
            )}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Categoria
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
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
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
              >
                Nova Categoria
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl mb-3"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon || category.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {category.name}
                  </h3>
                  {(category._count?.accounts ?? 0) > 0 && (
                    <p className="text-xs text-gray-500">
                      {category._count?.accounts} {category._count?.accounts === 1 ? 'conta' : 'contas'}
                    </p>
                  )}

                  {/* Actions (shown on hover) */}
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={(category._count?.accounts ?? 0) > 0}
                      className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      title={(category._count?.accounts ?? 0) > 0 ? 'Não pode excluir categoria com contas' : 'Excluir'}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Category Modal */}
        <CreateCategoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </AuthenticatedLayout>
  );
}
