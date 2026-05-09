import type { HospitalRepository } from "../repositories/HospitalRepository";
import { supabase } from "./Client";

export class SupabaseHospitalRepository implements HospitalRepository {
    async getHospitales() {
        const { data, error } = await supabase
            .from('hospitales')
            .select('*')
            .order('id', { ascending: true });
        return { data, error };
    }

    async createHospital(nombre: string, provincia: string, codigo_centro: string, area_salud: string) {
        const { data, error } = await supabase
            .from('hospitales')
            // Insertamos todos los campos que requiere tu BD
            .insert([{ nombre, provincia, codigo_centro, area_salud, activo: true }])
            .select()
            .single();
        return { data, error };
    }

    async toggleActivo(id: number, activo: boolean) {
        const { error } = await supabase.from('hospitales').update({ activo }).eq('id', id);
        return { error };
    }

    async deleteHospital(id: number) {
        const { error } = await supabase.from('hospitales').delete().eq('id', id);
        return { error };
    }

    async updateHospital(id: number, nombre: string, provincia: string, codigo_centro: string, area_salud: string) {
        const { data, error } = await supabase
            .from('hospitales')
            .update({ nombre, provincia, codigo_centro, area_salud })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    }
}