export interface Parametro {
    id: number;
    titulo: string;
    descripcion: string;
    activo: boolean;
    hospital_id: number;
    hospitales?: { nombre: string };
}

