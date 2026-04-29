export interface GestorData {
    id: string;
    nombre_completo: string;
    hospitales: { hospital_id: number; hospitales: { nombre: string } }[];
    ultimo_acceso?: string | null; 
}

export interface GestorRepository {
    getGestores(): Promise<{ data: GestorData[] | null; error: any }>;
    assignHospitales(gestorId: string, hospitalesIds: number[]): Promise<{ error: any }>;
    deleteGestor(id: string): Promise<{ error: any }>;
    updateUltimoAcceso(id: string): Promise<{ error: any }>; 
}