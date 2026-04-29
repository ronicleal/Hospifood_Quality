import type { GestorRepository, GestorData } from "../repositories/GestorRepository";
import { supabase } from "./Client";

export class SupabaseGestorRepository implements GestorRepository {
    
    async getGestores() {
        const { data, error } = await supabase
            .from('perfiles')
            .select(`
                id,
                nombre_completo,
                ultimo_acceso,
                perfiles_hospitales (
                    hospital_id,
                    hospitales ( nombre )
                )
            `)
            .eq('rol', 'gestor')
            .order('nombre_completo', { ascending: true });
        
        const datosFormateados = data?.map((gestor: any) => ({
            id: gestor.id,
            nombre_completo: gestor.nombre_completo,
            ultimo_acceso: gestor.ultimo_acceso, // 👈 Lo mapeamos
            hospitales: gestor.perfiles_hospitales || []
        }));
            
        return { data: datosFormateados as unknown as GestorData[], error };
    }

    async assignHospitales(gestorId: string, hospitalesIds: number[]) {
        // 1. Borramos todas las asignaciones anteriores de este gestor por limpieza
        await supabase.from('perfiles_hospitales').delete().eq('perfil_id', gestorId);

        // 2. Insertamos las nuevas asignaciones
        if (hospitalesIds.length > 0) {
            const relaciones = hospitalesIds.map(hId => ({
                perfil_id: gestorId,
                hospital_id: hId
            }));
            const { error: relError } = await supabase.from('perfiles_hospitales').insert(relaciones);
            if (relError) return { error: relError };
        }

        return { error: null };
    }

    async deleteGestor(id: string) {
        // 1. Primero borramos el perfil por si acaso no hay borrado en cascada
        await supabase.from('perfiles').delete().eq('id', id);

        // 2. Luego llamamos a nuestra función SQL segura para borrar la autenticación
        const { error } = await supabase.rpc('borrar_usuario_completo', { usuario_id: id });
      
        return { error };
    }

    // 👇 NUEVO MÉTODO PARA ACTUALIZAR LA FECHA DE ACCESO 👇
    async updateUltimoAcceso(id: string) {
        const { error } = await supabase
            .from('perfiles')
            .update({ ultimo_acceso: new Date().toISOString() })
            .eq('id', id);
            
        return { error };
    }
}