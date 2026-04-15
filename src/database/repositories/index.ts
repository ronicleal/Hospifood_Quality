import { SupabaseHistorialRepository } from "../supabase/SupabaseHistorialRepository";
import { SupabaseStatsRepository } from "../supabase/SupabaseStatsRepository";
import { SupabaseUserRepository } from "../supabase/SupabaseUserRepository";
import type { HistorialRepository } from "./HistorialRepository";
import type { StatsRepository } from "./StatsRepository";
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