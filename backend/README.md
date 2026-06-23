# Backend — Unique Gym API (NestJS + PostgreSQL)

Esqueleto bootable. El agente `backend` agrega los módulos por fases.

## Arranque local (Fase 0)
```bash
# 1) Levanta PostgreSQL local (desde la raíz del repo)
docker compose up -d
# 2) Configura el backend
cp ../.env.example .env
npm install
npm run start:dev   # http://localhost:3000/api/v1
```
Convenciones en CLAUDE.md y en .claude/agents/backend.md.
