import type { EncuestaHistorial, HistorialRepository } from "../repositories/HistorialRepository";
import { supabase } from "./Client";

export class SupabaseHistorialRepository implements HistorialRepository {
    async getHistorial(hospitalId: number): Promise<{ data?: EncuestaHistorial[]; error?: any; }> {
        try {
            // Pedimos las encuestas y sus respuestas asociadas en una sola consulta
            const { data, error } = await supabase
                .from('encuestas')
                .select(`
                    id, fecha, turno, sugerencia,
                    respuestas (valor)
                `)
                .eq('hospital_id', hospitalId)
                .order('fecha', { ascending: false }); // Las más nuevas primero

            if (error) throw error;

            // Transformamos los datos para calcular la nota media de cada encuesta
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