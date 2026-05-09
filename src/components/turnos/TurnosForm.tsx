import { Building2, Plus, Save, X } from "lucide-react";
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
    isEditing?: boolean;
    onCancelEdit?: () => void;
}

export const TurnosForm = ({ nuevoNombre, setNuevoNombre, hospitalSeleccionado, setHospitalSeleccionado, misHospitales, loading, onSubmit, isEditing = false, onCancelEdit }: Props) => {
    return (
        <div className={`border rounded-xl p-6 shadow-sm transition-colors ${isEditing ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
            <div className="flex justify-between items-center mb-4">
                {/* Cambiamos el título dinámicamente */}
                <h2 className="text-lg font-semibold text-card-foreground">
                    {isEditing ? '✏️ Modificar Turno' : 'Añadir Nuevo Turno'}
                </h2>
                
                {/* Botón para salir del modo edición */}
                {isEditing && onCancelEdit && (
                    <Button variant="ghost" size="sm" onClick={onCancelEdit} className="text-muted-foreground hover:text-destructive">
                        <X size={18} className="mr-1" /> Cancelar
                    </Button>
                )}
            </div>

            <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
                {/* Selector de Hospital (Si está editando, lo deshabilitamos para que no mueva el turno a otro hospital por error) */}
                {misHospitales.length > 1 && (
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="hospital" className="flex items-center gap-2 text-foreground">
                            <Building2 size={16}/> Hospital
                        </Label>
                        <select 
                            id="hospital" 
                            value={hospitalSeleccionado} 
                            onChange={(e) => setHospitalSeleccionado(parseInt(e.target.value))}
                            disabled={isEditing || loading} // 👈 Deshabilitado en edición
                            className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring outline-none disabled:opacity-50"
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
                        id="nombre" 
                        placeholder="Ej: Merienda..." 
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)} 
                        disabled={loading}
                    />
                </div>
                
                {/* Cambiamos el botón dinámicamente */}
                <Button 
                    type="submit" 
                    disabled={loading || !nuevoNombre || hospitalSeleccionado === 0} 
                    className={`gap-2 w-full sm:w-auto ${isEditing ? 'bg-primary/90 hover:bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20' : ''}`}
                >
                    {isEditing ? <Save size={18} /> : <Plus size={18} />} 
                    {isEditing ? 'Guardar Cambios' : 'Añadir Turno'}
                </Button>
            </form>
        </div>
    );
};