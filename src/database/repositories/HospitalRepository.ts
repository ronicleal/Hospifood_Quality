import type { Hospital } from "../../interfaces/Hospital";

export interface HospitalRepository {
    getHospitales(): Promise<{ data: Hospital[] | null; error: any }>;
    createHospital(nombre: string, provincia: string, codigo_centro: string, area_salud: string): Promise<{ data: Hospital | null; error: any }>;
    toggleActivo(id: number, activo: boolean): Promise<{ error: any }>;
    deleteHospital(id: number): Promise<{ error: any }>;
}