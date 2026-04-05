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
    login(email: string, password: string): Promise<LoginResult>;
    
}