import { useEffect, useMemo, useState } from 'react';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { MembersSection } from '../components/workspaces/MembersSection';
import type { WorkspaceType } from '@my-life-finance/shared-types';

const workspaceTypes: { value: WorkspaceType; label: string; description: string }[] = [
  { value: 'PERSONAL', label: 'Pessoal', description: 'Para finanças individuais' },
  { value: 'HOUSEHOLD', label: 'Casa', description: 'Para despesas da família' },
  { value: 'BUSINESS', label: 'Negócio', description: 'Para empresa ou freelance' },
];

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  PERSONAL: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  HOUSEHOLD: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  BUSINESS: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
};

export default function Workspace() {
  const { workspaces, activeWorkspace, fetchWorkspaces, setActiveWorkspace, createWorkspace, updateWorkspace, deleteWorkspace, isLoading } =
    useWorkspaceStore();

  const [form, setForm] = useState<{
    name: string;
    slug: string;
    type: WorkspaceType;
    description: string;
  }>({
    name: '',
    slug: '',
    type: 'PERSONAL',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const current = useMemo(() => activeWorkspace, [activeWorkspace]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (current) {
      setForm({
        name: current.name,
        slug: current.slug,
        type: current.type || 'PERSONAL',
        description: current.description || '',
      });
    }
  }, [current]);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    try {
      await updateWorkspace(current.id, {
        name: form.name,
        slug: form.slug,
        type: form.type,
        description: form.description || undefined,
      });
      setSuccessMessage('Alterações salvas com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao salvar workspace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    setIsSaving(true);
    setError('');
    try {
      const name = 'Novo workspace';
      const slug = `${slugify(name)}-${Date.now()}`;
      const ws = await createWorkspace({ name, slug, type: 'PERSONAL', description: '' });
      setActiveWorkspace(ws);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao criar workspace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    const ok = confirm('Deseja excluir este workspace? Isto removerá acesso aos dados dele.');
    if (!ok) return;
    setIsSaving(true);
    setError('');
    try {
      await deleteWorkspace(current.id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao excluir workspace');
    } finally {
      setIsSaving(false);
    }
  };

  if (!current && !isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Nenhum workspace</h1>
            <p className="text-gray-500 mb-6">Crie um workspace para começar a organizar suas finanças.</p>
            <button
              onClick={handleCreate}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Criar workspace
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const colors = typeColors[current?.type || 'PERSONAL'];

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
            <p className="mt-1 text-sm text-gray-500">Gerencie seu workspace e membros.</p>
          </div>

          {/* Workspace switcher */}
          {workspaces.length > 1 && (
            <div className="flex items-center gap-2">
              <select
                value={current?.id || ''}
                onChange={(e) => {
                  const next = workspaces.find((w) => w.id === e.target.value);
                  if (next) setActiveWorkspace(next);
                }}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Workspace Card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Card Header */}
          <div className={`px-6 py-4 ${colors.bg} border-b ${colors.border}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                <span className={`${colors.text} font-bold text-lg`}>
                  {current?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{current?.name}</h2>
                <p className="text-sm text-gray-600">
                  {workspaceTypes.find(t => t.value === current?.type)?.description || 'Workspace'}
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <form className="p-6 space-y-5" onSubmit={handleUpdate}>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do workspace</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug ? prev.slug : slugify(name),
                  }));
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Ex: Finanças Pessoais"
                required
              />
            </div>

            {/* Slug & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (URL)</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500">
                    /workspace/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-r-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as WorkspaceType })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                >
                  {workspaceTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descrição
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                placeholder="Uma breve descrição do workspace..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg disabled:opacity-50 transition-colors"
              >
                Excluir workspace
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleCreate}
                disabled={isSaving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 rounded-lg disabled:opacity-50 transition-colors"
              >
                Novo workspace
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* Members Section */}
        <MembersSection />
      </div>
    </AuthenticatedLayout>
  );
}
