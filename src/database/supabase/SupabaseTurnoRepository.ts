import type { TurnoRepository } from "../repositories/TurnoRepository";
import { supabase } from "./Client";

export class SupabaseTurnoRepository implements TurnoRepository {
    async getTurnos() {
        const { data, error } = await supabase
            .from('turnos')
            .select('*')
            .order('id', { ascending: true });
        return { data, error };
    }

    async createTurno(nombre: string) {
        const { data, error } = await supabase
            .from('turnos')
            .insert([{ nombre, activo: true }])
            .select()
            .single();
        return { data, error };
    }

    async toggleActivo(id: number, activo: boolean) {
        const { error } = await supabase
            .from('turnos')
            .update({ activo })
            .eq('id', id);
        return { error };
    }

    async deleteTurno(id: number) {
        const { error } = await supabase
            .from('turnos')
            .delete()
            .eq('id', id);
        return { error };
    }
}