import { useState } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export function WorkspaceSelector() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
                  <button
                    key={workspace.id}
                    onClick={() => {
                      setActiveWorkspace(workspace);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                      activeWorkspace.id === workspace.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {workspace.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{workspace.name}</div>
                        <div className="text-xs text-gray-500">{workspace.type}</div>
                      </div>
                    </div>
                  </button>
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
