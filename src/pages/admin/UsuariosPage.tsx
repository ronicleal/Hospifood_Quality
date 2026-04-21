import { useEffect, useState } from "react";
import { createGestorRepository, createHospitalRepository } from "../../database/repositories";
import type { Hospital } from "../../interfaces/Hospital";
import type { GestorData } from "../../database/repositories/GestorRepository";
import { Button } from "../../components/ui/button";
import { Users, Trash2, Building2, UserCog, Save, X } from "lucide-react";
import { Label } from "../../components/ui/label";

export const UsuariosPage = () => {
    // Listas de datos
    const [gestores, setGestores] = useState<GestorData[]>([]);
    const [hospitalesDisponibles, setHospitalesDisponibles] = useState<Hospital[]>([]);
    
    // Estado para saber qué gestor estamos editando
    const [gestorEditando, setGestorEditando] = useState<GestorData | null>(null);
    const [hospitalesSeleccionados, setHospitalesSeleccionados] = useState<number[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const gestorRepo = createGestorRepository();
    const hospitalRepo = createHospitalRepository();

    const cargarDatos = async () => {
        setLoading(true);
        const [resGestores, resHospitales] = await Promise.all([
            gestorRepo.getGestores(),
            hospitalRepo.getHospitales()
        ]);

        if (resGestores.error) setErrorMsg("Error al cargar los gestores.");
        else setGestores(resGestores.data || []);

        if (resHospitales.data) {
            // Solo mostramos hospitales activos
            setHospitalesDisponibles(resHospitales.data.filter(h => h.activo));
        }
        setLoading(false);
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Abre el panel de edición y pre-selecciona los hospitales que ya tenga
    const iniciarEdicion = (gestor: GestorData) => {
        setGestorEditando(gestor);
        const susHospitalesIds = gestor.hospitales?.map(h => h.hospital_id) || [];
        setHospitalesSeleccionados(susHospitalesIds);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Subimos arriba suavemente
    };

    const cancelarEdicion = () => {
        setGestorEditando(null);
        setHospitalesSeleccionados([]);
    };

    const toggleHospitalSelection = (id: number) => {
        setHospitalesSeleccionados(prev => 
            prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
        );
    };

    const handleSaveAsignacion = async () => {
        if (!gestorEditando) return;
        
        setSaving(true);
        setErrorMsg("");

        const { error } = await gestorRepo.assignHospitales(gestorEditando.id, hospitalesSeleccionados);

        if (error) {
            setErrorMsg("Error al guardar la asignación. Inténtalo de nuevo.");
        } else {
            cancelarEdicion();
            await cargarDatos();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Estás seguro de revocar permanentemente el acceso a este gestor? Deberá registrarse de nuevo.")) return;
        await gestorRepo.deleteGestor(id);
        if (gestorEditando?.id === id) cancelarEdicion();
        await cargarDatos();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Responsables</h1>
                <p className="text-muted-foreground mt-1">
                    Controla los permisos de los gestores y asígnalos a sus centros correspondientes.
                </p>
            </div>

            {errorMsg && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md font-medium text-sm">
                    {errorMsg}
                </div>
            )}

            {/* PANEL DE ASIGNACIÓN (Solo visible si hay un gestor seleccionado) */}
            {gestorEditando && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                                <UserCog size={20} /> Gestionando Accesos
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Marcando hospitales para: <strong className="text-foreground">{gestorEditando.nombre_completo}</strong>
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={cancelarEdicion} className="text-muted-foreground hover:bg-primary/10">
                            <X size={20} />
                        </Button>
                    </div>
                    
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <Building2 size={16} className="text-primary"/> Hospitales Disponibles
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 bg-background rounded-lg border border-border">
                            {hospitalesDisponibles.map(h => (
                                <label key={h.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary"
                                        checked={hospitalesSeleccionados.includes(h.id)}
                                        onChange={() => toggleHospitalSelection(h.id)}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">{h.nombre}</span>
                                        <span className="text-xs text-muted-foreground">{h.localidad || h.provincia}</span>
                                    </div>
                                </label>
                            ))}
                            {hospitalesDisponibles.length === 0 && (
                                <p className="text-sm text-muted-foreground p-2">No hay hospitales activos registrados.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={cancelarEdicion} disabled={saving}>Cancelar</Button>
                        <Button onClick={handleSaveAsignacion} disabled={saving} className="gap-2 bg-primary">
                            <Save size={18} /> {saving ? "Guardando..." : "Guardar Asignación"}
                        </Button>
                    </div>
                </div>
            )}

            {/* TABLA DE GESTORES REGISTRADOS */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                    <Users size={18} className="text-muted-foreground"/>
                    <h3 className="font-semibold text-foreground">Directorio de Gestores Registrados</h3>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted text-muted-foreground text-sm">
                        <tr>
                            <th className="p-4 font-semibold border-b border-border">Responsable</th>
                            <th className="p-4 font-semibold border-b border-border">Hospitales Asignados</th>
                            <th className="p-4 font-semibold border-b border-border text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {gestores.map((gestor) => {
                            const isSelected = gestorEditando?.id === gestor.id;
                            const hasHospitals = gestor.hospitales && gestor.hospitales.length > 0;
                            
                            return (
                                <tr key={gestor.id} className={`border-b border-border last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                                    <td className="p-4">
                                        <p className="font-bold text-foreground text-base">{gestor.nombre_completo}</p>
                                        <p className="text-muted-foreground font-mono text-xs mt-0.5">ID: {gestor.id.split('-')[0]}...</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {hasHospitals ? (
                                                gestor.hospitales.map((hRel, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                                        {hRel.hospitales?.nombre || 'Centro Desconocido'}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20 animate-pulse">
                                                    Sin asignación
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => iniciarEdicion(gestor)} 
                                            className={`gap-1 ${isSelected ? 'border-primary text-primary bg-primary/10' : 'text-muted-foreground'}`}
                                        >
                                            <UserCog size={16} /> <span className="hidden sm:inline">Gestionar Accesos</span>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleDelete(gestor.id)} 
                                            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                            title="Eliminar cuenta de este gestor por completo"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                        {gestores.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                    Aún no hay ningún gestor registrado en la plataforma.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};