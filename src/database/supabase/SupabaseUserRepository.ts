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


  async register(email: string, contrasena: string, nombreCompleto: string, avatarUrl: string) {
    const { data, error } = await supabase.auth.signUp({ email, password: contrasena });
    if (error) return { user: null, error };

    if (data.user) {
      const { error: profileError } = await supabase.from('perfiles').insert([{
        id: data.user.id,
        nombre_completo: nombreCompleto,
        rol: 'gestor',
        avatar_url: avatarUrl,
        email: email
      }]);
      if (profileError) return { user: null, error: profileError };
    }
    return { user: data.user, error: null };
  }


  async updateProfile(
    userId: string,
    { avatarUrl, password, notificaciones_activas }: { avatarUrl?: string; password?: string; notificaciones_activas?: boolean }
  ) {
    // 1. Actualización de contraseña en Supabase Auth
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { error };
    }

    // 2. Preparar el objeto de actualización para la tabla 'perfiles'
    // Usamos un objeto dinámico para actualizar solo lo que se haya enviado
    const updates: any = {};

    if (avatarUrl !== undefined) {
      updates.avatar_url = avatarUrl;
    }

    if (notificaciones_activas !== undefined) {
      updates.notificaciones_activas = notificaciones_activas;
    }

    // 3. Si hay campos para actualizar en la tabla perfiles, ejecutamos la query
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('perfiles')
        .update(updates)
        .eq('id', userId);

      if (error) return { error };
    }

    return { error: null };
  }


  async sendResetPasswordEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // URL a la que volverá el usuario cuando haga clic en el correo
      redirectTo: `${window.location.origin}/recuperar-password/confirmar`,
    });
    return { error };
  }

  

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }







}