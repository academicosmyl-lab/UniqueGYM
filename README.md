# Unique Gym — Plataforma (web + app)

Ecosistema propio de **Unique Gym**: entrenamiento con video, composición corporal (pesa BIA) y nutrición por objetivo. **Sin pagos. Sin IA en el producto.** Construido con un equipo de agentes de Claude Code, **local y gratis hasta estar 100% funcional**.

Desarrollado por **Asesorías Profesionales M&L** — *Acompañándote de principio a fin.*

## Estructura
```
unique-gym/
├── CLAUDE.md                  # contexto del proyecto (léelo primero)
├── docker-compose.yml         # PostgreSQL + Adminer local (gratis)
├── .env.example
├── .claude/agents/            # los 6 agentes (supervisor, diseno-ux, backend, frontend, logica-dominio, estadistica)
├── contracts/openapi.yaml     # contrato de la API
├── design/                    # tokens.json + components.md (sistema de diseño)
├── db/schema.sql              # modelo de datos PostgreSQL
├── domain/calculos.md         # fórmulas (Mifflin, macros, rangos, prescripción)
├── analytics/metricas.md      # estadística robusta (KPIs, tendencias)
├── backend/                   # esqueleto NestJS bootable
└── frontend/                  # instrucciones de scaffolding Angular + Ionic
```

## Arranque (Fase 0)
```bash
# 1) Base de datos local
docker compose up -d            # Postgres en :5432, Adminer en :8080

# 2) Backend
cd backend
cp ../.env.example .env
npm install
npm run start:dev               # http://localhost:3000/api/v1

# 3) Claude Code: abre el repo, ejecuta /agents para ver los 6 agentes,
#    arranca en Opus y deja que el "supervisor" dirija fase por fase.
```

## Cómo trabajan los agentes
El **supervisor** descompone el trabajo y delega. Los subagentes no se comunican entre sí: el supervisor relaya información a través de las **fuentes de verdad** (`openapi.yaml`, `tokens.json`, `schema.sql`, `calculos.md`, `metricas.md`). Se avanza **una fase a la vez** y cada entrega se valida contra la "Definición de Terminado" en `CLAUDE.md`.

## Costo
Fases 0–6 corren completas en **local + capas gratuitas** ($0). Solo en la Fase 7, ya con el producto 100% funcional, se evalúa pagar deploy/tiendas.
