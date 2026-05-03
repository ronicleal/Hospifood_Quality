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
import { Button } from "../components/ui/button"; // 👈 Asegúrate de importar el Button
import { RotateCcw } from "lucide-react"; // 👈 Un icono chulo para el botón de reiniciar

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

    // 👇 NUEVA FUNCIÓN: Resetea todos los estados al punto de partida 👇
    const reiniciarEncuesta = () => {
        setEncuestaCompletada(false);
        setPantalla("bienvenida");
        setPasoActual(1);
        setDatosEncuesta({
            planta: '', 
            turno: '' as any, 
            sugerencia: '', 
            respuestas: preguntasDB.map(p => ({ parametro_id: p.id, valor: null }))
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 👇 NUEVO EFECTO: Temporizador de auto-reinicio tras 5 segundos 👇
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (encuestaCompletada) {
            timeout = setTimeout(() => {
                reiniciarEncuesta();
            }, 6000); // 6 segundos de espera antes de volver al inicio
        }
        return () => clearTimeout(timeout);
    }, [encuestaCompletada]);

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

            const preguntaTemperatura = preguntasDB.find(p => p.titulo.toLowerCase().includes('temperatura'));
                
            if (preguntaTemperatura) {
                const respuestaTemp = datosEncuesta.respuestas.find(r => r.parametro_id === preguntaTemperatura.id);
                
                if (respuestaTemp && respuestaTemp.valor !== null && respuestaTemp.valor <= 2) {
                    const { data: gestoresHospital } = await supabase
                        .from('perfiles_hospitales')
                        .select(`
                            perfil_id,
                            perfiles (
                                notificaciones_activas
                            )
                        `)
                        .eq('hospital_id', parseInt(hospitalIdUrl));

                    const algunGestorActivo = gestoresHospital?.some(
                        (relacion: any) => relacion.perfiles?.notificaciones_activas === true
                    );

                    if (algunGestorActivo) {
                        notificarTemperaturaBaja(
                            parseInt(hospitalIdUrl), 
                            datosEncuesta.planta, 
                            datosEncuesta.turno
                        );
                    }
                }
            }

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

    // 👇 PANTALLA FINAL ACTUALIZADA 👇
    if (encuestaCompletada) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
                {/* Opcional: El mismo fondo sutil de la bienvenida */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-green-100/80 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm border border-green-200">
                        ✓
                    </div>
                    <h2 className="text-3xl font-extrabold text-foreground mb-4">¡Encuesta Enviada!</h2>
                    <p className="text-lg text-muted-foreground max-w-md mb-8">
                        Muchas gracias por ayudarnos a mejorar el servicio de alimentación del hospital.
                    </p>

                    <Button onClick={reiniciarEncuesta} variant="outline" className="gap-2 border-border text-foreground hover:bg-muted">
                        <RotateCcw size={18} /> Volver al inicio
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4 animate-pulse">
                        Reiniciando automáticamente en unos segundos...
                    </p>
                </div>
            </div>
        );
    }

    // --- DELEGACIÓN DE VISTAS (RENDER) ---
    return (
        <>
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