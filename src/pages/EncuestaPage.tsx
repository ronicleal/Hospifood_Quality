import { useEffect, useState } from "react";
import { ChevronRight, Clock, ShieldCheck, Utensils, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { supabase } from '../database/supabase/Client';
import type { Parametro } from "../interfaces/Parametro";
import type { Turno } from "../interfaces/Turnos";
import type { EstadoEncuesta } from "../interfaces/Respuestas";
import { BloquePregunta } from "../components/encuesta/BloquePregunta";
import heroImg from "../assets/portada.jpg"; 

// --- FUNCIÓN PARA ICONOS DINÁMICOS ---
const getIconoTurno = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('desayuno')) return '☕';
    if (n.includes('comida') || n.includes('almuerzo')) return '🍲';
    if (n.includes('cena')) return '🥗';
    if (n.includes('merienda')) return '🍎';
    if (n.includes('recena')) return '🥛';
    return '🍽️';
};

export const EncuestaPage = () => {
    // --- ESTADO DE NAVEGACIÓN ---
    const [pantalla, setPantalla] = useState<"bienvenida" | "preguntas">("bienvenida");
    const [pasoActual, setPasoActual] = useState(1); // Empezamos en 1 porque el paso 0 es la bienvenida

    // --- ESTADO DE DATOS ---
    const [preguntasDB, setPreguntasDB] = useState<Parametro[]>([]);
    const [turnosDB, setTurnosDB] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [encuestaCompletada, setEncuestaCompletada] = useState(false);

    const [datosEncuesta, setDatosEncuesta] = useState<EstadoEncuesta>({
        planta: '', turno: '' as any, sugerencia: '', respuestas: []
    });

    const hospitalIdUrl = new URLSearchParams(window.location.search).get('h') || '1';

    // --- CARGA DE DATOS DESDE SUPABASE ---
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

    // --- LÓGICA DE CONTROL ---
    const totalPreguntas = preguntasDB.length;
    const totalPasos = totalPreguntas + 1; // Preguntas + Sugerencia final

    const handleComenzar = () => {
        if (!datosEncuesta.planta || !datosEncuesta.turno) {
            alert("Por favor, selecciona la planta y la comida para comenzar.");
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
        setTimeout(() => {
            if (pasoActual <= totalPreguntas) setPasoActual(pasoActual + 1);
        }, 600); 
    };

    const enviarEncuesta = async () => {
        setEnviando(true);
        try {
            const { data: encuestaGuardada, error: errorEncuesta } = await supabase
                .from('encuestas')
                .insert({
                    hospital_id: parseInt(hospitalIdUrl), 
                    planta: datosEncuesta.planta,
                    turno: datosEncuesta.turno,
                    sugerencia: datosEncuesta.sugerencia
                }).select().single();

            if (errorEncuesta) throw errorEncuesta;

            const respuestasParaGuardar = datosEncuesta.respuestas.map(resp => ({
                encuesta_id: encuestaGuardada.id, 
                parametro_id: resp.parametro_id,
                valor: resp.valor
            }));

            const { error: errorRespuestas } = await supabase.from('respuestas').insert(respuestasParaGuardar);
            if (errorRespuestas) throw errorRespuestas;

            setEncuestaCompletada(true);
        } catch (error: any) {
            alert("Error al enviar: " + error.message);
        } finally {
            setEnviando(false); 
        }
    };

    // --- RENDERIZADO DE ESTADOS ESPECIALES ---
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

    // ==========================================
    // VISTA 1: LA BIENVENIDA (PANTALLA INICIAL)
    // ==========================================
    if (pantalla === "bienvenida") {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center z-10">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-primary/20">
                            <Utensils size={18} /> <span>Hospifood Quality</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
                            Tu opinión es nuestro <span className="text-primary">ingrediente principal</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-md mx-auto md:mx-0">
                            Ayúdanos a mejorar el servicio de alimentación. Queremos asegurarnos de que tu menú y tu estancia sean lo más agradables posible.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                                <Clock size={18} className="text-amber-500"/> <span>Solo 2 minutos</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                                <ShieldCheck size={18} className="text-emerald-500"/> <span>100% Anónimo</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-10 md:mt-10">
                        
                        {/* 👇 LA PORTADA PREMIUM, REDONDEADA Y LLAMATIVA 👇 */}
                        <div className="relative group flex items-center justify-center">
                            
                            {/* 1. Anillo de Luz de Fondo (Glow Effect) - Se anima al pasar el ratón */}
                            <div className="absolute -inset-2.5 bg-primary/30 rounded-full blur-2xl scale-100 opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out pointer-events-none" />
                            
                            {/* 2. Anillo de borde institucional */}
                            <div className="absolute -inset-3.75 border-2 border-primary/10 rounded-full group-hover:scale-105 transition-all duration-500 ease-out" />

                            {/* 3. La Imagen Redondeada PERFECTA (rounded-full) */}
                            <img 
                                src={heroImg} 
                                alt="Sanidad SES y Salud" 
                                className="relative w-64 h-64 sm:w-72 sm:h-72 object-cover rounded-full aspect-square shadow-2xl border-8 border-white z-20 group-hover:rotate-3 transition-transform duration-500 ease-out cursor-pointer object-center" 
                            />

                            {/* Un pequeño icono flotante para dar dinamismo */}
                            <div className="absolute top-5 right-5 z-30 bg-primary p-3 rounded-full text-white shadow-xl rotate-12 group-hover:rotate-0 transition-transform">
                                <Zap size={20} />
                            </div>
                        </div>

                        <Card className="w-full max-w-sm shadow-xl border-0 ring-1 ring-slate-100/50 bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-bold text-slate-700">¿En qué planta o unidad estás?</label>
                                    <select 
                                        className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                                        value={datosEncuesta.planta}
                                        onChange={e => setDatosEncuesta(prev => ({...prev, planta: e.target.value}))}
                                    >
                                        <option value="">Seleccionar unidad...</option>
                                        <option value="Planta 1">Planta 1</option>
                                        <option value="Planta 2">Planta 2</option>
                                        <option value="Planta 3">Planta 3</option>
                                        <option value="Maternidad">Maternidad</option>
                                        <option value="Urgencias">Urgencias</option>
                                        <option value="UCI">UCI</option>
                                    </select>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-sm font-bold text-slate-700">¿Qué comida vas a valorar?</label>
                                    <select 
                                        className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                                        value={datosEncuesta.turno}
                                        onChange={e => setDatosEncuesta(prev => ({...prev, turno: e.target.value as any}))}
                                    >
                                        <option value="">Seleccionar turno...</option>
                                        {turnosDB.map((t) => (
                                            <option key={t.id} value={t.nombre}>
                                                {getIconoTurno(t.nombre)} {t.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button onClick={handleComenzar} className="w-full h-12 text-md font-bold gap-2 mt-2 shadow-md">
                                    Comenzar Encuesta <ChevronRight size={20} />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // VISTA 2: LAS PREGUNTAS (SISTEMA POR PASOS)
    // ==========================================
    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-24 animate-fade-in">
            <header className="bg-card border-b border-border p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-extrabold text-primary">🏥 Hospifood <span className='font-light'>Quality</span></h1>
                    <span className="text-sm font-medium text-muted-foreground">Paso {pasoActual}/{totalPasos}</span>
                </div>
            </header>

            <main className="max-w-xl mx-auto p-4 md:p-6 pt-8">
                {/* Bloque de Preguntas Dinámicas */}
                {pasoActual <= totalPreguntas && (
                    <BloquePregunta 
                        pregunta={preguntasDB[pasoActual - 1]}
                        index={pasoActual - 1}
                        total={totalPreguntas}
                        valorSeleccionado={datosEncuesta.respuestas[pasoActual - 1]?.valor}
                        onSelect={manejarSeleccion}
                    />
                )}

                {/* Bloque Final de Sugerencia */}
                {pasoActual === totalPasos && (
                    <div className="space-y-6 animate-fade-in">
                         <div className="flex justify-center gap-1.5 mb-6">
                            {Array.from({ length: totalPreguntas }).map((_, i) => <div key={i} className="h-2.5 w-2.5 bg-green-500 rounded-full"/>)}
                            <div className="h-2.5 w-8 bg-primary rounded-full"/>
                         </div>
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-foreground">Para terminar...</h2>
                            <p className="text-muted-foreground mt-2">¿Tiene alguna sugerencia o recomendación de mejora?</p>
                        </div>
                        <textarea 
                            value={datosEncuesta.sugerencia} 
                            onChange={e => setDatosEncuesta(prev => ({...prev, sugerencia: e.target.value}))} 
                            className="w-full p-5 border border-input rounded-2xl focus:ring-2 focus:ring-ring outline-none min-h-45 bg-card shadow-sm text-lg" 
                            placeholder="Escriba aquí su mensaje (opcional)..."
                        />
                    </div>
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-10 shadow-lg">
                <div className="max-w-xl mx-auto flex gap-3">
                    <button 
                        onClick={() => pasoActual === 1 ? setPantalla("bienvenida") : setPasoActual(pasoActual - 1)} 
                        className="flex-1 bg-muted text-muted-foreground font-bold py-4 rounded-xl hover:bg-muted/80 transition-colors"
                    >
                        ← Anterior
                    </button>
                    
                    {pasoActual < totalPasos ? (
                        <button 
                            onClick={() => setPasoActual(pasoActual + 1)} 
                            disabled={datosEncuesta.respuestas[pasoActual - 1]?.valor === null}
                            className="flex-[2] bg-primary text-primary-foreground font-bold py-4 rounded-xl disabled:opacity-50"
                        >
                            Siguiente →
                        </button>
                    ) : (
                        <button 
                            onClick={enviarEncuesta}
                            disabled={enviando}
                            className="flex-[2] bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors"
                        >
                            {enviando ? 'Enviando...' : 'Finalizar y Enviar ✓'}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};