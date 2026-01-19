import { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

const typeLabels: Record<string, string> = {
  PERSONAL: 'Pessoal',
  HOUSEHOLD: 'Casa',
  BUSINESS: 'Negócio',
};

const typeColors: Record<string, { bg: string; text: string }> = {
  PERSONAL: { bg: 'bg-blue-100', text: 'text-blue-600' },
  HOUSEHOLD: { bg: 'bg-green-100', text: 'text-green-600' },
  BUSINESS: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

export function WorkspaceSelector() {
  const { workspaces, activeWorkspace, setActiveWorkspace, deleteWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Criar Workspace
        </button>
        <CreateWorkspaceModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    );
  }

  const colors = typeColors[activeWorkspace.type] || typeColors.PERSONAL;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className={`w-7 h-7 ${colors.bg} rounded-md flex items-center justify-center`}>
            <span className={`${colors.text} font-semibold text-sm`}>
              {activeWorkspace.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium text-gray-900 leading-tight">{activeWorkspace.name}</div>
            <div className="text-xs text-gray-500 leading-tight">{typeLabels[activeWorkspace.type] || activeWorkspace.type}</div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Workspaces</p>
            </div>

            {/* Workspace list */}
            <div className="py-1 max-h-64 overflow-y-auto">
              {workspaces.map((workspace) => {
                const wsColors = typeColors[workspace.type] || typeColors.PERSONAL;
                const isSelected = activeWorkspace.id === workspace.id;

                return (
                  <div
                    key={workspace.id}
                    className={`group flex items-center justify-between gap-2 mx-1 px-2 py-2 rounded-md transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveWorkspace(workspace);
                        setIsOpen(false);
                      }}
                      className="flex-1 flex items-center gap-2.5 text-left min-w-0"
                    >
                      <div className={`w-8 h-8 ${wsColors.bg} rounded-md flex items-center justify-center flex-shrink-0`}>
                        <span className={`${wsColors.text} font-semibold text-sm`}>
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                          {workspace.name}
                        </div>
                        <div className="text-xs text-gray-500">{typeLabels[workspace.type] || workspace.type}</div>
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDeleteWorkspace(workspace.id, workspace.name, e)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir workspace"
                      aria-label="Excluir workspace"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-1">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                Criar novo workspace
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
