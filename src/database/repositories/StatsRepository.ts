import type { DashboardData } from "../../interfaces/Estadisticas";

export interface StatsRepository{
    getDashboardStats(hospitalId: number): Promise<{data?: DashboardData; error?: any}>
}