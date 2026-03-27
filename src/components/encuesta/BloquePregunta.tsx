import type { Parametro } from "../../interfaces/Parametro";

interface Props {
    pregunta: Parametro;
    index: number;
    total: number;
    valorSeleccionado: number | null;
    onSelect: (valor: number) => void;
}

export const BloquePregunta = ({ pregunta, index, total, valorSeleccionado, onSelect }: Props) => {

    // Defino los emojis y textos para los botones verticales
    const opciones = [
        { valor: 1, icono: "😡", texto: "1- Pésimo", color: "hover:border-red-500 hover:bg-red-50 border-red-200" },
        { valor: 2, icono: "🙁", texto: "2- Malo", color: "hover:border-orange-500 hover:bg-orange-50 border-orange-200" },
        { valor: 3, icono: "😐", texto: "3- Regular", color: "hover:border-yellow-500 hover:bg-yellow-50 border-yellow-200" },
        { valor: 4, icono: "🙂", texto: "4- Bueno", color: "hover:border-lime-500 hover:bg-lime-50 border-lime-200" },
        { valor: 5, icono: "😍", texto: "5- Excelente", color: "hover:border-green-500 hover:bg-green-50 border-green-200" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Indicador de Progreso (Dots) */}
            <div className="flex justify-center gap-1.5 mb-6">
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-2.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-sky-600' : 'w-2.5 bg-slate-200'}`}
                    />
                ))}
            </div>

            {/* Título de la pregunta */}
            <div className="text-center px-2">
                <span className="block text-sm font-bold text-sky-700 uppercase tracking-widest mb-1">
                    Pregunta {index + 1} de {total}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                    {pregunta.descripcion}
                </h2>
            </div>

            {/* Botones Verticales Grandes */}
            <div className="space-y-3 pt-4">
                {opciones.map((opcion) => {
                    const isSelected = valorSeleccionado === opcion.valor;

                    return (
                        <button
                            key={opcion.valor}
                            onClick={() => onSelect(opcion.valor)}
                            className={`
                                w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 shadow-sm
                                ${isSelected
                                    ? 'border-sky-600 bg-sky-50 ring-4 ring-sky-100'
                                    : `bg-white border-slate-200 ${opcion.color}`}
                                `}
                        >
                            <span className="text-4xl">{opcion.icono}</span>
                            <span className={`text-lg font-semibold ${isSelected ? 'text-sky-950' : 'text-slate-800'}`}>
                                {opcion.texto}
                            </span>
                            {/* Si está seleccionado, mostramos un tick a la derecha */}
                            {isSelected && (
                                <span className="ml-auto text-sky-600 text-2xl">✓</span>
                            )}
                        </button>

                    );
                })}

            </div>

        </div>
    )


}


