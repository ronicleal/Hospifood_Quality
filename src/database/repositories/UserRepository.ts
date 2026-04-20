import type { User } from "@supabase/supabase-js";
import type { Perfil } from "../../interfaces/Perfil";

// Definimos cómo será la respuesta que nos devuelve el login
export interface LoginResult {
    data?: {
        user: User;
        perfil: Perfil;
    };
    error?: any;
}

// Interfaz (Contrato) de lo que debe hacer nuestro repositorio
export interface UserRepository{
    // Busca los datos y el rol de nuestro trabajador
    getPerfilByUserId(userId: string): Promise<{ data: any | null; error: any }>;

    // Manejo de sesión
    login(email: string, password: string): Promise<{ data: any | null; error: any }>;
    logout(): Promise<{ error: any }>;

    register(email: string, contrasena: string, nombreCompleto: string): Promise<{ user: any; error: any }>;

    


    
}