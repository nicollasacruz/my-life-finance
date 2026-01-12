import { useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export function WorkspaceSelector() {
  const { workspaces, activeWorkspace, setActiveWorkspace, deleteWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (workspaces.length === 1) {
      alert('Você não pode excluir o único workspace. Crie outro antes de excluir este.');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o workspace "${workspaceName}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteWorkspace(workspaceId);
      } catch (error) {
        console.error('Failed to delete workspace:', error);
        alert('Erro ao excluir workspace. Você precisa ser OWNER para excluir.');
      }
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          + Criar Workspace
        </button>
        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">
                {activeWorkspace.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">{activeWorkspace.name}</div>
              <div className="text-xs text-gray-500">{activeWorkspace.type}</div>
            </div>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="p-2">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      activeWorkspace.id === workspace.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveWorkspace(workspace);
                        setIsOpen(false);
                      }}
                      className="flex-1 flex items-center gap-2 text-left min-w-0"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-semibold text-sm">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{workspace.name}</div>
                        <div className="text-xs text-gray-500">{workspace.type}</div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDeleteWorkspace(workspace.id, workspace.name, e)}
                      className="flex-shrink-0 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                      title="Excluir workspace"
                      aria-label="Excluir workspace"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 p-2">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  + Criar Workspace
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
