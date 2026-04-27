import { Building2, Plus } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Props {
    nuevoTitulo: string;
    setNuevoTitulo: (val: string) => void;
    nuevaDescripcion: string;
    setNuevaDescripcion: (val: string) => void;
    hospitalSeleccionado: number;
    setHospitalSeleccionado: (val: number) => void;
    misHospitales: number[];
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export const ParametrosForm = ({ nuevoTitulo, setNuevoTitulo, nuevaDescripcion, setNuevaDescripcion, hospitalSeleccionado, setHospitalSeleccionado, misHospitales, loading, onSubmit }: Props) => {
    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-card-foreground">Añadir Nuevo Parámetro</h2>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {misHospitales.length > 1 && (
                    <div className="w-full sm:w-1/3 space-y-2">
                        <Label htmlFor="hospitalParam" className="flex items-center gap-2 text-foreground"><Building2 size={16}/> Hospital Destino</Label>
                        <select 
                            id="hospitalParam" value={hospitalSeleccionado} onChange={(e) => setHospitalSeleccionado(parseInt(e.target.value))}
                            className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
                        >
                            {misHospitales.map(hId => (
                                <option key={hId} value={hId}>Hospital ID: {hId}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="titulo">Título Corto</Label>
                        <Input id="titulo" placeholder="Ej: Temperatura" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} disabled={loading} />
                    </div>
                    <div className="flex-[2] space-y-2">
                        <Label htmlFor="descripcion">Pregunta Completa (Descripción)</Label>
                        <Input id="descripcion" placeholder="Ej: ¿La comida llegó a la temperatura adecuada?" value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} disabled={loading} />
                    </div>
                </div>
                <div className="flex justify-end mt-2">
                    <Button type="submit" disabled={loading || !nuevoTitulo || !nuevaDescripcion || hospitalSeleccionado === 0} className="gap-2 w-full sm:w-auto">
                        <Plus size={18} /> Añadir Parámetro
                    </Button>
                </div>
            </form>
        </div>
    );
};