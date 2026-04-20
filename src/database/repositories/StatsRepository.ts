import type { DashboardData } from "../../interfaces/Estadisticas";

export interface StatsRepository{
    getDashboardStats(hospitalesIds: number[], isAdmin?: boolean): Promise<{data?: DashboardData; error?: any}>
}