import type { ParametroRepository } from "../repositories/ParametroRepository";
import { supabase } from "./Client";

export class SupabaseParametroRepository implements ParametroRepository {
    
    async getParametros(hospitalesIds: number[]) {
        if (!hospitalesIds || hospitalesIds.length === 0) return { data: [], error: null };

        const { data, error } = await supabase
            .from('parametros')
            .select('*')
            .in('hospital_id', hospitalesIds) 
            .order('id', { ascending: true });
        return { data, error };
    }

    async createParametro(titulo: string, descripcion: string, hospitalId: number) {
        const { data, error } = await supabase
            .from('parametros')
            .insert([{ titulo, descripcion, activo: true, hospital_id: hospitalId }])
            .select()
            .single();
        return { data, error };
    }

    async toggleActivo(id: number, activo: boolean) {
        const { error } = await supabase.from('parametros').update({ activo }).eq('id', id);
        return { error };
    }

    async deleteParametro(id: number) {
        const { error } = await supabase.from('parametros').delete().eq('id', id);
        return { error };
    }
}