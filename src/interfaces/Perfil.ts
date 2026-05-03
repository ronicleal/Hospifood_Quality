export interface Perfil{
    id: string;
    nombre_completo: string;
    rol: "gestor" | "admin";
    hospitales?: number[];
    avatar_url?: string;
    ultimo_acceso?: string;
    notificaciones_activas?: boolean;
}

