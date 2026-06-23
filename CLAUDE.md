# CLAUDE.md — Unique Gym

Contexto que Claude Code lee al iniciar cada sesión. **Léelo y respétalo siempre.**

## Qué es
Plataforma digital de **Unique Gym** ("Forma tu cuerpo"): **web** de gestión + **app** del cliente.
Tres módulos: **Entrenamiento** (rutinas con video) · **Composición corporal** (pesa BIA) · **Nutrición por objetivo**.
Desarrollado por **Asesorías Profesionales M&L**.

## Principios no negociables
1. **Costo cero hasta terminar.** Todo local y en capas gratuitas. **No se paga ningún servicio** (hosting, tiendas, pasarela) hasta que el producto esté **100% funcional y aprobado** (ver `## Definición de Terminado`).
2. **PWA primero.** App instalable desde un link; tiendas solo al final, si se decide invertir.
3. **Sin IA en el producto.** La inteligencia es **lógica determinista** (fórmulas) y **estadística robusta** (matemática). Claude Code se usa solo para construir.
4. **Sin módulo de pagos** en este alcance.
5. **Marca Unique Gym:** verde `#1DDE10`, negro `#050505`, plata `#DCDCDC`. Español de Colombia.

## Stack
NestJS + PostgreSQL (backend) · Angular (web) · Ionic + Capacitor (app/PWA).

## Convenciones de código
- Backend: prefijo global `api/v1` en `main.ts`; `snake_case`; PK `UUID`; soft-delete `deleted_at`; timestamps con zona horaria.
- Roles: `ADMIN`, `ENTRENADOR`, `CLIENTE`, `RECEPCION`. Auth JWT + guard de roles. Contraseñas con hash.
- Datos de salud/composición = **sensibles** (Ley 1581/2012): consentimiento + acceso restringido.

## Equipo de agentes (en `.claude/agents/`)
`supervisor` (orquesta) · `diseno-ux` · `backend` · `frontend` · `logica-dominio` · `estadistica`.
Los subagentes **no se comunican entre sí**: el `supervisor` relaya y mantiene las fuentes de verdad.

## Fuentes de verdad (no duplicar; el supervisor las sincroniza)
- `CLAUDE.md` — este contexto.
- `contracts/openapi.yaml` — contrato de la API (Backend ↔ Frontend).
- `design/tokens.json` + `design/components.md` — diseño (Diseñador → Frontend).
- `db/schema.sql` — modelo de datos (Backend).
- `domain/calculos.md` — fórmulas (Lógico → Backend).
- `analytics/metricas.md` — métricas (Estadístico → Backend/Frontend).

## Plan por fases (local, $0)
0. **Setup local** — repos, PostgreSQL (docker compose), esqueletos.
1. **Diseño + contratos** — tokens, modelo de datos, OpenAPI.
2. **Entrenamiento (MVP)** — login, rutinas, video, registro de series.
3. **Composición corporal** — captura (pesa/manual), rangos, seguimiento.
4. **Nutrición por objetivo** — TMB/TDEE/macros, plan y menú.
5. **Estadística + dashboards** — tendencias robustas, KPIs, alertas por reglas.
6. **Integración + QA** → **"100% funcional"**.
7. *(Opcional, recién aquí se paga)* — deploy a VPS, PWA pública, tiendas.

## Definición de Terminado (100% funcional)
- [ ] Login por rol (admin/entrenador/cliente/recepción).
- [ ] App: rutina del día, ejercicio con video, registro de series, progreso.
- [ ] App: composición corporal (captura + seguimiento con rangos).
- [ ] App: nutrición por objetivo (calorías, macros, menú del día).
- [ ] Web: dashboard, constructor de rutinas, clientes, plan nutricional + composición, catálogo, asistencia QR.
- [ ] Estadística robusta (tendencias, adherencia, KPIs, alertas por reglas).
- [ ] App es PWA instalable. Todo corre local sin servicios de pago.
- [ ] Pruebas verdes en lógica y estadística. Sin IA en el producto.

## Cómo arrancar
1. `docker compose up -d` (PostgreSQL local).
2. `cd backend && cp ../.env.example .env && npm install && npm run start:dev`.
3. En Claude Code: `/agents` para verificar los 6 agentes; sesión principal en Opus; deja que el `supervisor` dirija **una fase a la vez**.
4. Costo de tokens: Haiku para explorar, Sonnet para construir, Opus solo para orquestar.
