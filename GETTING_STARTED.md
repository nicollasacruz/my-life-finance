# Getting Started - My Life Finance

## Fase 1 Concluída ✅

A fundação do projecto está completa. Tens agora:

- **Monorepo** configurado com pnpm workspace + Turborepo
- **Backend NestJS** com autenticação completa (register, login, refresh, logout)
- **Prisma Schema** completo com todas as entidades (User, Workspace, Account, Transaction, etc.)
- **Frontend React** com Vite, TailwindCSS e páginas de Login/Register
- **Docker Compose** para desenvolvimento (PostgreSQL, Redis, MailHog)

## Configuração Inicial

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edita o ficheiro `.env` e configura:
- `JWT_SECRET` - Gera uma string aleatória segura
- `JWT_REFRESH_SECRET` - Gera outra string aleatória segura
- Outras variáveis já têm valores por defeito que funcionam em desenvolvimento

### 3. Iniciar Serviços Docker

```bash
docker-compose up -d
```

Isto inicia:
- **PostgreSQL** em `localhost:5432`
- **Redis** em `localhost:6379`
- **MailHog** em `localhost:8025` (UI para testar emails)

### 4. Criar Base de Dados

```bash
cd apps/api
pnpm prisma:migrate
```

Isto cria a base de dados e aplica todas as migrações.

### 5. Gerar Prisma Client

```bash
pnpm prisma:generate
```

### 6. Iniciar Aplicações

Em terminais separados:

**Terminal 1 - Backend:**
```bash
cd apps/api
pnpm dev
```

API disponível em `http://localhost:3000`
Swagger docs em `http://localhost:3000/docs`

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

Frontend disponível em `http://localhost:5173`

## Testar a Aplicação

1. Abre `http://localhost:5173`
2. Clica em "Registar" e cria uma conta
3. Faz login com as credenciais
4. Deves ver o dashboard (ainda vazio)

## Próximas Fases

### Fase 2: Workspaces
- Criar, listar e gerir workspaces
- Sistema de convites por email
- Gestão de membros e roles

### Fase 3: Contas e Instâncias
- CRUD de contas FIXED e BUDGET
- Geração automática de instâncias mensais
- Marcar como pago/isento

### Fase 4: Transacções e Dashboard
- Registar transacções para contas BUDGET
- Dashboard completo com totais e alertas

### Fase 5: Jobs e Notificações
- BullMQ para jobs assíncronos
- Push notifications

### Fase 6: PWA e Offline
- Service Worker com Workbox
- IndexedDB com Dexie.js
- Sincronização offline

### Fase 7: Produção
- Docker Compose de produção
- CI/CD pipeline
- Backups automáticos

## Ferramentas Úteis

### Prisma Studio
Interface visual para a base de dados:
```bash
cd apps/api
pnpm prisma:studio
```
Disponível em `http://localhost:5555`

### MailHog
Interface para testar emails enviados:
`http://localhost:8025`

### Swagger API Docs
Documentação interactiva da API:
`http://localhost:3000/docs`

## Scripts Disponíveis

### Root
- `pnpm dev` - Inicia todos os apps em desenvolvimento
- `pnpm build` - Build de todos os apps
- `pnpm lint` - Lint de todos os packages
- `pnpm db:generate` - Gera Prisma Client
- `pnpm db:migrate` - Cria/aplica migrações
- `pnpm db:studio` - Abre Prisma Studio

### API
- `pnpm dev` - Inicia em modo desenvolvimento
- `pnpm build` - Build para produção
- `pnpm prisma:migrate` - Criar migration
- `pnpm prisma:studio` - Abrir Prisma Studio

### Web
- `pnpm dev` - Inicia Vite dev server
- `pnpm build` - Build para produção
- `pnpm preview` - Preview do build

## Troubleshooting

### Erro ao conectar à BD
Verifica se o Docker está a correr:
```bash
docker-compose ps
```

### Erro "PORT already in use"
Mata o processo que está a usar a porta:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Prisma Client desactualizado
Regenera o cliente:
```bash
cd apps/api
pnpm prisma:generate
```

## Estrutura do Projecto

```
my-life-finance/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/  # Feature modules
│   │   │   ├── prisma/   # Prisma service
│   │   │   └── common/   # Guards, decorators
│   │   └── prisma/       # Schema e migrations
│   └── web/              # React frontend
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── stores/
│           └── lib/
├── packages/
│   └── shared-types/     # TypeScript types
└── docker-compose.yml
```

## Próximos Passos

Agora que tens a fundação, podes:

1. **Testar a autenticação** - Regista, faz login, logout
2. **Explorar a API** - Usa o Swagger em `/docs`
3. **Ver a BD** - Usa o Prisma Studio
4. **Começar Fase 2** - Implementar workspaces

Boa codificação! 🚀
