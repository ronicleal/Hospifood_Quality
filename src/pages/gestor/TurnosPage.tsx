import { useEffect, useState } from "react";
import type { Turno } from "../../interfaces/Turnos";
import { createTurnoRepository } from "../../database/repositories";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus, Power, PowerOff, Trash2 } from "lucide-react";

export const TurnosPage = () => {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const turnoRepo = createTurnoRepository();

    const cargarTurnos = async () => {
        setLoading(true);
        const { data, error } = await turnoRepo.getTurnos();
        if (error) setErrorMsg("Error al cargar los turnos.");
        if (data) setTurnos(data);
        setLoading(false);
    };

    useEffect(() => {
        cargarTurnos();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoNombre.trim()) return;

        setLoading(true);
        const { error } = await turnoRepo.createTurno(nuevoNombre.trim());

        if (error) {
            setErrorMsg("Error al crear el turno. Puede que ya exista.");
        } else {
            setNuevoNombre("");
            await cargarTurnos();
        }
        setLoading(false);
    };

    const handleToggleActivo = async (id: number, estadoActual: boolean) => {
        await turnoRepo.toggleActivo(id, !estadoActual);
        await cargarTurnos(); // Recargamos para ver el cambio
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Seguro que quieres eliminar este turno definitivamente?")) return;
        await turnoRepo.deleteTurno(id);
        await cargarTurnos();
    };

    return (
       <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Turnos</h1>
                <p className="text-muted-foreground mt-1">
                    Administra los turnos de comida (Desayuno, Comida, Cena) que aparecerán en las encuestas.
                </p>
            </div>

            {errorMsg && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                    {errorMsg}
                </div>
            )}

            {/* FORMULARIO DE CREACIÓN */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-card-foreground">Añadir Nuevo Turno</h2>
                <form onSubmit={handleCreate} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="nombre">Nombre del Turno</Label>
                        <Input 
                            id="nombre" 
                            placeholder="Ej: Merienda..." 
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" disabled={loading || !nuevoNombre} className="gap-2">
                        <Plus size={18} /> Añadir Turno
                    </Button>
                </form>
            </div>

            {/* TABLA DE TURNOS */}
           <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted text-muted-foreground text-sm">
                        <tr>
                            <th className="p-4 font-semibold border-b border-border">Nombre del Turno</th>
                            <th className="p-4 font-semibold border-b border-border text-center">Estado</th>
                            <th className="p-4 font-semibold border-b border-border text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {turnos.map((turno) => (
                            <tr key={turno.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                <td className="p-4 font-medium text-foreground">{turno.nombre}</td>
                                
                                {/* PÍLDORAS DE ESTADO CON VARIABLES DE SHADCN */}
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                        turno.activo 
                                        ? 'bg-primary/10 text-primary border-primary/20' 
                                        : 'bg-muted text-muted-foreground border-border'
                                    }`}>
                                        {turno.activo ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                                
                                {/* BOTONES CON VARIABLES DE SHADCN */}
                                <td className="p-4 flex justify-end gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleToggleActivo(turno.id, turno.activo)}
                                        className={
                                            turno.activo 
                                            ? 'text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground' 
                                            : 'text-primary border-primary/20 hover:bg-primary/10'
                                        }
                                    >
                                        {turno.activo ? <PowerOff size={16} /> : <Power size={16} />}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleDelete(turno.id)}
                                        className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {turnos.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                    No hay turnos registrados en la base de datos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};