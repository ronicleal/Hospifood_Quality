import type { EncuestaHistorial, HistorialRepository } from "../repositories/HistorialRepository";
import { supabase } from "./Client";

export class SupabaseHistorialRepository implements HistorialRepository {
    
    async getHistorial(hospitalesIds: number[], isAdmin: boolean = false): Promise<{ data?: EncuestaHistorial[]; error?: any; }> {
        try {
            // 1. Preparamos la consulta base
            let query = supabase
                .from('encuestas')
                .select(`
                    id, fecha, turno, sugerencia, planta,
                    respuestas (valor)
                `)
                .order('fecha', { ascending: false });

            // 2. Si NO es admin, filtramos por sus hospitales
            if (!isAdmin) {
                if (!hospitalesIds || hospitalesIds.length === 0) return { data: [] }; // Si no tiene hospitales, devolvemos vacío
                query = query.in('hospital_id', hospitalesIds);
            }

            // 3. Ejecutamos
            const { data, error } = await query;
            if (error) throw error;

            // Transformamos los datos
            const historialFormateado: EncuestaHistorial[] = data.map((encuesta: any) => {
                const respuestas = encuesta.respuestas || [];
                const suma = respuestas.reduce((acc: number, curr: any) => acc + (curr.valor || 0), 0);
                const media = respuestas.length > 0 ? (suma / respuestas.length) : 0;

                const dateObj = encuesta.fecha ? new Date(encuesta.fecha) : null;

                return {
                    id: encuesta.id,
                    fechaOriginal: encuesta.fecha || '',
                    fecha: dateObj ? dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-',
                    hora: dateObj ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-',
                    turno: encuesta.turno || 'N/A',
                    sugerencia: encuesta.sugerencia || '-',
                    planta: encuesta.planta || '-', // 👈 ¡Aquí mapeamos el nuevo campo!
                    notaMedia: parseFloat(media.toFixed(1))
                };
            });

            return { data: historialFormateado };

        } catch (error) {
            console.error("Error obteniendo historial:", error);
            return { error };
        }
    }
}