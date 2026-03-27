import { useEffect, useState } from "react"
import type { Parametro } from "../interfaces/Parametro"
import { supabase } from '../database/supabase/Client';
import type { EstadoEncuesta } from "../interfaces/Respuestas";
import { BloquePregunta } from "../components/encuesta/BloquePregunta";

export const EncuestaPage = () => {
    // --- ESTADO ---
  const [preguntasDB, setPreguntasDB] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);

  // Control de navegación (Paso actual del carrusel)
  const [pasoActual, setPasoActual] = useState(0);

  // Datos acumulados de la encuesta (Estado temporal)
  const [datosEncuesta, setDatosEncuesta] = useState<EstadoEncuesta>({
    planta: '', turno: '' as any, sugerencia: '', respuestas: []
  });

  // --- BUSCAR DATOS (SUPABASE) ---
  useEffect(() => {
    async function inicializarEncuesta() {  
      const { data, error } = await supabase
        .from('parametros')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error("❌ Error Supabase:", error.message);
      } else {
        setPreguntasDB(data || []);
        // Preparo el array de respuestas vacío basándonos en las preguntas reales
        const respuestasIniciales = (data || []).map(p => ({ parametro_id: p.id, valor: null }));
        setDatosEncuesta(prev => ({ ...prev, respuestas: respuestasIniciales }));
      }
      setLoading(false);
    }
    inicializarEncuesta();
  }, []);

  // --- LÓGICA DE NAVEGACIÓN ---
  const totalPreguntas = preguntasDB.length;
  // Paso 0: Info Inicial / Pasos 1 a N: Preguntas / Paso N+1: Sugerencias
  const totalPasos = totalPreguntas + 1;

  const irSiguiente = () => {
    if (pasoActual < totalPasos) setPasoActual(pasoActual + 1);
  };

  const irAnterior = () => {
    if (pasoActual > 0) setPasoActual(pasoActual - 1);
  };

  // Guardar valor de una pregunta y avanzar automáticamente (más interactivo)
  const manejarSeleccion = (valor: number) => {
    setDatosEncuesta(prev => ({
      ...prev,
      respuestas: prev.respuestas.map((r, index) => 
        index === (pasoActual - 1) ? { ...r, valor } : r
      )
    }));
    // Pequeño delay para que vean la selección antes de pasar (UX)
    setTimeout(irSiguiente, 600); 
  };

  // Comprobar si se puede avanzar en el paso actual
  const puedeAvanzar = () => {
    if (pasoActual === 0) return datosEncuesta.planta !== '' && (datosEncuesta.turno as string) !== '';
    if (pasoActual > 0 && pasoActual <= totalPreguntas) {
      return datosEncuesta.respuestas[pasoActual - 1]?.valor !== null;
    }
    return true; // En sugerencias siempre se puede avanzar (es opcional)
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sky-700 font-bold">Cargando encuesta real...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      
      {/* Cabecera minimalista fija arriba */}
      <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-sky-800">🏥 Hospifood <span className='font-light'>Quality</span></h1>
          {pasoActual > 0 && (
             <span className="text-sm font-medium text-slate-500">Paso {pasoActual}/{totalPasos}</span>
          )}
        </div>
      </header>

      {/* Contenedor del Carrusel (Max-width ajustado para móvil) */}
      <main className="max-w-xl mx-auto p-4 md:p-6 pt-8">
        
        {/* --- RENDERIZADO CONDICIONAL DE PASOS --- */}

        {/* PASO 0: Datos Iniciales (Planta y Turno) */}
        {pasoActual === 0 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900">Bienvenido</h2>
              <p className="text-slate-600 mt-2">Por favor, indíquenos dónde se encuentra para empezar.</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Unidad / Planta</label>
                <input type="text" value={datosEncuesta.planta} onChange={e => setDatosEncuesta(prev => ({...prev, planta: e.target.value}))} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-sky-300 outline-none text-lg" placeholder="Ej: Planta 3 - Hab 301" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Comida que valora</label>
                <select value={datosEncuesta.turno} onChange={e => setDatosEncuesta(prev => ({...prev, turno: e.target.value as any}))} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-sky-300 outline-none text-lg cursor-pointer">
                  <option value="" disabled>Seleccione...</option>
                  <option value="Desayuno">☕ Desayuno</option>
                  <option value="Comida">🍲 Comida</option>
                  <option value="Cena">🥗 Cena</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PASOS 1 a N: Preguntas Dinámicas de Supabase */}
        {pasoActual > 0 && pasoActual <= totalPreguntas && (
          <BloquePregunta 
            pregunta={preguntasDB[pasoActual - 1]}
            index={pasoActual - 1}
            total={totalPreguntas}
            valorSeleccionado={datosEncuesta.respuestas[pasoActual - 1]?.valor}
            onSelect={manejarSeleccion}
          />
        )}

        {/* PASO FINAL: Sugerencias */}
        {pasoActual === totalPasos && (
          <div className="space-y-6 animate-fade-in">
             {/* Indicador de progreso final */}
             <div className="flex justify-center gap-1.5 mb-6">
                {Array.from({ length: totalPreguntas }).map((_, i) => <div key={i} className="h-2.5 w-2.5 bg-green-500 rounded-full"/>)}
                <div className="h-2.5 w-8 bg-sky-600 rounded-full"/>
             </div>

            <div className="text-center px-2">
              <h2 className="text-3xl font-extrabold text-slate-900">Para terminar...</h2>
              <p className="text-slate-600 mt-2">¿Tiene alguna sugerencia o recomendación de mejora?</p>
            </div>
            <textarea value={datosEncuesta.sugerencia} onChange={e => setDatosEncuesta(prev => ({...prev, sugerencia: e.target.value}))} className="w-full p-5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-300 outline-none min-h-[180px] bg-white shadow-sm text-lg" placeholder="Escriba aquí su mensaje (opcional)..."></textarea>
          </div>
        )}

      </main>

      {/* --- BARRA DE NAVEGACIÓN FIJA ABAJO --- */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0,05)] z-10">
        <div className="max-w-xl mx-auto flex gap-3">
          {pasoActual > 0 && (
            <button onClick={irAnterior} className="flex-1 bg-slate-100 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors">
              ← Anterior
            </button>
          )}
          
          {pasoActual < totalPasos ? (
            <button 
              onClick={irSiguiente} 
              disabled={!puedeAvanzar()}
              className="flex-2 bg-sky-600 text-white font-bold py-4 rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          ) : (
            <button className="flex-2 bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-colors">
              Finalizar y Enviar ✓
            </button>
          )}
        </div>
      </footer>
    </div>
  );

  
}