# Unique Gym — Cálculos y reglas de dominio

> Fuente de verdad del agente **logica-dominio**. Todo es determinista (matemática, no IA).
> El agente **backend** implementa esto como servicios; no inventa fórmulas.
> Aviso: la composición corporal y la nutrición son **orientativas**, no diagnóstico médico.

## 1. Nutrición

### 1.1 Metabolismo basal (Mifflin-St Jeor)
```
Hombres: TMB = 10*peso_kg + 6.25*estatura_cm - 5*edad + 5
Mujeres: TMB = 10*peso_kg + 6.25*estatura_cm - 5*edad - 161
```

### 1.2 Gasto total diario (TDEE)
```
TDEE = TMB * factor_actividad
```
| Factor | Nivel |
|---|---|
| 1.2 | Sedentario |
| 1.375 | Ligero (1–3 días/sem) |
| 1.55 | Moderado (3–5 días/sem) |
| 1.725 | Intenso (6–7 días/sem) |
| 1.9 | Muy intenso (2x/día o trabajo físico) |

### 1.3 Calorías por objetivo
| Objetivo | kcal | Proteína | Grasa | Carbohidratos |
|---|---|---|---|---|
| PERDER_GRASA | TDEE − 300 a 500 (déficit ≤20%) | 1.8–2.2 g/kg | 25–30% kcal | resto |
| GANAR_MUSCULO | TDEE + 200 a 300 | 1.6–2.2 g/kg | ~25% kcal | resto |
| MANTENER | ≈ TDEE | ~1.6 g/kg | ~30% kcal | resto |
| RECOMPOSICION | ≈ TDEE | 2.0–2.2 g/kg | ~25% kcal | resto |

Conversión: proteína y carbohidratos = 4 kcal/g; grasa = 9 kcal/g.

### 1.4 Hidratación
```
agua_ml/día ≈ 35 * peso_kg   (sumar en días de entrenamiento)
```

## 2. Composición corporal (clasificación por rangos)
Para cada métrica devolver: `{ valor, estado: 'BAJO'|'SALUDABLE'|'ALTO', mensaje }`.

| Métrica | Saludable (referencia) |
|---|---|
| % grasa (hombre) | ~6–25% (esencial 2–5%) |
| % grasa (mujer) | ~20–35% (esencial 10–13%) |
| Grasa visceral (índice) | ≤12 saludable; 13+ elevado |
| % agua (hombre / mujer) | ~50–65% / ~45–60% |
| IMC | 18.5–24.9 |

> Ajustar % grasa por edad/sexo. Recordar que la BIA es estimación; lo que vale es la tendencia.

## 3. Entrenamiento (prescripción)
| Objetivo | Series | Reps | Descanso |
|---|---|---|---|
| Fuerza | 3–5 | 3–6 | 120–180 s |
| Hipertrofia | 3–4 | 8–12 | 60–90 s |
| Resistencia | 2–3 | 15–20 | 30–60 s |

Validaciones: una rutina debe tener ≥1 día; cada día ≥1 ejercicio; reps_min ≤ reps_max; series ≥1.

## 4. Entregables del agente
Funciones puras (sin efectos secundarios) + pruebas unitarias por cada fórmula y clasificación.
"Terminado" = documentado aquí + función implementada + casos de prueba verdes.
