export interface RespuestaEncuesta {
    parametro_id: number;
    valor: number | null;

}

export interface EstadoEncuesta {
    planta: string;
    turno: 'Desayuno' | 'Comida' | 'Cena';
    sugerencia: string;
    respuestas: RespuestaEncuesta[]; // Array de respuestas 1-5
}