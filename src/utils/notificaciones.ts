import { supabase } from "../database/supabase/Client";
import emailjs from '@emailjs/browser';

export const notificarTemperaturaBaja = async (hospitalId: number, planta: string, turno: string) => {
    try {
        // 1. Obtener el nombre del hospital
        const { data: hospital } = await supabase
            .from('hospitales')
            .select('nombre')
            .eq('id', hospitalId)
            .single();

        const nombreHospital = hospital?.nombre || "Hospital Desconocido";

        // 2. Buscar a los gestores asignados a ese hospital y sacar SUS EMAILS
        const { data: asignaciones } = await supabase
            .from('perfiles_hospitales')
            .select('perfiles(nombre_completo, email)') 
            .eq('hospital_id', hospitalId);

        // 3. Juntar los correos separados por comas
        let correosDestino = "";
        if (asignaciones && asignaciones.length > 0) {
            correosDestino = asignaciones
                .map((a: any) => a.perfiles?.email)
                .filter((email: string) => email) 
                .join(','); 
        }

        // 👇 NUEVA LÓGICA: Si no hay gestores con correo, cancelamos el envío 👇
        if (!correosDestino) {
            console.warn(`El hospital ${nombreHospital} no tiene gestores con email asignados. Se cancela la alerta.`);
            return; // Salimos de la función sin gastar cuota de EmailJS
        }

        // 4. Preparamos los datos
        const datosAlerta = {
            hospital: nombreHospital,
            planta: planta,
            turno: turno,
            fecha: new Date().toLocaleString('es-ES'),
            mensaje: "⚠️ Un paciente acaba de registrar una puntuación igual o inferior a 2 puntos en la temperatura de la comida.",
            destinatarios: correosDestino 
        };

        console.log("Enviando alerta a EmailJS a:", correosDestino);

        // Envío Real
        const SERVICE_ID = "service_sabo058";    
        const TEMPLATE_ID = "template_to5ov4i";  
        const PUBLIC_KEY = "r9MSXIp7iFU-pQEDF";    

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            datosAlerta,
            PUBLIC_KEY
        );

        console.log("¡Alerta enviada correctamente! Status:", response.status);

    } catch (error) {
        console.error("Error al intentar notificar la bajada de temperatura:", error);
    }
};