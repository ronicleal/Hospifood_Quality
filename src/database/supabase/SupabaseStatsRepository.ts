import type { DashboardData } from "../../interfaces/Estadisticas";
import type { StatsRepository } from "../repositories/StatsRepository";
import { supabase } from "./Client";

export class SupabaseStatsRepository implements StatsRepository {
    
    async getDashboardStats(hospitalesIds: number[], isAdmin: boolean = false): Promise<{ data?: DashboardData; error?: any; }> {
        try {
            // 1. Preparamos la consulta base (sin ejecutarla aún)
            let query = supabase
                .from('encuestas')
                .select('id, turno, sugerencia, fecha');

            // 2. Aplicamos el Muro de Seguridad si no es Administrador Global
            if (!isAdmin) {
                // Si es un gestor sin hospitales, cortamos aquí devolviendo contadores a cero
                if (!hospitalesIds || hospitalesIds.length === 0) {
                    return { data: { resumen: { totalEncuestas: 0, notaMedia: 0, mejorTurno: '-', totalSugerencias: 0 }, satisfaccion: [], evolucion: [] } };
                }
                // Si tiene hospitales, filtramos para que solo traiga los suyos
                query = query.in('hospital_id', hospitalesIds);
            }

            // 3. Ejecutamos la consulta final
            const { data: encuestas, error: errEnc } = await query;

            if (errEnc) throw errEnc;

            // Si no hay encuestas registradas en esos hospitales, devolvemos todo a cero
            if (!encuestas || encuestas.length === 0) {
                return { data: { resumen: { totalEncuestas: 0, notaMedia: 0, mejorTurno: '-', totalSugerencias: 0 }, satisfaccion: [], evolucion: [] } };
            }

            // 4. Obtener todas las respuestas de esas encuestas para calcular la media
            const { data: respuestas, error: errResp } = await supabase
                .from('respuestas')
                .select('encuesta_id, valor')
                .in('encuesta_id', encuestas.map(e => e.id));

            if (errResp) throw errResp;

            // --- PROCESAMIENTO DE DATOS (Lógica de Negocio) ---

            const totalEncuestas = encuestas.length;
            const totalSugerencias = encuestas.filter(e => e.sugerencia && e.sugerencia.trim() !== '').length;

            // Calcular nota media
            const sumaNotas = respuestas.reduce((acc, curr) => acc + (curr.valor || 0), 0);
            const notaMedia = totalEncuestas > 0 ? parseFloat((sumaNotas / respuestas.length).toFixed(1)) : 0;

            // Distribución para el gráfico de tarta (Satisfacción)
            const conteoNotas = [1, 2, 3, 4, 5].map(n => ({
                name: n === 5 ? 'Excelente' : n === 4 ? 'Bueno' : n === 3 ? 'Regular' : n === 2 ? 'Malo' : 'Pésimo',
                value: respuestas.filter(r => r.valor === n).length,
                color: n === 5 ? '#22c55e' : n === 4 ? '#84cc16' : n === 3 ? '#eab308' : n === 2 ? '#f97316' : '#ef4444'
            })).filter(item => item.value > 0);

            // --- PROCESAMIENTO COMPLEJO: EVOLUCIÓN SEMANAL ---

            // Diccionario inicial con contadores a cero
            const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const agrupadoPorDia: Record<string, { suma: number, cantidad: number }> = {
                'Lun': { suma: 0, cantidad: 0 }, 'Mar': { suma: 0, cantidad: 0 }, 'Mié': { suma: 0, cantidad: 0 },
                'Jue': { suma: 0, cantidad: 0 }, 'Vie': { suma: 0, cantidad: 0 }, 'Sáb': { suma: 0, cantidad: 0 },
                'Dom': { suma: 0, cantidad: 0 },
            };

            // Cruzamos las respuestas con la fecha de su encuesta
            respuestas.forEach(resp => {
                const encuesta = encuestas.find(e => e.id === resp.encuesta_id);
                if (encuesta && encuesta.fecha && resp.valor) {
                    const fecha = new Date(encuesta.fecha);
                    const nombreDia = diasSemana[fecha.getDay()]; // getDay() devuelve 0 para Dom, 1 para Lun...

                    agrupadoPorDia[nombreDia].suma += resp.valor;
                    agrupadoPorDia[nombreDia].cantidad += 1;
                }
            });

            // Convertimos el diccionario al formato que necesita Recharts [{dia: 'Lun', nota: 4.5}]
            const evolucionCalculada = Object.keys(agrupadoPorDia).map(dia => {
                const datosDia = agrupadoPorDia[dia];
                // Evitamos dividir por cero si un día no tiene encuestas
                const mediaDelDia = datosDia.cantidad > 0 ? (datosDia.suma / datosDia.cantidad) : 0;
                return {
                    dia: dia,
                    nota: parseFloat(mediaDelDia.toFixed(1))
                };
            });

            // Ordenamos el array para que siempre empiece en Lunes y acabe en Domingo
            const ordenDias = { 'Lun': 1, 'Mar': 2, 'Mié': 3, 'Jue': 4, 'Vie': 5, 'Sáb': 6, 'Dom': 7 };
            evolucionCalculada.sort((a, b) => ordenDias[a.dia as keyof typeof ordenDias] - ordenDias[b.dia as keyof typeof ordenDias]);

            return {
                data: {
                    resumen: {
                        totalEncuestas,
                        notaMedia,
                        mejorTurno: "Comida", // Esto se podría calcular agrupando turnos
                        totalSugerencias
                    },

                    satisfaccion: conteoNotas,
                    evolucion: evolucionCalculada
                }
            };


        } catch (error) {
            console.error("❌ Error real de Supabase:", JSON.stringify(error, null, 2));
            return { error };
        }
    }
}