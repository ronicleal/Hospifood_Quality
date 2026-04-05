import { SupabaseUserRepository } from "../supabase/SupabaseUserRepository";
import type { UserRepository } from "./UserRepository";

// Función "Factory" que crea y devuelve nuestro repositorio
export function createUserRepository(): UserRepository {
  return new SupabaseUserRepository();
}