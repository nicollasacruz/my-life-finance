# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-01-10
### Added
- Setup API app with NestJS, Prisma, PostgreSQL config and Docker compose for Postgres/Redis.
- Implemented auth module with email/password register/login, JWT access/refresh (single-use rotation), logout, and `/auth/me`.
- Added Prisma schema and migrations for `User`, `RefreshToken`, and `PushSubscription`, plus generated Prisma client.
- Added Swagger docs at `/docs` with tagged/auth endpoints and request schemas documented.

## [Unreleased]
### Planned
- Workspaces (agregados), members/invites, roles guards.
- Categories, accounts, account instances, transactions, dashboard.
- Notifications, jobs (BullMQ), PWA/offline sync, production infra.
