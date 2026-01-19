import { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/';
  const emailFromUrl = params.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);

      const pendingInvite = localStorage.getItem('pendingInviteToken');
      if (pendingInvite) {
        try {
          await api.post(`/invites/${pendingInvite}/accept`);
          localStorage.removeItem('pendingInviteToken');
        } catch (inviteErr: any) {
          const msg = inviteErr?.response?.data?.message || 'Erro ao aceitar convite';
          setError(msg);
        }
      }

      navigate(next);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao fazer login';
      // Translate "Invalid credentials" to Portuguese
      const translatedMessage = message === 'Invalid credentials'
        ? 'Credenciais inválidas'
        : message;
      setError(translatedMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            My Life Finance
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entre na sua conta
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrar
          </Button>

          <p className="text-center text-sm text-gray-600">
            Não tem conta?{' '}
            <Link
              to={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Registar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
