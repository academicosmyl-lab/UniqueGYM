# Unique Gym — Métricas y estadística robusta

> Fuente de verdad del agente **estadistica**. Matemática y estadística clásica, **no IA**.
> El **backend** las expone como endpoints; el **frontend** las grafica.

## Principio de robustez
Los datos de la pesa (BIA) son ruidosos. Por eso:
- Usar **mediana** y **MAD** (desviación absoluta mediana) en vez de media/desviación cuando haya outliers.
- Suavizar series con **media móvil** (ventana 3–5).
- Tendencia con **regresión lineal simple** (pendiente = tasa de cambio).
- **Detección de atípicos:** marcar como atípica una medición si `|x − mediana| > 3 * MAD`; pedir confirmación antes de incluirla (campo `body_composition.es_atipica`).

```
MAD = mediana( |x_i − mediana(x)| )
```

## Métricas

### Entrenamiento
| Métrica | Entrada | Algoritmo | Salida |
|---|---|---|---|
| Volumen | set_logs | Σ (peso * reps) por sesión | número + serie temporal |
| Tendencia de volumen | sesiones | media móvil + pendiente lineal | { actual, pendiente } |
| Adherencia | sesiones programadas vs completadas | completadas / programadas | % |
| 1RM estimado | peso, reps | Epley: `1RM = peso * (1 + reps/30)` | número por ejercicio |
| Récords | set_logs | máximo histórico por ejercicio | lista con fecha |

### Composición corporal
| Métrica | Algoritmo |
|---|---|
| Tendencia % grasa / músculo | media móvil + pendiente; ignorar atípicos |
| Tasa de cambio | Δ por semana sobre la serie suavizada |
| Ubicación en rango | comparar valor suavizado vs rangos de domain/calculos.md |

### Nutrición
- Cumplimiento: kcal y macros reales vs objetivo del `nutrition_plan` (porcentaje y desviación).

### Dashboard (admin)
| KPI | Algoritmo |
|---|---|
| Clientes activos | usuarios con asistencia o sesión en N días |
| Asistencia | serie temporal por día; pico horario por hora |
| Adherencia promedio | media de adherencias por cliente |
| Alertas de retención (por reglas) | inasistencia > N días, o adherencia < X%, o tendencia de % grasa adversa |
| Distribución | percentiles (p25, p50, p75) de métricas clave |

## Formato de datos para gráficas
Cada métrica entrega un objeto estándar:
```json
{ "labels": ["S1","S2","S3"], "values": [42, 55, 60], "unidad": "ton", "tendencia": "subiendo" }
```

## Entregables
Funciones puras + pruebas (incluyendo casos con outliers). "Terminado" = documentado + implementado + pruebas verdes + formato de gráfica definido.
