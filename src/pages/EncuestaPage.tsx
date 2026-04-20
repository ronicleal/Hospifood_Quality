import { useEffect, useState } from "react"
import type { Parametro } from "../interfaces/Parametro"
// 1. Importamos la interfaz Turno para TypeScript
import type { Turno } from "../interfaces/Turnos";
import { supabase } from '../database/supabase/Client';
import type { EstadoEncuesta } from "../interfaces/Respuestas";
import { BloquePregunta } from "../components/encuesta/BloquePregunta";


// --- FUNCIÓN PARA ICONOS DINÁMICOS ---
const getIconoTurno = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('desayuno')) return '☕';
    if (n.includes('comida') || n.includes('almuerzo')) return '🍲';
    if (n.includes('cena')) return '🥗';
    if (n.includes('merienda')) return '🍎';
    if (n.includes('recena')) return '🥛';
    return '🍽️'; // Icono por defecto si el gestor inventa un nombre raro
};

export const EncuestaPage = () => {
  // --- ESTADO ---
  const [preguntasDB, setPreguntasDB] = useState<Parametro[]>([]);
  const [turnosDB, setTurnosDB] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [pasoActual, setPasoActual] = useState(0);

  const [datosEncuesta, setDatosEncuesta] = useState<EstadoEncuesta>({
    planta: '', turno: '' as any, sugerencia: '', respuestas: []
  });

  const [enviando, setEnviando] = useState(false);
  const [encuestaCompletada, setEncuestaCompletada] = useState(false);

  const hospitalIdUrl = new URLSearchParams(window.location.search).get('h') || '1';

  // --- BUSCAR DATOS (SUPABASE) ---
  useEffect(() => {
    async function inicializarEncuesta() {
      const hospitalActivo = parseInt(hospitalIdUrl);

      // A. Buscamos las Preguntas (Solo ACTIVAS y del HOSPITAL ACTUAL)
      const { data: preguntasData, error: preguntasError } = await supabase
        .from('parametros')
        .select('*')
        .eq('activo', true) 
        .eq('hospital_id', hospitalActivo) 
        .order('id', { ascending: true });

      // B. Buscamos los Turnos (Solo ACTIVOS y del HOSPITAL ACTUAL)
      const { data: turnosData, error: turnosError } = await supabase
        .from('turnos')
        .select('*')
        .eq('activo', true) 
        .eq('hospital_id', hospitalActivo) 
        .order('id', { ascending: true });

      if (preguntasError || turnosError) {
        console.error("❌ Error Supabase:", preguntasError?.message || turnosError?.message);
      } else {
        setPreguntasDB(preguntasData || []);
        setTurnosDB(turnosData || []); // Guardamos los turnos
        
        const respuestasIniciales = (preguntasData || []).map(p => ({ parametro_id: p.id, valor: null }));
        setDatosEncuesta(prev => ({ ...prev, respuestas: respuestasIniciales }));
      }
      setLoading(false);
    }
    inicializarEncuesta();
  }, [hospitalIdUrl]);

  // --- LÓGICA DE NAVEGACIÓN ---
  const totalPreguntas = preguntasDB.length;
  const totalPasos = totalPreguntas + 1;

  const irSiguiente = () => {
    if (pasoActual < totalPasos) setPasoActual(pasoActual + 1);
  };

  const irAnterior = () => {
    if (pasoActual > 0) setPasoActual(pasoActual - 1);
  };

  const manejarSeleccion = (valor: number) => {
    setDatosEncuesta(prev => ({
      ...prev,
      respuestas: prev.respuestas.map((r, index) => 
        index === (pasoActual - 1) ? { ...r, valor } : r
      )
    }));
    setTimeout(irSiguiente, 600); 
  };

  const puedeAvanzar = () => {
    if (pasoActual === 0) return datosEncuesta.planta !== '' && (datosEncuesta.turno as string) !== '';
    if (pasoActual > 0 && pasoActual <= totalPreguntas) {
      return datosEncuesta.respuestas[pasoActual - 1]?.valor !== null;
    }
    return true; 
  };


  // --- ENVIAR A SUPABASE ---
  const enviarEncuesta = async () => {
    setEnviando(true);

    try{
      const {data: encuestaGuardada, error: errorEncuesta} = await supabase
      .from('encuestas')
      .insert({
        hospital_id: parseInt(hospitalIdUrl), 
        planta: datosEncuesta.planta,
        turno: datosEncuesta.turno,
        sugerencia: datosEncuesta.sugerencia
      })
      .select() 
      .single();

      if(errorEncuesta) throw errorEncuesta;

      const respuestasParaGuardar = datosEncuesta.respuestas.map(resp => ({
        encuesta_id: encuestaGuardada.id, 
        parametro_id: resp.parametro_id,
        valor: resp.valor
      }));

      const {error: errorRespuestas} = await supabase
      .from('respuestas')
      .insert(respuestasParaGuardar);

      if (errorRespuestas) throw errorRespuestas;

      setEncuestaCompletada(true);

    }catch(error: any){
      console.error("❌ Error al guardar en Supabase:", error.message);
      alert("Hubo un problema de conexión al enviar la encuesta. Por favor, inténtelo de nuevo.");
    }finally{
      setEnviando(false); 
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sky-700 font-bold">Cargando encuesta real...</div>;

  if(encuestaCompletada){
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">
          ✓
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">¡Encuesta Enviada!</h2>
        <p className="text-lg text-slate-600 max-w-md">
          Sus respuestas se han guardado correctamente. Muchas gracias por ayudarnos a mejorar el servicio de alimentación del hospital.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-24 animate-fade-in">
            
            {/* Header con bg-card y border-border */}
            <header className="bg-card border-b border-border p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-extrabold text-primary">🏥 Hospifood <span className='font-light'>Quality</span></h1>
                    {pasoActual > 0 && (
                         <span className="text-sm font-medium text-muted-foreground">Paso {pasoActual}/{totalPasos}</span>
                    )}
                </div>
            </header>

            <main className="max-w-xl mx-auto p-4 md:p-6 pt-8">
                
                {pasoActual === 0 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-foreground">Bienvenido</h2>
                            <p className="text-muted-foreground mt-2">Por favor, indíquenos dónde se encuentra para empezar.</p>
                        </div>
                        
                        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Unidad / Planta actual</label>
                                <select 
                                    value={datosEncuesta.planta}
                                    onChange={e => setDatosEncuesta(prev => ({...prev, planta: e.target.value}))} 
                                    className="w-full p-4 border border-input rounded-xl bg-background focus:ring-2 focus:ring-ring outline-none text-lg cursor-pointer"
                                >
                                    <option value="" disabled>Seleccione su planta...</option>
                                    <option value="Planta 1">Planta 1</option>
                                    <option value="Planta 2">Planta 2</option>
                                    <option value="Planta 3">Planta 3</option>
                                    <option value="Planta 4">Planta 4</option>
                                    <option value="Maternidad">Maternidad</option>
                                    <option value="Urgencias">Urgencias</option>
                                    <option value="UCI">UCI</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Comida que valora</label>
                                <select 
                                    value={datosEncuesta.turno} 
                                    onChange={e => setDatosEncuesta(prev => ({...prev, turno: e.target.value as any}))} 
                                    className="w-full p-4 border border-input rounded-xl bg-background focus:ring-2 focus:ring-ring outline-none text-lg cursor-pointer"
                                >
                                    <option value="" disabled>Seleccione el turno...</option>
                                    
                                    {turnosDB.map((turno) => (
                                        <option key={turno.id} value={turno.nombre}>
                                            {getIconoTurno(turno.nombre)} {turno.nombre}
                                        </option>
                                    ))}
                                    
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {pasoActual > 0 && pasoActual <= totalPreguntas && (
                    <BloquePregunta 
                        pregunta={preguntasDB[pasoActual - 1]}
                        index={pasoActual - 1}
                        total={totalPreguntas}
                        valorSeleccionado={datosEncuesta.respuestas[pasoActual - 1]?.valor}
                        onSelect={manejarSeleccion}
                    />
                )}

                {pasoActual === totalPasos && (
                    <div className="space-y-6 animate-fade-in">
                         <div className="flex justify-center gap-1.5 mb-6">
                                {Array.from({ length: totalPreguntas }).map((_, i) => <div key={i} className="h-2.5 w-2.5 bg-green-500 rounded-full"/>)}
                                <div className="h-2.5 w-8 bg-primary rounded-full"/>
                         </div>

                        <div className="text-center px-2">
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

            <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-10">
                <div className="max-w-xl mx-auto flex gap-3">
                    {pasoActual > 0 && (
                        <button onClick={irAnterior} className="flex-1 bg-muted text-muted-foreground font-bold py-4 rounded-xl hover:bg-muted/80 transition-colors">
                            ← Anterior
                        </button>
                    )}
                    
                    {pasoActual < totalPasos ? (
                        <button 
                            onClick={irSiguiente} 
                            disabled={!puedeAvanzar()}
                            className="flex-2 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente →
                        </button>
                    ) : (
                        <button 
                            onClick={enviarEncuesta}
                            disabled={enviando}
                            className="flex-2 bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50" 
                            style={{ flex: 2 }}
                        >
                            {enviando ? 'Enviando...' : 'Finalizar y Enviar ✓'}
                        </button>
                    )}
                </div>
            </footer>
        </div>
  );
}