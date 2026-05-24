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
            ultimo_acceso: gestor.ultimo_acceso, 
            hospitales: gestor.perfiles_hospitales || []
        }));
            
        return { data: datosFormateados as unknown as GestorData[], error };
    }

    async assignHospitales(gestorId: string, hospitalesIds: number[]) {
    
        await supabase.from('perfiles_hospitales').delete().eq('perfil_id', gestorId);
        
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

        await supabase.from('perfiles').delete().eq('id', id);

        const { error } = await supabase.rpc('borrar_usuario_completo', { usuario_id: id });
      
        return { error };
    }

    async updateUltimoAcceso(id: string) {
        const { error } = await supabase
            .from('perfiles')
            .update({ ultimo_acceso: new Date().toISOString() })
            .eq('id', id);
            
        return { error };
    }
}