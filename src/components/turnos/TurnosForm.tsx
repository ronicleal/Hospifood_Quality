import { Building2, Plus } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Props {
    nuevoNombre: string;
    setNuevoNombre: (val: string) => void;
    hospitalSeleccionado: number;
    setHospitalSeleccionado: (val: number) => void;
    misHospitales: number[];
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export const TurnosForm = ({ nuevoNombre, setNuevoNombre, hospitalSeleccionado, setHospitalSeleccionado, misHospitales, loading, onSubmit }: Props) => {
    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-card-foreground">Añadir Nuevo Turno</h2>
            <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
                {misHospitales.length > 1 && (
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="hospital" className="flex items-center gap-2 text-foreground">
                            <Building2 size={16}/> Hospital
                        </Label>
                        <select 
                            id="hospital" value={hospitalSeleccionado} onChange={(e) => setHospitalSeleccionado(parseInt(e.target.value))}
                            className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
                        >
                            {misHospitales.map(hId => (
                                <option key={hId} value={hId}>Hospital ID: {hId}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex-[2] space-y-2">
                    <Label htmlFor="nombre">Nombre del Turno</Label>
                    <Input 
                        id="nombre" placeholder="Ej: Merienda..." value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)} disabled={loading}
                    />
                </div>
                
                <Button type="submit" disabled={loading || !nuevoNombre || hospitalSeleccionado === 0} className="w-full sm:w-auto gap-2">
                    <Plus size={18} /> Añadir Turno
                </Button>
            </form>
        </div>
    );
};