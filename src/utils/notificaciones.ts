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

        // 2. Buscar a los gestores asignados y sacar SUS EMAILS + PREFERENCIA DE NOTIFICACIONES
        const { data: asignaciones } = await supabase
            .from('perfiles_hospitales')
            .select('perfiles(nombre_completo, email, notificaciones_activas)') // 👈 Añadido el campo nuevo
            .eq('hospital_id', hospitalId);

        // 3. Juntar los correos separados por comas
        let correosDestino = "";
        if (asignaciones && asignaciones.length > 0) {
            correosDestino = asignaciones
                // 👇 FILTRO CLAVE: Solo pasa si tiene email Y tiene las notificaciones activas
                .filter((a: any) => a.perfiles?.email && a.perfiles?.notificaciones_activas === true) 
                .map((a: any) => a.perfiles?.email)
                .join(','); 
        }

        // 4. Si no hay gestores con correo (o todos las tienen apagadas), cancelamos el envío
        if (!correosDestino) {
            console.warn(`El hospital ${nombreHospital} no tiene gestores con notificaciones activas. Se cancela la alerta.`);
            return; // Salimos de la función sin gastar cuota de EmailJS
        }

        // 5. Preparamos los datos
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
        const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;    
        const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;  
        const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;  

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            datosAlerta,
            PUBLIC_KEY
        );

        console.log("¡Alerta enviada correctamente! Status:", response.status);
hospital
    } catch (error) {
        console.error("Error al intentar notificar la bajada de temperatura:", error);
    }
};