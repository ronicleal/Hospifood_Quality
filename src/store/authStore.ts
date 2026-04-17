import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from "../database/supabase/Client";

// Definimos cómo es el perfil de nuestro trabajador del hospital
export interface UserProfile {
    id: string;
    nombre_completo: string;
    rol: "gestor" | "admin";
}

interface AuthState {
    session: any; // La sesión pura de Supabase
    profile: UserProfile | null; // Los datos de nuestra tabla 'perfiles'
    isAuthenticated: boolean;
    isAdmin: boolean;

    // Acciones
    setSessionAndProfile: (session: any, profile: UserProfile) => void;
    clearSession: () => void;

    // Función helper para inicializar todo al cargar la app
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>() (
    persist(
        (set) => ({
            session: null,
            profile: null,
            isAuthenticated: false,
            isAdmin: false,

            setSessionAndProfile: (session, profile) => set ({
                session,
                profile,
                isAuthenticated: true,
                isAdmin: profile.rol === 'admin'
            }),

            clearSession: () => set ({
                session: null,
                profile: null,
                isAuthenticated: false,
                isAdmin: false
            }),

            // Esta función la llamaremos una sola vez al cargar la App para restaurar la sesión
            initialize: async () => {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // Si hay sesión en Supabase, buscamos su rol en nuestra tabla
                    const { data: profile } = await supabase
                        .from('perfiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    
                    if (profile) {
                        set({
                            session,
                            profile: profile as UserProfile,
                            isAuthenticated: true,
                            isAdmin: profile.rol === 'admin'
                        });

                    }else {
                        // Si por algún motivo existe en Auth pero no en nuestra tabla de perfiles
                        set({ session: null, profile: null, isAuthenticated: false, isAdmin: false });
                    }

                }else {
                    set({ session: null, profile: null, isAuthenticated: false, isAdmin: false });
                }
            }
        }),

        {
            name: 'hospifood-auth', // Nombre en localStorage
        }
    )
)