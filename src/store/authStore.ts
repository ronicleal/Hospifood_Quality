import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from "../database/supabase/Client";
import type { Perfil } from '../interfaces/Perfil'; // 👈 1. Importamos la interfaz unificada

interface AuthState {
    session: any;
    profile: Perfil | null; // 👈 2. Usamos Perfil en lugar de UserProfile
    isAuthenticated: boolean;
    isAdmin: boolean;

    setSessionAndProfile: (session: any, profile: Perfil) => void;
    clearSession: () => void;
    initialize: () => Promise<void>;
    updateAvatar: (newUrl: string) => void;
    updateNotificaciones: (activas: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            session: null,
            profile: null,
            isAuthenticated: false,
            isAdmin: false,

            setSessionAndProfile: (session, profile) => set({
                session,
                profile,
                isAuthenticated: true,
                isAdmin: profile.rol === 'admin'
            }),

            clearSession: () => set({
                session: null,
                profile: null,
                isAuthenticated: false,
                isAdmin: false
            }),

            initialize: async () => {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const { data: profileData } = await supabase
                        .from('perfiles')
                        .select(`
                            id, 
                            nombre_completo, 
                            rol,
                            avatar_url,
                            ultimo_acceso,
                            notificaciones_activas,
                            perfiles_hospitales ( hospital_id )
                        `)
                        .eq('id', session.user.id)
                        .single();

                    if (profileData) {
                        const fechaActual = new Date().toISOString();
                        
                        supabase.from('perfiles')
                            .update({ ultimo_acceso: fechaActual })
                            .eq('id', session.user.id)
                            .then();

                        const hospitalesAsignados = profileData.perfiles_hospitales
                            ? (profileData.perfiles_hospitales as any[]).map(ph => ph.hospital_id)
                            : [];

                        set({
                            session,
                            profile: {
                                id: profileData.id,
                                nombre_completo: profileData.nombre_completo,
                                rol: profileData.rol as "gestor" | "admin",
                                hospitales: hospitalesAsignados,
                                avatar_url: profileData.avatar_url,
                                ultimo_acceso: fechaActual,
                                notificaciones_activas: profileData.notificaciones_activas // 👈 4. Lo guardamos en el estado
                            },
                            isAuthenticated: true,
                            isAdmin: profileData.rol === 'admin'
                        });
                    }
                }
            },

            updateAvatar: (newUrl: string) => set((state) => ({
                profile: state.profile ? { ...state.profile, avatar_url: newUrl } : null
            })),

            updateNotificaciones: (activas: boolean) => set((state) => ({
                profile: state.profile ? { ...state.profile, notificaciones_activas: activas } : null
            })),
            
        }),
        { name: 'hospifood-auth' }
    )
);