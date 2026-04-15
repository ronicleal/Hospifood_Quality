export interface EncuestaHistorial {
    id: number;
    fechaOriginal: string;
    fecha: string;
    hora: string;
    turno: string;
    sugerencia: string;
    notaMedia: number;
}

export interface HistorialRepository {
    getHistorial(hospitalId: number): Promise<{ data?: EncuestaHistorial[]; error?: any}>;
}

