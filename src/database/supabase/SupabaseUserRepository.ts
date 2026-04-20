// src/database/supabase/SupabaseUserRepository.ts
import { supabase } from "./Client";
import type { UserRepository } from "../repositories/UserRepository";

export class SupabaseUserRepository implements UserRepository {
  
  async getPerfilByUserId(userId: string) {
    const { data, error } = await supabase
      .from('perfiles') 
      .select('*')
      .eq('id', userId)
      .single();
      
    return { data, error };
  }

  async login(email: string, password: string) {
    // 1. Autenticar en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) return { data: null, error: authError };
    if (!authData.user) return { data: null, error: { message: 'No se recibió usuario tras login' } };

    // 2. Buscar si el usuario tiene un perfil y un rol asignado en nuestra tabla
    const { data: profileData, error: profileError } = await this.getPerfilByUserId(authData.user.id);

    // Medida de seguridad: Si está registrado pero no tiene perfil (no es trabajador del hospital), lo echamos
    if (profileError || !profileData) {
      await supabase.auth.signOut();
      return { data: null, error: profileError || { message: 'Usuario sin perfil asignado' } };
    }

    return {
      data: {
        user: authData.user,
        profile: profileData,
      },
      error: null
    };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }


  async register(email: string, contrasena: string, nombreCompleto: string) {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: contrasena,
        });

        if (error) return { user: null, error };

        if (data.user) {
            const { error: profileError } = await supabase.from('perfiles').insert([{
                id: data.user.id,
                nombre_completo: nombreCompleto,
                rol: 'gestor' 
            }]);

            if (profileError) return { user: null, error: profileError };
        }

        return { user: data.user, error: null };
    }
}