import type { Turno } from "../../interfaces/Turnos";
import type { TurnoRepository } from "../repositories/TurnoRepository";
import { supabase } from "./Client";

export class SupabaseTurnoRepository implements TurnoRepository {
    
    async getTurnos(hospitalesIds: number[], isAdmin?: boolean): Promise<{ data: Turno[] | null; error: any }> {
        
        let query = supabase
            .from('turnos')
            .select('*, hospitales(nombre)')
            .order('id', { ascending: true });
        
        if (!isAdmin) {
            if (!hospitalesIds || hospitalesIds.length === 0) return { data: [], error: null };
            query = query.in('hospital_id', hospitalesIds);
        }
        
        const { data, error } = await query;
        return { data, error };
    }

    async createTurno(nombre: string, hospitalId: number) {
        const { data, error } = await supabase
            .from('turnos')
            .insert([{ nombre, activo: true, hospital_id: hospitalId }])
            .select()
            .single();
        return { data, error };
    }

    async toggleActivo(id: number, activo: boolean) {
        const { error } = await supabase.from('turnos').update({ activo }).eq('id', id);
        return { error };
    }

    async deleteTurno(id: number) {
        const { error } = await supabase.from('turnos').delete().eq('id', id);
        return { error };
    }
}