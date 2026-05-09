import { ChevronRight, Clock, ShieldCheck, Utensils, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import type { Turno } from "../../interfaces/Turnos";

import heroImg from "../../assets/portada.jpg";
import { PLANTAS_HOSPITALARIAS } from "../../utils/constants";

interface Props {
    turnosDisponibles: Turno[];
    plantaSeleccionada: string;
    turnoSeleccionado: string;
    onChangePlanta: (val: string) => void;
    onChangeTurno: (val: string) => void;
    onComenzar: () => void;
}

const getIconoTurno = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes('desayuno')) return '☕';
    if (n.includes('comida') || n.includes('almuerzo')) return '🍲';
    if (n.includes('cena')) return '🥗';
    if (n.includes('merienda')) return '🍎';
    if (n.includes('recena')) return '🥛';
    return '🍽️';
};


export const EncuestaBienvenida = ({ turnosDisponibles, plantaSeleccionada, turnoSeleccionado, onChangePlanta, onChangeTurno, onComenzar }: Props) => {
    return (
        // 👇 Fondo principal usando bg-background y text-foreground
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center z-10">
                <div className="space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold shadow-sm border border-primary/20">
                        <Utensils size={18} /> <span>Hospifood Quality</span>
                    </div>
                    {/* 👇 Título adaptado a text-foreground */}
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight">
                        Tu opinión es nuestro <span className="text-primary">ingrediente principal</span>
                    </h1>
                    {/* 👇 Párrafo adaptado a text-muted-foreground */}
                    <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
                        Ayúdanos a mejorar el servicio de alimentación. Queremos asegurarnos de que tu menú y tu estancia sean lo más agradables posible.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
                        {/* 👇 Etiquetas adaptadas a bg-card, text-muted-foreground y border-border */}
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card px-4 py-2 rounded-lg shadow-sm border border-border transition-colors duration-300">
                            <Clock size={18} className="text-amber-500"/> <span>Solo 2 minutos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card px-4 py-2 rounded-lg shadow-sm border border-border transition-colors duration-300">
                            <ShieldCheck size={18} className="text-emerald-500"/> <span>100% Anónimo</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-10 md:mt-10">
                    <div className="relative group flex items-center justify-center">
                        <div className="absolute -inset-2.5 bg-primary/30 rounded-full blur-2xl scale-100 opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out pointer-events-none" />
                        <div className="absolute -inset-3.75 border-2 border-primary/10 rounded-full group-hover:scale-105 transition-all duration-500 ease-out" />
                        <img 
                            src={heroImg} 
                            alt="Sanidad SES y Salud" 
                            className="relative w-64 h-64 sm:w-72 sm:h-72 object-cover rounded-full aspect-square shadow-2xl border-8 border-white z-20 group-hover:rotate-3 transition-transform duration-500 ease-out cursor-pointer object-center" 
                        />
                        <div className="absolute top-5 right-5 z-30 bg-primary p-3 rounded-full text-white shadow-xl rotate-12 group-hover:rotate-0 transition-transform">
                            <Zap size={20} />
                        </div>
                    </div>

                    {/* 👇 Tarjeta principal adaptada a bg-card/90, text-card-foreground y border-border */}
                    <Card className="w-full max-w-sm shadow-xl border border-border bg-card/90 text-card-foreground backdrop-blur-sm transition-colors duration-300">
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-bold text-foreground">¿En qué planta o unidad estás?</label>
                                {/* 👇 Select adaptado a bg-background, border-input y text-foreground */}
                                <select 
                                    className="w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                                    value={plantaSeleccionada}
                                    onChange={e => onChangePlanta(e.target.value)}
                                >
                                    <option value="" disabled>Seleccionar unidad...</option>
                                    {PLANTAS_HOSPITALARIAS.map((planta) => (
                                        <option key={planta} value={planta}>
                                            {planta}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-sm font-bold text-foreground">¿Qué comida vas a valorar?</label>
                                {/* 👇 Select adaptado a bg-background, border-input y text-foreground */}
                                <select 
                                    className="w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                                    value={turnoSeleccionado}
                                    onChange={e => onChangeTurno(e.target.value)}
                                >
                                    <option value="" disabled>Seleccionar turno...</option>
                                    {turnosDisponibles.map((t) => (
                                        <option key={t.id} value={t.nombre}>
                                            {getIconoTurno(t.nombre)} {t.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={onComenzar} className="w-full h-12 text-md font-bold gap-2 mt-2 shadow-md">
                                Comenzar Encuesta <ChevronRight size={20} />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};