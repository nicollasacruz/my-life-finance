# My Life Finance

PWA for monthly expense management with multi-workspace support, user permissions, fixed/recurring accounts, budget tracking, push notifications, and offline capabilities.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS + Zustand
- **Backend**: NestJS + TypeScript + Prisma
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ
- **Email**: Resend
- **PWA/Offline**: Workbox + Dexie.js (IndexedDB)
- **Infrastructure**: Docker + Nginx

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker and Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nicollasacruz/my-life-finance.git
   cd my-life-finance
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Docker services**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

6. **Generate Prisma Client**
   ```bash
   pnpm db:generate
   ```

7. **Start development servers**
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3000` and the web app at `http://localhost:5173`.

## Project Structure

```
my-life-finance/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # NestJS backend
├── packages/
│   └── shared-types/ # Shared TypeScript types
├── docker/           # Docker configurations
└── docker-compose.yml
```

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Lint all packages
- `pnpm test` - Run tests
- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio

## Development

### Database

- PostgreSQL runs on `localhost:5432`
- Access Prisma Studio: `pnpm db:studio`
- View database: `http://localhost:5555`

### Email Testing

- MailHog UI available at `http://localhost:8025`
- SMTP server on `localhost:1025`

### API Documentation

- Swagger docs available at `http://localhost:3000/docs`

## Features

- ✅ Multi-workspace (Personal/Household/Business)
- ✅ User roles and permissions (Owner/Admin/Member/Viewer)
- ✅ Fixed/recurring accounts with due dates
- ✅ Budget accounts with transaction tracking
- ✅ Push notifications for due dates and budget alerts
- ✅ Offline-first PWA with sync
- ✅ Email invites for workspace members

## License

MIT © [Nicollas Cruz](https://github.com/nicollasacruz)
