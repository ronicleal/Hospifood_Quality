import type { LoginResult, UserRepository } from "../repositories/UserRepository";
import { supabase } from "./Client";

export class SupabaseUserRepository implements UserRepository {
    
    async login(email: string, password: string): Promise<LoginResult> {
        try {
            // 1. Autenticación segura con Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) return { error: authError };
            if (!authData.user) return { error: { message: 'No se recibió usuario tras el login' } };

            // 2. Buscar el Perfil en la tabla pública
            const { data: perfilData, error: perfilError } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (perfilError) {
                // Si no hay perfil, cerramos la sesión por seguridad
                await supabase.auth.signOut();
                return { error: perfilError };
            }

            // 3. Devolvemos todo empaquetado y limpio
            return {
                data: {
                    user: authData.user,
                    perfil: perfilData,
                },
            };

        } catch (error) {
            console.error('Error en SupabaseUserRepository.login:', error);
            return { error };
        }
    }

}