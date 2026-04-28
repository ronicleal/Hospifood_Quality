export interface EncuestaHistorial {
    id: number;
    fechaOriginal: string;
    fecha: string;
    hora: string;
    turno: string;
    sugerencia: string;
    notaMedia: number;
    planta?: string; 
}

export interface HistorialRepository {
    getHistorial(hospitalesIds: number[], isAdmin?: boolean): Promise<{ data?: EncuestaHistorial[]; error?: any; }>;
}