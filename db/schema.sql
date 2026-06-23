-- =====================================================================
--  UNIQUE GYM — Esquema de base de datos (PostgreSQL 14+)
--  Módulos: Entrenamiento · Composición corporal (pesa BIA) · Nutrición
--  SIN módulo de pagos. SIN IA.
--  Convenciones: snake_case, PK UUID, soft-delete (deleted_at), TZ.
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role     AS ENUM ('ADMIN','ENTRENADOR','CLIENTE','RECEPCION');
CREATE TYPE difficulty     AS ENUM ('PRINCIPIANTE','INTERMEDIO','AVANZADO');
CREATE TYPE objetivo_nutri AS ENUM ('PERDER_GRASA','GANAR_MUSCULO','MANTENER','RECOMPOSICION');
CREATE TYPE sexo_bio       AS ENUM ('HOMBRE','MUJER');

-- ---------- Organización ----------
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(120) NOT NULL, slogan VARCHAR(160), ciudad VARCHAR(80),
  logo_url TEXT, color_marca VARCHAR(9) DEFAULT '#1DDE10',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE sedes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  nombre VARCHAR(120) NOT NULL, direccion VARCHAR(200), capacidad INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Usuarios y roles ----------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
  role user_role NOT NULL DEFAULT 'CLIENTE',
  nombres VARCHAR(80) NOT NULL, apellidos VARCHAR(80) NOT NULL,
  documento VARCHAR(40),                 -- dato sensible (Ley 1581/2012)
  email VARCHAR(160) UNIQUE, telefono VARCHAR(40),
  password_hash TEXT, avatar_url TEXT,
  fecha_nac DATE, sexo sexo_bio, estatura_cm NUMERIC(5,1),
  objetivo objetivo_nutri, factor_actividad NUMERIC(4,3) DEFAULT 1.55,
  activo BOOLEAN NOT NULL DEFAULT true, acepta_datos BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_users_gym_role ON users(gym_id, role) WHERE deleted_at IS NULL;

CREATE TABLE trainer_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entrenador_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  desde DATE NOT NULL DEFAULT CURRENT_DATE, activo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (cliente_id, entrenador_id, activo)
);

-- ---------- Catálogo de ejercicios ----------
CREATE TABLE muscle_groups (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), nombre VARCHAR(60) NOT NULL UNIQUE);
CREATE TABLE equipment     (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), nombre VARCHAR(60) NOT NULL UNIQUE);
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  nombre VARCHAR(120) NOT NULL, descripcion TEXT, instrucciones TEXT,
  video_url TEXT, thumbnail_url TEXT,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  dificultad difficulty DEFAULT 'INTERMEDIO', es_publico BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ
);
CREATE TABLE exercise_muscles (
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_id UUID NOT NULL REFERENCES muscle_groups(id) ON DELETE CASCADE,
  es_primario BOOLEAN NOT NULL DEFAULT true, PRIMARY KEY (exercise_id, muscle_id)
);

-- ---------- Rutinas ----------
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creada_por UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  nombre VARCHAR(120) NOT NULL, objetivo VARCHAR(60), semanas INT DEFAULT 4,
  es_plantilla BOOLEAN NOT NULL DEFAULT false, activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ
);
CREATE TABLE routine_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  nombre VARCHAR(80) NOT NULL, orden INT NOT NULL DEFAULT 1, dia_semana INT
);
CREATE TABLE routine_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_day_id UUID NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  orden INT NOT NULL DEFAULT 1, series INT NOT NULL DEFAULT 3,
  reps_min INT, reps_max INT, peso_sugerido NUMERIC(6,2), descanso_seg INT DEFAULT 90, notas TEXT
);

-- ---------- Registro de entrenamiento ----------
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  routine_day_id UUID REFERENCES routine_days(id) ON DELETE SET NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(), duracion_min INT,
  volumen_total NUMERIC(10,2), completada BOOLEAN NOT NULL DEFAULT false, nota_cliente TEXT
);
CREATE INDEX idx_sessions_cliente ON workout_sessions(cliente_id, fecha DESC);
CREATE TABLE workout_set_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  numero_serie INT NOT NULL, peso NUMERIC(6,2), reps INT, rpe NUMERIC(3,1),
  completada BOOLEAN NOT NULL DEFAULT true
);

-- ---------- Composición corporal (pesa BIA) ----------
CREATE TABLE body_composition (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  fuente VARCHAR(20) DEFAULT 'PESA',     -- PESA (Bluetooth) o MANUAL
  peso_kg NUMERIC(5,2),
  grasa_pct NUMERIC(4,1),                -- % grasa corporal
  agua_pct NUMERIC(4,1),                 -- % agua
  musculo_kg NUMERIC(5,2),               -- masa muscular
  musculo_esqueletico_pct NUMERIC(4,1),
  hueso_kg NUMERIC(4,2),                 -- masa ósea
  grasa_visceral INT,                    -- índice (<=12 saludable)
  grasa_subcutanea_pct NUMERIC(4,1),
  proteina_pct NUMERIC(4,1),
  tmb_kcal INT,                          -- metabolismo basal
  edad_metabolica INT,
  imc NUMERIC(4,1),
  masa_libre_grasa_kg NUMERIC(5,2),
  es_atipica BOOLEAN NOT NULL DEFAULT false,  -- marcada por el agente estadistico (>3*MAD)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bodycomp_cliente ON body_composition(cliente_id, fecha DESC);

-- ---------- Nutrición por objetivo ----------
CREATE TABLE nutrition_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creada_por UUID REFERENCES users(id) ON DELETE SET NULL,
  objetivo objetivo_nutri NOT NULL,
  kcal_objetivo INT NOT NULL,
  proteina_g INT NOT NULL, carbos_g INT NOT NULL, grasa_g INT NOT NULL,
  agua_ml INT,
  notas TEXT, activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_nutriplan_cliente ON nutrition_plans(cliente_id) WHERE deleted_at IS NULL;
CREATE TABLE nutrition_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  nombre VARCHAR(60) NOT NULL,           -- Desayuno, Media mañana, Almuerzo...
  orden INT NOT NULL DEFAULT 1, kcal INT
);
CREATE TABLE nutrition_meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES nutrition_meals(id) ON DELETE CASCADE,
  alimento VARCHAR(120) NOT NULL, porcion VARCHAR(80), kcal INT,
  proteina_g NUMERIC(5,1), carbos_g NUMERIC(5,1), grasa_g NUMERIC(5,1)
);

-- ---------- Asistencia y clases ----------
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
  check_in TIMESTAMPTZ NOT NULL DEFAULT now(), metodo VARCHAR(20) DEFAULT 'QR'
);
CREATE INDEX idx_attendance_fecha ON attendance(check_in DESC);
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
  entrenador_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nombre VARCHAR(80) NOT NULL, inicia_at TIMESTAMPTZ NOT NULL, cupos INT NOT NULL DEFAULT 12
);
CREATE TABLE class_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE (class_id, cliente_id)
);

-- ---------- Push (FCM, gratis) ----------
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL UNIQUE, plataforma VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Seed mínimo ----------
INSERT INTO gyms (id, nombre, slogan, ciudad, color_marca)
VALUES ('00000000-0000-0000-0000-000000000001','Unique Gym','Forma tu cuerpo','Fusagasugá','#1DDE10');
INSERT INTO muscle_groups (nombre) VALUES
 ('Pecho'),('Espalda'),('Hombros'),('Bíceps'),('Tríceps'),
 ('Cuádriceps'),('Femoral'),('Glúteos'),('Core'),('Pantorrilla');
INSERT INTO equipment (nombre) VALUES
 ('Barra'),('Mancuerna'),('Máquina'),('Polea'),('Peso corporal'),('Kettlebell');
-- Fin del esquema.
