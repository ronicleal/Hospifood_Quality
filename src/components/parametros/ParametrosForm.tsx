import { Building2, Plus, Save, X } from "lucide-react";
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
    isEditing?: boolean;
    onCancelEdit?: () => void;
}

export const ParametrosForm = ({ 
    nuevoTitulo, setNuevoTitulo, nuevaDescripcion, setNuevaDescripcion, 
    hospitalSeleccionado, setHospitalSeleccionado, misHospitales, 
    loading, onSubmit, isEditing, onCancelEdit 
}: Props) => {
    return (
        <div className={`border rounded-xl p-6 shadow-sm transition-colors ${isEditing ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-card-foreground">
                    {isEditing ? '✏️ Modificar Parámetro' : 'Añadir Nuevo Parámetro'}
                </h2>
                {isEditing && (
                    <Button variant="ghost" size="sm" onClick={onCancelEdit} className="text-muted-foreground hover:text-destructive">
                        <X size={18} className="mr-1" /> Cancelar
                    </Button>
                )}
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {misHospitales.length > 1 && (
                    <div className="w-full sm:w-1/3 space-y-2">
                        <Label htmlFor="hospitalParam" className="flex items-center gap-2 text-foreground"><Building2 size={16}/> Hospital Destino</Label>
                        <select 
                            id="hospitalParam" value={hospitalSeleccionado} 
                            onChange={(e) => setHospitalSeleccionado(parseInt(e.target.value))}
                            disabled={isEditing || loading} // Bloqueado en edición
                            className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring outline-none disabled:opacity-50"
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
                    <Button 
                        type="submit" 
                        disabled={loading || !nuevoTitulo || !nuevaDescripcion || hospitalSeleccionado === 0} 
                        className={`gap-2 w-full sm:w-auto ${isEditing ? 'bg-primary/90 hover:bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20' : ''}`}
                    >
                        {isEditing ? <Save size={18} /> : <Plus size={18} />} 
                        {isEditing ? 'Guardar Cambios' : 'Añadir Parámetro'}
                    </Button>
                </div>
            </form>
        </div>
    );
};