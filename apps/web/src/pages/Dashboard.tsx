import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">My Life Finance</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Olá, {user?.name}</span>
              <Button variant="ghost" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Dashboard em Construção
              </h2>
              <p className="text-gray-600">
                A implementação do dashboard virá nas próximas fases
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
