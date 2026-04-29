import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from "../database/supabase/Client";

export interface UserProfile {
    id: string;
    nombre_completo: string;
    rol: "gestor" | "admin";
    hospitales: number[];
    avatar_url?: string;
    ultimo_acceso?: string; // 👈 Lo dejamos aquí en la interfaz
}

interface AuthState {
    session: any;
    profile: UserProfile | null;
    isAuthenticated: boolean;
    isAdmin: boolean;

    setSessionAndProfile: (session: any, profile: UserProfile) => void;
    clearSession: () => void;
    initialize: () => Promise<void>;
    updateAvatar: (newUrl: string) => void;
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
                            perfiles_hospitales ( hospital_id )
                        `)
                        .eq('id', session.user.id)
                        .single();

                    if (profileData) {
                        // Lógica para actualizar el último acceso al hacer login
                        const fechaActual = new Date().toISOString();
                        
                        // Fire-and-forget (actualiza en segundo plano)
                        supabase.from('perfiles')
                            .update({ ultimo_acceso: fechaActual })
                            .eq('id', session.user.id)
                            .then();

                        // Mapeamos TODOS los hospitales que tenga asignados
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
                                ultimo_acceso: fechaActual // Guardamos la fecha actual en memoria
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
            
        }),
        { name: 'hospifood-auth' }
    )
);