# Unique Gym — Guía de componentes

> Fuente de verdad de UI para el agente **frontend**. Usa siempre los valores de `design/tokens.json`.
> Tema oscuro. Marca verde/negro/plata. Español de Colombia.

## Principios
- App con fondo `negro`, superficies `superficie`. Acentos en `verde`.
- Títulos en tipografía **display** (condensada, cursiva, mayúsculas). Números en **datos**.
- Cada métrica de salud muestra un **badge de rango** (saludable/advertencia/fuera).
- Estados obligatorios en cada pantalla: **carga**, **vacío**, **error**.

## Componentes base
- **Botón primario:** fondo `verde`, texto `negro`, display itálica mayúscula, radio `md`, sombra `verde_glow`.
- **Botón fantasma:** fondo `superficie_3`, texto `texto`, borde `linea`.
- **Tarjeta:** fondo `superficie`, borde `linea`, radio `lg`, padding `md`.
- **Tarjeta destacada:** degradado sutil de verde, borde verde translúcido (para "rutina de hoy", "plan").
- **Campo de texto:** fondo `superficie`, borde `linea`, radio `md`, placeholder `apagado`.
- **Badge de rango:** `ok` (verde), `warn` (ámbar), `fuera` (rojo). Texto micro.
- **Chip:** borde verde translúcido, texto verde (para pesos, cupos, etiquetas).
- **Navegación inferior (app):** Hoy · Cuerpo · Nutrición · Progreso. Activo en `verde`.
- **Barra de rango:** degradado azul→verde→ámbar con un punto que marca el valor (composición corporal).
- **Gráfica de barras:** barras `verde` con etiqueta `apagado` debajo (volumen, % grasa, asistencia).
- **Tabla (web):** encabezado `apagado` en mayúsculas, filas con `linea`, badges de estado.

## Pantallas (specs entregadas por el agente diseno-ux)
Cada spec debe incluir: propósito, jerarquía visual, componentes usados, estados (carga/vacío/error), responsive (móvil/web).

App: login · rutina del día · detalle de ejercicio (video + registro de series) · progreso · composición corporal (captura + seguimiento) · nutrición (plan + menú) · clases.
Web: login · dashboard · constructor de rutinas · clientes/seguimiento · plan nutricional + composición · catálogo · asistencia QR.
