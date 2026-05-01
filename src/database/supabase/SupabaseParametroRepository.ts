import type { Parametro } from "../../interfaces/Parametro";
import type { ParametroRepository } from "../repositories/ParametroRepository";
import { supabase } from "./Client";

export class SupabaseParametroRepository implements ParametroRepository {
    
    async getParametros(hospitalesIds: number[], isAdmin?: boolean): Promise<{ data: Parametro[] | null; error: any }> {
        
        let query = supabase
            .from('parametros')
            .select('*, hospitales(nombre)')
            .order('id', { ascending: true });

        if (!isAdmin) {
            if (!hospitalesIds || hospitalesIds.length === 0) return { data: [], error: null };
            query = query.in('hospital_id', hospitalesIds);
        }

        const { data, error } = await query;
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

    async updateParametro(id: number, titulo: string, descripcion: string) {
        const { data, error } = await supabase
            .from('parametros')
            .update({ titulo, descripcion })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    }
}