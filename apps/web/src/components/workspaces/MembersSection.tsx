import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/stores/workspaceStore';

interface Member {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

interface Invite {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: string;
  token: string;
  expiresAt?: string;
  createdAt: string;
}

const roleLabels: Record<Member['role'], string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Membro',
  VIEWER: 'Viewer',
};

export function MembersSection() {
  const { activeWorkspace } = useWorkspaceStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Member['role']>('MEMBER');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    setError('');
    try {
      const [membersRes, invitesRes] = await Promise.all([
        api.get(`/workspaces/${activeWorkspace.id}/members`),
        api.get(`/workspaces/${activeWorkspace.id}/invites`),
      ]);
      setMembers(membersRes.data);
      setInvites(invitesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar membros');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeWorkspace]);

  const sendInvite = async () => {
    if (!activeWorkspace || !inviteEmail) return;
    setSaving(true);
    setError('');
    try {
      await api.post(`/workspaces/${activeWorkspace.id}/invites`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      setInviteRole('MEMBER');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar convite');
    } finally {
      setSaving(false);
    }
  };

  const updateRole = async (memberId: string, role: Member['role']) => {
    if (!activeWorkspace) return;
    setSaving(true);
    setError('');
    try {
      await api.patch(`/workspaces/${activeWorkspace.id}/members/${memberId}`, { role });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar membro');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!activeWorkspace) return;
    const ok = confirm('Remover este membro?');
    if (!ok) return;
    setSaving(true);
    setError('');
    try {
      await api.delete(`/workspaces/${activeWorkspace.id}/members/${memberId}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao remover membro');
    } finally {
      setSaving(false);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    if (!activeWorkspace) return;
    setSaving(true);
    setError('');
    try {
      await api.delete(`/workspaces/${activeWorkspace.id}/invites/${inviteId}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cancelar convite');
    } finally {
      setSaving(false);
    }
  };

  const resendInvite = async (token: string) => {
    setSaving(true);
    setError('');
    try {
      await api.post(`/invites/${token}/resend`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao reenviar convite');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Membros</h2>
          <p className="text-sm text-gray-500">Gerencie roles e convites.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr,220px,160px] gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="w-full h-11 px-3.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Member['role'])}
            className="h-11 px-3.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(roleLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={sendInvite}
            disabled={saving || !inviteEmail}
            className="h-11 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Enviar convite
          </button>
        </div>
        <p className="text-xs text-gray-500">
          O convite expira em 7 dias. Roles: Owner e Admin têm acesso total; Viewer é somente leitura.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Membros</h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-sm text-gray-500">Carregando...</div>
          ) : members.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Nenhum membro</div>
          ) : (
            members.map((member, index) => (
              <div
                key={member.id}
                className={`px-4 py-3 flex items-center justify-between gap-3 ${index !== members.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
                    {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {member.user.name || member.user.email}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{member.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => updateRole(member.id, e.target.value as Member['role'])}
                    disabled={member.role === 'OWNER' || saving}
                    className="px-3 py-2 h-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {member.role !== 'OWNER' && (
                    <button
                      onClick={() => removeMember(member.id)}
                      disabled={saving}
                      className="px-3 py-2 h-10 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Convites</h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {invites.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Nenhum convite enviado</div>
          ) : (
            invites.map((invite, index) => (
              <div
                key={invite.id}
                className={`px-4 py-3 flex items-center justify-between gap-3 ${index !== invites.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{invite.email}</div>
                  <div className="text-xs text-gray-500">{roleLabels[invite.role]}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full capitalize border ${
                      invite.status === 'PENDING'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : invite.status === 'ACCEPTED'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {invite.status.toLowerCase()}
                  </span>
                  {invite.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => resendInvite(invite.token)}
                        disabled={saving}
                        className="px-3 py-2 h-10 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Reenviar
                      </button>
                      <button
                        onClick={() => cancelInvite(invite.id)}
                        disabled={saving}
                        className="px-3 py-2 h-10 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
