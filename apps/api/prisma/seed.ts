import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Common household categories for Portugal
  const categories = [
    // Habitação
    { name: 'Renda', color: '#EF4444', icon: '🏠', order: 1 },
    { name: 'Condomínio', color: '#F97316', icon: '🏢', order: 2 },
    { name: 'IMI', color: '#F59E0B', icon: '🏘️', order: 3 },

    // Utilities
    { name: 'Electricidade', color: '#FBBF24', icon: '⚡', order: 4 },
    { name: 'Água', color: '#3B82F6', icon: '💧', order: 5 },
    { name: 'Gás', color: '#EF4444', icon: '🔥', order: 6 },
    { name: 'Internet/TV', color: '#8B5CF6', icon: '📡', order: 7 },
    { name: 'Telemóvel', color: '#EC4899', icon: '📱', order: 8 },

    // Transporte
    { name: 'Combustível', color: '#6366F1', icon: '⛽', order: 9 },
    { name: 'Transportes Públicos', color: '#14B8A6', icon: '🚇', order: 10 },
    { name: 'Estacionamento', color: '#10B981', icon: '🅿️', order: 11 },
    { name: 'Seguro Auto', color: '#059669', icon: '🚗', order: 12 },
    { name: 'Manutenção Auto', color: '#84CC16', icon: '🔧', order: 13 },

    // Alimentação
    { name: 'Supermercado', color: '#22C55E', icon: '🛒', order: 14 },
    { name: 'Restaurantes', color: '#F97316', icon: '🍽️', order: 15 },
    { name: 'Café/Snacks', color: '#D97706', icon: '☕', order: 16 },

    // Saúde
    { name: 'Farmácia', color: '#DC2626', icon: '💊', order: 17 },
    { name: 'Seguro Saúde', color: '#EF4444', icon: '🏥', order: 18 },
    { name: 'Consultas Médicas', color: '#F87171', icon: '👨‍⚕️', order: 19 },
    { name: 'Ginásio', color: '#FB923C', icon: '💪', order: 20 },

    // Educação
    { name: 'Mensalidade Escola', color: '#3B82F6', icon: '🎓', order: 21 },
    { name: 'Material Escolar', color: '#60A5FA', icon: '📚', order: 22 },
    { name: 'Explicações', color: '#93C5FD', icon: '✏️', order: 23 },

    // Seguros
    { name: 'Seguro Habitação', color: '#8B5CF6', icon: '🛡️', order: 24 },
    { name: 'Seguro Vida', color: '#A78BFA', icon: '❤️', order: 25 },

    // Entretenimento
    { name: 'Streaming', color: '#EC4899', icon: '📺', order: 26 },
    { name: 'Cinema/Teatro', color: '#F472B6', icon: '🎬', order: 27 },
    { name: 'Viagens/Férias', color: '#FB7185', icon: '✈️', order: 28 },

    // Pessoal
    { name: 'Roupa/Calçado', color: '#06B6D4', icon: '👔', order: 29 },
    { name: 'Cabeleireiro', color: '#22D3EE', icon: '💇', order: 30 },
    { name: 'Produtos Higiene', color: '#67E8F9', icon: '🧴', order: 31 },

    // Casa
    { name: 'Limpeza Casa', color: '#14B8A6', icon: '🧹', order: 32 },
    { name: 'Reparações Casa', color: '#2DD4BF', icon: '🔨', order: 33 },
    { name: 'Móveis/Decoração', color: '#5EEAD4', icon: '🛋️', order: 34 },

    // Financeiro
    { name: 'Empréstimo Habitação', color: '#64748B', icon: '🏦', order: 35 },
    { name: 'Crédito Pessoal', color: '#94A3B8', icon: '💳', order: 36 },
    { name: 'Poupança', color: '#CBD5E1', icon: '💰', order: 37 },

    // Outros
    { name: 'Animais de Estimação', color: '#FB923C', icon: '🐕', order: 38 },
    { name: 'Presentes', color: '#F472B6', icon: '🎁', order: 39 },
    { name: 'Outros', color: '#9CA3AF', icon: '📌', order: 40 },
  ];

  console.log('📦 Creating categories...');

  // Note: These are global categories, but in production they would be
  // created per workspace. For seed purposes, we'll just log them.

  for (const category of categories) {
    console.log(`  ✓ ${category.icon} ${category.name} (${category.color})`);
  }

  console.log('\n💡 Note: Categories should be created per workspace.');
  console.log('   To create these categories for a workspace, use the API endpoint:');
  console.log('   POST /api/workspaces/:workspaceId/categories\n');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
