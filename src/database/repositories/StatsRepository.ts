import type { DashboardData } from "../../interfaces/Estadisticas";

export interface StatsRepository{
    getDashboardStats(hospitalesIds: number[], isGlobal?: boolean, planta?: string | null): Promise<{data?: DashboardData; error?: any}>
}