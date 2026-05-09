import type { DashboardData } from "../../interfaces/Estadisticas";
import type { StatsRepository } from "../repositories/StatsRepository";
import { supabase } from "./Client";

// Actualizamos la interfaz interna para que TypeScript sepa que ahora devolvemos datos por planta
export interface DashboardDataAmpliado extends DashboardData {
    rendimientoPlantas?: { name: string; nota: number }[];
}

export class SupabaseStatsRepository implements StatsRepository {
    
    // 👇 Añadimos el nuevo parámetro planta (opcional) 👇
    async getDashboardStats(hospitalesIds: number[], isAdmin: boolean = false, planta: string | null = null): Promise<{ data?: DashboardDataAmpliado; error?: any; }> {
        try {
            // 1. Preparamos la consulta base
            let query = supabase
                .from('encuestas')
                .select('id, turno, sugerencia, fecha, planta'); // 👈 Aseguramos traer la planta

            // 2. Aplicamos el Muro de Seguridad si no es Administrador Global
            if (!isAdmin) {
                if (!hospitalesIds || hospitalesIds.length === 0) {
                    return { data: this.getEmptyData() };
                }
                query = query.in('hospital_id', hospitalesIds);
            }

            // 👇 2.5 Aplicamos el filtro de planta si el usuario ha seleccionado una 👇
            if (planta && planta !== "Todas") {
                query = query.eq('planta', planta);
            }

            // 3. Ejecutamos la consulta final
            const { data: encuestas, error: errEnc } = await query;

            if (errEnc) throw errEnc;

            if (!encuestas || encuestas.length === 0) {
                return { data: this.getEmptyData() };
            }

            // 4. Obtener todas las respuestas de esas encuestas
            const { data: respuestas, error: errResp } = await supabase
                .from('respuestas')
                .select('encuesta_id, valor')
                .in('encuesta_id', encuestas.map(e => e.id));

            if (errResp) throw errResp;

            // --- PROCESAMIENTO DE DATOS ---

            const totalEncuestas = encuestas.length;
            const totalSugerencias = encuestas.filter(e => e.sugerencia && e.sugerencia.trim() !== '').length;

            const sumaNotas = respuestas.reduce((acc, curr) => acc + (curr.valor || 0), 0);
            const notaMedia = totalEncuestas > 0 ? parseFloat((sumaNotas / respuestas.length).toFixed(1)) : 0;

            // Satisfacción
            const conteoNotas = [1, 2, 3, 4, 5].map(n => ({
                name: n === 5 ? 'Excelente' : n === 4 ? 'Bueno' : n === 3 ? 'Regular' : n === 2 ? 'Malo' : 'Pésimo',
                value: respuestas.filter(r => r.valor === n).length,
                color: n === 5 ? '#22c55e' : n === 4 ? '#84cc16' : n === 3 ? '#eab308' : n === 2 ? '#f97316' : '#ef4444'
            })).filter(item => item.value > 0);

            // Evolución Semanal
            const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const agrupadoPorDia: Record<string, { suma: number, cantidad: number }> = {
                'Lun': { suma: 0, cantidad: 0 }, 'Mar': { suma: 0, cantidad: 0 }, 'Mié': { suma: 0, cantidad: 0 },
                'Jue': { suma: 0, cantidad: 0 }, 'Vie': { suma: 0, cantidad: 0 }, 'Sáb': { suma: 0, cantidad: 0 },
                'Dom': { suma: 0, cantidad: 0 },
            };

            respuestas.forEach(resp => {
                const encuesta = encuestas.find(e => e.id === resp.encuesta_id);
                if (encuesta && encuesta.fecha && resp.valor) {
                    const fecha = new Date(encuesta.fecha);
                    const nombreDia = diasSemana[fecha.getDay()];
                    agrupadoPorDia[nombreDia].suma += resp.valor;
                    agrupadoPorDia[nombreDia].cantidad += 1;
                }
            });

            const evolucionCalculada = Object.keys(agrupadoPorDia).map(dia => {
                const datosDia = agrupadoPorDia[dia];
                const mediaDelDia = datosDia.cantidad > 0 ? (datosDia.suma / datosDia.cantidad) : 0;
                return { dia: dia, nota: parseFloat(mediaDelDia.toFixed(1)) };
            });

            const ordenDias = { 'Lun': 1, 'Mar': 2, 'Mié': 3, 'Jue': 4, 'Vie': 5, 'Sáb': 6, 'Dom': 7 };
            evolucionCalculada.sort((a, b) => ordenDias[a.dia as keyof typeof ordenDias] - ordenDias[b.dia as keyof typeof ordenDias]);

            // 👇 NUEVA LÓGICA: Calcular el Mejor Turno real 👇
            const agrupadoPorTurno: Record<string, { suma: number, cantidad: number }> = {};
            respuestas.forEach(resp => {
                const encuesta = encuestas.find(e => e.id === resp.encuesta_id);
                if (encuesta && encuesta.turno && resp.valor) {
                    if (!agrupadoPorTurno[encuesta.turno]) agrupadoPorTurno[encuesta.turno] = { suma: 0, cantidad: 0 };
                    agrupadoPorTurno[encuesta.turno].suma += resp.valor;
                    agrupadoPorTurno[encuesta.turno].cantidad += 1;
                }
            });

            let mejorTurno = '-';
            let mejorNotaTurno = 0;
            Object.keys(agrupadoPorTurno).forEach(turno => {
                const media = agrupadoPorTurno[turno].suma / agrupadoPorTurno[turno].cantidad;
                if (media > mejorNotaTurno) {
                    mejorNotaTurno = media;
                    mejorTurno = turno;
                }
            });

            // 👇 NUEVA LÓGICA: Calcular rendimiento por Plantas 👇
            const agrupadoPorPlanta: Record<string, { suma: number, cantidad: number }> = {};
            respuestas.forEach(resp => {
                const encuesta = encuestas.find(e => e.id === resp.encuesta_id);
                if (encuesta && encuesta.planta && resp.valor) {
                    if (!agrupadoPorPlanta[encuesta.planta]) agrupadoPorPlanta[encuesta.planta] = { suma: 0, cantidad: 0 };
                    agrupadoPorPlanta[encuesta.planta].suma += resp.valor;
                    agrupadoPorPlanta[encuesta.planta].cantidad += 1;
                }
            });

            const rendimientoPlantas = Object.keys(agrupadoPorPlanta).map(planta => {
                const media = agrupadoPorPlanta[planta].suma / agrupadoPorPlanta[planta].cantidad;
                return { name: planta, nota: parseFloat(media.toFixed(1)) };
            }).sort((a, b) => b.nota - a.nota); // Ordenamos de mayor a menor nota

            return {
                data: {
                    resumen: {
                        totalEncuestas,
                        notaMedia,
                        mejorTurno, 
                        totalSugerencias
                    },
                    satisfaccion: conteoNotas,
                    evolucion: evolucionCalculada,
                    rendimientoPlantas: rendimientoPlantas // 👈 Devolvemos la nueva métrica
                }
            };

        } catch (error) {
            console.error("❌ Error real de Supabase:", JSON.stringify(error, null, 2));
            return { error };
        }
    }

    // Función auxiliar para mantener el código limpio
    private getEmptyData() {
        return { 
            resumen: { totalEncuestas: 0, notaMedia: 0, mejorTurno: '-', totalSugerencias: 0 }, 
            satisfaccion: [], 
            evolucion: [],
            rendimientoPlantas: []
        };
    }
}