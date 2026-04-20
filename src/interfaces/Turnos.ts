export interface Turno {
    id: number;
    nombre: string;
    activo: boolean;
    hospital_id: number;
    hospitales?: { nombre: string };
}