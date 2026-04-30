import { useEffect, useState } from "react";
import { supabase } from '../database/supabase/Client';
import type { Parametro } from "../interfaces/Parametro";
import type { Turno } from "../interfaces/Turnos";
import type { EstadoEncuesta } from "../interfaces/Respuestas";
import { EncuestaBienvenida } from "../components/encuesta/EncuestaBienvenida";
import { EncuestaFormulario } from "../components/encuesta/EncuestaFormulario";

import { ConfirmModal } from "../components/ui/ConfirmModal";

import { notificarTemperaturaBaja } from "../utils/notificaciones";

import { ThemeToggle } from "../components/ui/ThemeToggle";

// Controla datos y lógica, y delega toda la vista a los dos 
// componentes EncuestaBienvenida y EncuestaFormulario

export const EncuestaPage = () => {
    const [pantalla, setPantalla] = useState<"bienvenida" | "preguntas">("bienvenida");
    const [pasoActual, setPasoActual] = useState(1);

    const [preguntasDB, setPreguntasDB] = useState<Parametro[]>([]);
    const [turnosDB, setTurnosDB] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [encuestaCompletada, setEncuestaCompletada] = useState(false);

    const [modalAlerta, setModalAlerta] = useState<{isOpen: boolean; title: string; message: string; type: 'warning' | 'error'}>({ 
        isOpen: false, title: "", message: "", type: "warning" 
    });

    const [datosEncuesta, setDatosEncuesta] = useState<EstadoEncuesta>({
        planta: '', turno: '' as any, sugerencia: '', respuestas: []
    });

    const hospitalIdUrl = new URLSearchParams(window.location.search).get('h') || '1';

    useEffect(() => {
        async function inicializarEncuesta() {
            const hospitalActivo = parseInt(hospitalIdUrl);
            const [preguntasRes, turnosRes] = await Promise.all([
                supabase.from('parametros').select('*').eq('activo', true).eq('hospital_id', hospitalActivo).order('id', { ascending: true }),
                supabase.from('turnos').select('*').eq('activo', true).eq('hospital_id', hospitalActivo).order('id', { ascending: true })
            ]);

            if (preguntasRes.error || turnosRes.error) {
                console.error("❌ Error Supabase:", preguntasRes.error?.message || turnosRes.error?.message);
            } else {
                setPreguntasDB(preguntasRes.data || []);
                setTurnosDB(turnosRes.data || []);
                const respuestasIniciales = (preguntasRes.data || []).map(p => ({ parametro_id: p.id, valor: null }));
                setDatosEncuesta(prev => ({ ...prev, respuestas: respuestasIniciales }));
            }
            setLoading(false);
        }
        inicializarEncuesta();
    }, [hospitalIdUrl]);

    const totalPreguntas = preguntasDB.length;
    const totalPasos = totalPreguntas + 1;

    const handleComenzar = () => {
        if (!datosEncuesta.planta || !datosEncuesta.turno) {
            
            setModalAlerta({
                isOpen: true,
                title: "Faltan datos",
                message: "Por favor, selecciona la planta y la comida para comenzar.",
                type: "warning"
            });
            return;
        }
        setPantalla("preguntas");
        setPasoActual(1);
    };

    const manejarSeleccion = (valor: number) => {
        setDatosEncuesta(prev => ({
            ...prev,
            respuestas: prev.respuestas.map((r, index) => 
                index === (pasoActual - 1) ? { ...r, valor } : r
            )
        }));
        setTimeout(() => { if (pasoActual <= totalPreguntas) setPasoActual(pasoActual + 1); }, 600); 
    };

    const enviarEncuesta = async () => {
        setEnviando(true);
        try {
            const { data: encuestaGuardada, error: errorEncuesta } = await supabase
                .from('encuestas')
                .insert({
                    hospital_id: parseInt(hospitalIdUrl), planta: datosEncuesta.planta, turno: datosEncuesta.turno, sugerencia: datosEncuesta.sugerencia
                }).select().single();

            if (errorEncuesta) throw errorEncuesta;

            const respuestasParaGuardar = datosEncuesta.respuestas.map(resp => ({
                encuesta_id: encuestaGuardada.id, parametro_id: resp.parametro_id, valor: resp.valor
            }));

            const { error: errorRespuestas } = await supabase.from('respuestas').insert(respuestasParaGuardar);
            if (errorRespuestas) throw errorRespuestas;

            // 👇 LÓGICA DE ALERTA DE TEMPERATURA INTEGRADA AQUÍ 👇
            const preguntaTemperatura = preguntasDB.find(p => p.titulo.toLowerCase().includes('temperatura'));
                
            
            if (preguntaTemperatura) {
                const respuestaTemp = datosEncuesta.respuestas.find(r => r.parametro_id === preguntaTemperatura.id);
                
                // Si la evaluó con 1 o 2, disparamos el email
                if (respuestaTemp && respuestaTemp.valor !== null && respuestaTemp.valor <= 2) {
                    notificarTemperaturaBaja(
                        parseInt(hospitalIdUrl), 
                        datosEncuesta.planta, 
                        datosEncuesta.turno
                    );
                }
            }
            // 👆 FIN DE LÓGICA DE ALERTA 👆

            setEncuestaCompletada(true);
        } catch (error: any) {
            
            setModalAlerta({
                isOpen: true,
                title: "Error al enviar",
                message: "Hubo un problema de conexión. Inténtalo de nuevo. " + error.message,
                type: "error"
            });
        } finally {
            setEnviando(false); 
        }
    };

    // --- VISTAS GLOBALES ---
    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold animate-pulse">Cargando encuesta...</div>;

    if (encuestaCompletada) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">✓</div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">¡Encuesta Enviada!</h2>
                <p className="text-lg text-slate-600 max-w-md">Muchas gracias por ayudarnos a mejorar el servicio de alimentación del hospital.</p>
            </div>
        );
    }

    // --- DELEGACIÓN DE VISTAS (RENDER) ---
    return (
        <>
            {/* Botón de Modo Oscuro flotante en la esquina */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {pantalla === "bienvenida" ? (
                <EncuestaBienvenida 
                    turnosDisponibles={turnosDB}
                    plantaSeleccionada={datosEncuesta.planta}
                    turnoSeleccionado={datosEncuesta.turno as string}
                    onChangePlanta={(val) => setDatosEncuesta(prev => ({...prev, planta: val}))}
                    onChangeTurno={(val) => setDatosEncuesta(prev => ({...prev, turno: val as any}))}
                    onComenzar={handleComenzar}
                />
            ) : (
                <EncuestaFormulario 
                    pasoActual={pasoActual}
                    totalPasos={totalPasos}
                    totalPreguntas={totalPreguntas}
                    preguntas={preguntasDB}
                    respuestasActuales={datosEncuesta.respuestas}
                    sugerencia={datosEncuesta.sugerencia}
                    enviando={enviando}
                    onSeleccion={manejarSeleccion}
                    onChangeSugerencia={(val) => setDatosEncuesta(prev => ({...prev, sugerencia: val}))}
                    onAnterior={() => pasoActual === 1 ? setPantalla("bienvenida") : setPasoActual(pasoActual - 1)}
                    onSiguiente={() => setPasoActual(pasoActual + 1)}
                    onFinalizar={enviarEncuesta}
                />
            )}

            
            <ConfirmModal 
                isOpen={modalAlerta.isOpen}
                title={modalAlerta.title}
                message={modalAlerta.message}
                type={modalAlerta.type}
                showCancel={false} 
                confirmText="Entendido"
                onConfirm={() => setModalAlerta(prev => ({ ...prev, isOpen: false }))}
                onCancel={() => setModalAlerta(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
};