import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface InviteDetails {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  createdAt: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  invitedBy?: {
    name?: string | null;
    email?: string | null;
  };
  isRegistered: boolean;
  isExpired: boolean;
}

export function Invite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Persist token so login/register can auto-accept
    localStorage.setItem('pendingInviteToken', token);

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/invites/${token}`);
        setInvite(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Convite não encontrado ou inválido');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const accept = async () => {
    if (!token) return;
    setAccepting(true);
    setError('');
    try {
      await api.post(`/invites/${token}/accept`);
      localStorage.removeItem('pendingInviteToken');
      navigate('/workspace');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  };

  const isInvalid = invite && invite.status !== 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="bg-white shadow rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Convite para workspace</p>
            <h1 className="text-2xl font-semibold text-gray-900">
              {invite?.workspace?.name || 'My Life Finance'}
            </h1>
          </div>

          {loading && <div className="text-sm text-gray-500">Carregando convite...</div>}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && invite && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Email:</span>
                <span>{invite.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Papel:</span>
                <span>{invite.role}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Status:</span>
                <span className="capitalize">{invite.status.toLowerCase()}</span>
              </div>
              {invite.invitedBy?.email && (
                <div className="text-sm text-gray-600">
                  Convidado por {invite.invitedBy.name || invite.invitedBy.email}
                </div>
              )}

              {isInvalid && (
                <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm">
                  Este convite não está mais ativo (status: {invite.status.toLowerCase()}).
                </div>
              )}

              {!isInvalid && (
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <button
                      onClick={accept}
                      disabled={accepting}
                      className="w-full inline-flex justify-center px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {accepting ? 'Aceitando...' : 'Aceitar convite'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to={`/login?next=/invite/${token}`}
                        className="w-full inline-flex justify-center px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Já tenho conta
                      </Link>
                      <Link
                        to={`/register?next=/invite/${token}`}
                        className="w-full inline-flex justify-center px-4 py-2 rounded-lg text-blue-700 border border-blue-200 hover:bg-blue-50"
                      >
                        Criar conta e aceitar
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          Precisa de ajuda? Contacte o administrador do workspace.
        </div>
      </div>
    </div>
  );
}

export default Invite;
