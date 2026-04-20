import { useEffect, useState } from "react";
import type { Turno } from "../../interfaces/Turnos";
import { createTurnoRepository } from "../../database/repositories";
import { useAuthStore } from "../../store/authStore";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus, Power, PowerOff, Trash2, Building2 } from "lucide-react";

export const TurnosPage = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [hospitalSeleccionado, setHospitalSeleccionado] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const turnoRepo = createTurnoRepository();

    useEffect(() => {
        if (!isAdmin && misHospitales.length > 0 && hospitalSeleccionado === 0) {
            setHospitalSeleccionado(misHospitales[0]);
        }
    }, [misHospitales, isAdmin]);

    const cargarTurnos = async () => {
        setLoading(true);
        const { data, error } = await turnoRepo.getTurnos(misHospitales, isAdmin);
        if (error) setErrorMsg("Error al cargar los turnos.");
        if (data) setTurnos(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin || misHospitales.length > 0) cargarTurnos();
    }, [misHospitales.length, isAdmin]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoNombre.trim() || hospitalSeleccionado === 0) return;

        setLoading(true);
        const { error } = await turnoRepo.createTurno(nuevoNombre.trim(), hospitalSeleccionado);

        if (error) {
            setErrorMsg("Error al crear el turno.");
        } else {
            setNuevoNombre("");
            await cargarTurnos();
        }
        setLoading(false);
    };

    const handleToggleActivo = async (id: number, estadoActual: boolean) => {
        await turnoRepo.toggleActivo(id, !estadoActual);
        await cargarTurnos(); 
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Seguro que quieres eliminar este turno definitivamente?")) return;
        await turnoRepo.deleteTurno(id);
        await cargarTurnos();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    {isAdmin ? "Visión Global de Turnos" : "Gestión de Turnos"}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {isAdmin 
                        ? "Auditoría de todos los turnos configurados por los gestores en la red SES." 
                        : "Administra los turnos de comida que aparecerán en las encuestas de tus hospitales."}
                </p>
            </div>

            {errorMsg && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                    {errorMsg}
                </div>
            )}

            {/* 👇 EL FORMULARIO SOLO SE MUESTRA SI NO ES ADMIN */}
            {!isAdmin && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-card-foreground">Añadir Nuevo Turno</h2>
                    <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
                        
                        {misHospitales.length > 1 && (
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="hospital" className="flex items-center gap-2 text-foreground"><Building2 size={16}/> Hospital</Label>
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
            )}

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted text-muted-foreground text-sm">
                        <tr>
                            {/* Columna de Hospital solo para el Admin */}
                            {isAdmin && <th className="p-4 font-semibold border-b border-border">Centro Hospitalario</th>}
                            <th className="p-4 font-semibold border-b border-border">Nombre del Turno</th>
                            <th className="p-4 font-semibold border-b border-border text-center">Estado</th>
                            {/* Columna de acciones oculta para el Admin */}
                            {!isAdmin && <th className="p-4 font-semibold border-b border-border text-right">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {turnos.map((turno) => (
                            <tr key={turno.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                
                                {isAdmin && (
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-muted-foreground" />
                                            <span className="font-medium text-foreground">{turno.hospitales?.nombre || `ID: ${turno.hospital_id}`}</span>
                                        </div>
                                    </td>
                                )}

                                <td className="p-4 font-medium text-foreground">{turno.nombre}</td>
                                
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                        turno.activo 
                                        ? 'bg-primary/10 text-primary border-primary/20' 
                                        : 'bg-muted text-muted-foreground border-border'
                                    }`}>
                                        {turno.activo ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                                
                                {!isAdmin && (
                                    <td className="p-4 flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleToggleActivo(turno.id, turno.activo)}
                                            className={turno.activo ? 'text-muted-foreground border-border hover:bg-accent' : 'text-primary border-primary/20 hover:bg-primary/10'}>
                                            {turno.activo ? <PowerOff size={16} /> : <Power size={16} />}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(turno.id)} className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {turnos.length === 0 && !loading && (
                            <tr>
                                <td colSpan={isAdmin ? 3 : 3} className="p-8 text-center text-muted-foreground">
                                    No hay turnos registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};