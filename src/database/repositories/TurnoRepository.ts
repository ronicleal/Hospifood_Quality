import type { Turno } from "../../interfaces/Turnos";

export interface TurnoRepository {
    getTurnos(hospitalesIds: number[]): Promise<{ data: Turno[] | null; error: any }>;
    createTurno(nombre: string, hospitalId: number): Promise<{ data: Turno | null; error: any }>;
    toggleActivo(id: number, activo: boolean): Promise<{ error: any }>;
    deleteTurno(id: number): Promise<{ error: any }>;
}