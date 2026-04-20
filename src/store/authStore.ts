import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from "../database/supabase/Client";

export interface UserProfile {
    id: string;
    nombre_completo: string;
    rol: "gestor" | "admin";
    hospitales: number[];
}

interface AuthState {
    session: any; 
    profile: UserProfile | null; 
    isAuthenticated: boolean;
    isAdmin: boolean;

    setSessionAndProfile: (session: any, profile: UserProfile) => void;
    clearSession: () => void;
    initialize: () => Promise<void>;
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
                            perfiles_hospitales ( hospital_id )
                        `)
                        .eq('id', session.user.id)
                        .single();
                    
                    if (profileData) {
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
                                hospitales: hospitalesAsignados 
                            },
                            isAuthenticated: true,
                            isAdmin: profileData.rol === 'admin'
                        });
                    }
                }
            }
        }),
        { name: 'hospifood-auth' }
    )
);