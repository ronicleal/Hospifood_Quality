import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../database/supabase/Client";

// Inicializamos Gemini con nuestra clave del .env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const consultarHospifoodBot = async (preguntaDelUsuario: string, hospitalId: number) => {
    try {
        // 1. Descargamos las últimas 50 encuestas del hospital para dárselas a leer a la IA
        const { data: encuestas, error } = await supabase
            .from('encuestas')
            .select('planta, turno, sugerencia, fecha')
            .eq('hospital_id', hospitalId)
            .order('fecha', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Limpiamos los datos para que la IA los entienda mejor (solo las que tienen sugerencias)
        const encuestasUtiles = encuestas?.filter(e => e.sugerencia && e.sugerencia.trim() !== '') || [];
        const contextoDatos = JSON.stringify(encuestasUtiles);

        // 2. Preparamos las "Instrucciones del Sistema" para Gemini
        const prompt = `
            Eres "Hospifood-Bot", un asistente experto en calidad alimentaria hospitalaria.
            Tu objetivo es ayudar al Responsable de Calidad a analizar las opiniones de los pacientes.
            
            A continuación, te proporciono un JSON con las sugerencias y quejas recientes de los pacientes de este hospital:
            ${contextoDatos}
            
            Reglas para tu respuesta:
            1. Responde de forma clara, profesional y concisa (usa viñetas si es necesario).
            2. Basa tu respuesta ÚNICAMENTE en los datos que te acabo de proporcionar.
            3. Si el usuario te pregunta algo que no está en los datos, dile amablemente que no tienes información suficiente en las encuestas recientes.
            
            Pregunta del Responsable de Calidad: "${preguntaDelUsuario}"
        `;

        // 3. Llamamos al modelo (usamos flash porque es el más rápido)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        
        return result.response.text();

    } catch (error) {
        console.error("Error al consultar a Gemini:", error);
        return "Lo siento, ha ocurrido un error al conectar con mis sistemas. Por favor, inténtalo más tarde.";
    }
};