export type Dificultad = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

export interface Exercise {
  id: string;
  nombre: string;
  descripcion?: string;
  instrucciones?: string;
  video_url?: string;
  thumbnail_url?: string;
  dificultad: Dificultad;
}

export interface RoutineExercise {
  id: string;
  orden: number;
  series: number;
  reps_min: number;
  reps_max: number;
  peso_sugerido?: number;
  descanso_seg: number;
  notas?: string;
  exercise: Exercise;
}

export interface RoutineDay {
  id: string;
  nombre: string;
  orden: number;
  dia_semana: string;
  routine_exercises: RoutineExercise[];
}

export interface WorkoutSession {
  id: string;
  routine_day_id: string;
  started_at: string;
}

export interface SetRecord {
  exercise_id: string;
  numero_serie: number;
  peso: number | null;
  reps: number | null;
  rpe?: number | null;
}
