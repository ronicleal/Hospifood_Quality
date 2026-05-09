import { useState } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { consultarHospifoodBot } from '../../utils/gemini';

interface Mensaje {
    rol: 'ia' | 'usuario';
    texto: string;
}

export const ChatbotIA = ({ hospitalId }: { hospitalId: number }) => {
    const [abierto, setAbierto] = useState(false);
    const [pregunta, setPregunta] = useState('');
    const [cargando, setCargando] = useState(false);
    const [mensajes, setMensajes] = useState<Mensaje[]>([
        { rol: 'ia', texto: '¡Hola! Soy Hospifood-Bot ✨. He analizado las últimas encuestas de tu hospital. ¿Qué te gustaría saber?' }
    ]);

    const enviarPregunta = async () => {
        if (!pregunta.trim()) return;

        // Añadimos la pregunta del usuario al chat
        const nuevoMensajeUsuario: Mensaje = { rol: 'usuario', texto: pregunta };
        setMensajes(prev => [...prev, nuevoMensajeUsuario]);
        setPregunta('');
        setCargando(true);

        // Llamamos a nuestra función de Gemini
        const respuestaIA = await consultarHospifoodBot(nuevoMensajeUsuario.texto, hospitalId);

        // Añadimos la respuesta de la IA al chat
        setMensajes(prev => [...prev, { rol: 'ia', texto: respuestaIA }]);
        setCargando(false);
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            
            {/* Botón flotante para abrir */}
            {!abierto && (
                <button 
                    onClick={() => setAbierto(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
                >
                    <Bot size={28} />
                </button>
            )}

            {/* Ventana de Chat */}
            {abierto && (
                <div className="bg-card text-card-foreground w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border animate-in slide-in-from-bottom-5 transition-colors duration-300">
                    
                    {/* Cabecera */}
                    <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold">
                            <Bot size={20} />
                            Analista IA
                        </div>
                        <button onClick={() => setAbierto(false)} className="hover:text-primary-foreground/80 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Historial de mensajes (Usamos bg-muted para dar contraste suave) */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/30">
                        {mensajes.map((msg, index) => (
                            <div key={index} className={`flex ${msg.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                                    msg.rol === 'usuario' 
                                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                    : 'bg-background text-foreground border border-border rounded-tl-none' // 👈 Usamos bg-background en lugar de bg-white
                                }`}>
                                    {msg.texto}
                                </div>
                            </div>
                        ))}
                        {cargando && (
                            <div className="flex justify-start">
                                {/* 👇 Usamos bg-background y text-muted-foreground 👇 */}
                                <div className="bg-background text-muted-foreground border border-border p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-sm">
                                    <Loader2 size={16} className="animate-spin"/> Analizando datos...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-card border-t border-border flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-background text-foreground border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            placeholder="Pregunta sobre las encuestas..."
                            value={pregunta}
                            onChange={(e) => setPregunta(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && enviarPregunta()}
                        />
                        <button 
                            onClick={enviarPregunta}
                            disabled={cargando || !pregunta.trim()}
                            className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};