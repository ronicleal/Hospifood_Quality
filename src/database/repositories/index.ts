import { SupabaseHistorialRepository } from "../supabase/SupabaseHistorialRepository";
import { SupabaseHospitalRepository } from "../supabase/SupabaseHospitalRepository";
import { SupabaseParametroRepository } from "../supabase/SupabaseParametroRepository";
import { SupabaseStatsRepository } from "../supabase/SupabaseStatsRepository";
import { SupabaseTurnoRepository } from "../supabase/SupabaseTurnoRepository";
import { SupabaseUserRepository } from "../supabase/SupabaseUserRepository";
import type { HistorialRepository } from "./HistorialRepository";
import type { HospitalRepository } from "./HospitalRepository";
import type { ParametroRepository } from "./ParametroRepository";
import type { StatsRepository } from "./StatsRepository";
import type { TurnoRepository } from "./TurnoRepository";
import type { UserRepository } from "./UserRepository";

// Función "Factory" que crea y devuelve nuestro repositorio
export function createUserRepository(): UserRepository {
  return new SupabaseUserRepository();
}

export function createStatsRepository(): StatsRepository {
  return new SupabaseStatsRepository();
}

export function createHistorialRepository(): HistorialRepository {
  return new SupabaseHistorialRepository();
}

export function createTurnoRepository(): TurnoRepository {
    return new SupabaseTurnoRepository();
}

export function createParametroRepository(): ParametroRepository {
    return new SupabaseParametroRepository();
}

export function createHospitalRepository(): HospitalRepository {
    return new SupabaseHospitalRepository();
}

