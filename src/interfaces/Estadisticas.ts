export interface ResumenKPI {
    totalEncuestas: number;
    notaMedia: number;
    mejorTurno: string;
    totalSugerencias: number;
}

export interface DatosGraficoSatisfaccion{
    name: string;
    value: number;
    color: string;
}

export interface DatosGraficoEvolucion{
    dia: string;
    nota: number;
}

export interface DashboardData {
    resumen: ResumenKPI;
    satisfaccion: DatosGraficoSatisfaccion[];
    evolucion: DatosGraficoEvolucion[];
}