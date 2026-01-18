import { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As passwords não coincidem');
      return;
    }

    if (password.length < 8) {
      setError('A password deve ter pelo menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);

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
      setError(err.response?.data?.message || 'Erro ao registar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            My Life Finance
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crie a sua conta
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
              label="Nome"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu Nome"
              autoComplete="name"
            />

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
              autoComplete="new-password"
            />

            <Input
              label="Confirmar Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Registar
          </Button>

          <p className="text-center text-sm text-gray-600">
            Já tem conta?{' '}
            <Link
              to={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
