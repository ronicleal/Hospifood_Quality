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

  // Estados para controlar el envío
  const [enviando, setEnviando] = useState(false);
  const [encuestaCompletada, setEncuestaCompletada] = useState(false);

  // --- LEER EL HOSPITAL DESDE EL QR (URL) ---
  // Ejemplo: Si la URL es tusitio.com/?h=5, esto guardará el número 5. Si no hay nada, por defecto será 1.
  const hospitalIdUrl = new URLSearchParams(window.location.search).get('h') || '1';

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


  // --- ENVIAR A SUPABASE ---
  const enviarEncuesta = async () => {
    setEnviando(true);

    try{
      // 1. Guardar la Cabecera (Tabla: encuestas)
      const {data: encuestaGuardada, error: errorEncuesta} = await supabase
      .from('encuestas')
      .insert({
        hospital_id: parseInt(hospitalIdUrl), // Lo leeremos del QR.
        planta: datosEncuesta.planta,
        turno: datosEncuesta.turno,
        sugerencia: datosEncuesta.sugerencia
      })
      .select() // Pedimos que nos devuelva la encuesta recién creada para saber su ID
      .single();

      if(errorEncuesta) throw errorEncuesta;

      // 2. Preparar el detalle: Añadir el ID de la encuesta a las notas de las caritas
      const respuestasParaGuardar = datosEncuesta.respuestas.map(resp => ({
        encuesta_id: encuestaGuardada.id, // Enlazamos con la cabecera anterior
        parametro_id: resp.parametro_id,
        valor: resp.valor
      }));

      // 3. Guardar el detalle (Tabla: respuestas)
      const {error: errorRespuestas} = await supabase
      .from('respuestas')
      .insert(respuestasParaGuardar);

      if (errorRespuestas) throw errorRespuestas;


      // 4. ¡Todo perfecto! Mostramos el agradecimiento
      setEncuestaCompletada(true);


    }catch(error: any){
      console.error("❌ Error al guardar en Supabase:", error.message);
      alert("Hubo un problema de conexión al enviar la encuesta. Por favor, inténtelo de nuevo.");
    }finally{
      setEnviando(false); // Quitamos el estado de carga del botón
    }
  }

  // 1. Pantalla de carga inicial
  if (loading) return <div className="min-h-screen flex items-center justify-center text-sky-700 font-bold">Cargando encuesta real...</div>;


  // 2. Pantalla de Éxito (Si ya se ha enviado)
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

  // 3. La Encuesta Normal (Carrusel)
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 animate-fade-in">
      
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
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Unidad / Planta actual</label>
                <select 
                  value={datosEncuesta.planta}
                  onChange={e => setDatosEncuesta(prev => ({...prev, planta: e.target.value}))} 
                  className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-sky-300 outline-none text-lg cursor-pointer"
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Comida que valora</label>
                <select 
                  value={datosEncuesta.turno} 
                  onChange={e => setDatosEncuesta(prev => ({...prev, turno: e.target.value as any}))} 
                  className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-sky-300 outline-none text-lg cursor-pointer"
                >
                  <option value="" disabled>Seleccione el turno...</option>
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
            <textarea 
              value={datosEncuesta.sugerencia} 
              onChange={e => setDatosEncuesta(prev => ({...prev, sugerencia: e.target.value}))} 
              className="w-full p-5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-300 outline-none min-h-45 bg-white shadow-sm text-lg" 
              placeholder="Escriba aquí su mensaje (opcional)..."
            />
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