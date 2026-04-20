import type { TurnoRepository } from "../repositories/TurnoRepository";
import { supabase } from "./Client";

export class SupabaseTurnoRepository implements TurnoRepository {
    
    async getTurnos(hospitalesIds: number[]) {
        if (!hospitalesIds || hospitalesIds.length === 0) return { data: [], error: null };
        
        const { data, error } = await supabase
            .from('turnos')
            .select('*')
            // .in busca en todos los hospitales que tenga asignados el gestor
            .in('hospital_id', hospitalesIds) 
            .order('id', { ascending: true });
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