import type { Parametro } from "../../interfaces/Parametro";

export interface ParametroRepository {
    getParametros(hospitalesIds: number[]): Promise<{ data: Parametro[] | null; error: any }>;
    createParametro(titulo: string, descripcion: string, hospitalId: number): Promise<{ data: Parametro | null; error: any }>;
    toggleActivo(id: number, activo: boolean): Promise<{ error: any }>;
    deleteParametro(id: number): Promise<{ error: any }>;
}