import type { Parametro } from "../../interfaces/Parametro";
import { BloquePregunta } from "./BloquePregunta";

// Este componente se encarga solo de pintar la cabecera, 
// llamar al BloquePregunta y pintar los botones de Atrás/Siguiente.

interface Props {
    pasoActual: number;
    totalPasos: number;
    totalPreguntas: number;
    preguntas: Parametro[];
    respuestasActuales: { parametro_id: number; valor: number | null }[];
    sugerencia: string;
    enviando: boolean;
    onSeleccion: (valor: number) => void;
    onChangeSugerencia: (text: string) => void;
    onAnterior: () => void;
    onSiguiente: () => void;
    onFinalizar: () => void;
}

export const EncuestaFormulario = ({ 
    pasoActual, totalPasos, totalPreguntas, preguntas, respuestasActuales, sugerencia, 
    enviando, onSeleccion, onChangeSugerencia, onAnterior, onSiguiente, onFinalizar 
}: Props) => {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-24 animate-fade-in">
            <header className="bg-card border-b border-border p-4 sticky top-0 z-10 shadow-sm">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-extrabold text-primary">🏥 Hospifood <span className='font-light'>Quality</span></h1>
                    <span className="text-sm font-medium text-muted-foreground">Paso {pasoActual}/{totalPasos}</span>
                </div>
            </header>

            <main className="max-w-xl mx-auto p-4 md:p-6 pt-8">
                {/* Preguntas */}
                {pasoActual <= totalPreguntas && (
                    <BloquePregunta 
                        pregunta={preguntas[pasoActual - 1]}
                        index={pasoActual - 1}
                        total={totalPreguntas}
                        valorSeleccionado={respuestasActuales[pasoActual - 1]?.valor}
                        onSelect={onSeleccion}
                    />
                )}

                {/* Paso Final: Sugerencia */}
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
                            value={sugerencia} 
                            onChange={e => onChangeSugerencia(e.target.value)} 
                            className="w-full p-5 border border-input rounded-2xl focus:ring-2 focus:ring-ring outline-none min-h-45 bg-card shadow-sm text-lg" 
                            placeholder="Escriba aquí su mensaje (opcional)..."
                        />
                    </div>
                )}
            </main>

            {/* Footer Navegación */}
            <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-10 shadow-lg">
                <div className="max-w-xl mx-auto flex gap-3">
                    <button 
                        onClick={onAnterior} 
                        className="flex-1 bg-muted text-muted-foreground font-bold py-4 rounded-xl hover:bg-muted/80 transition-colors"
                    >
                        ← Anterior
                    </button>
                    
                    {pasoActual < totalPasos ? (
                        <button 
                            onClick={onSiguiente} 
                            disabled={respuestasActuales[pasoActual - 1]?.valor === null}
                            className="flex-[2] bg-primary text-primary-foreground font-bold py-4 rounded-xl disabled:opacity-50"
                        >
                            Siguiente →
                        </button>
                    ) : (
                        <button 
                            onClick={onFinalizar}
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