import { useEffect, useState } from "react";
import type { Turno } from "../../interfaces/Turnos";
import { createTurnoRepository } from "../../database/repositories";
import { useAuthStore } from "../../store/authStore";

// Componentes
import { TurnosForm } from "../../components/turnos/TurnosForm";
import { TurnosTabla } from "../../components/turnos/TurnosTabla";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export const TurnosPage = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [hospitalSeleccionado, setHospitalSeleccionado] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // 👇 NUEVO: Estado para saber qué turno estamos editando
    const [turnoEnEdicion, setTurnoEnEdicion] = useState<Turno | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    const turnoRepo = createTurnoRepository();

    useEffect(() => {
        if (!isAdmin && misHospitales.length > 0 && hospitalSeleccionado === 0) {
            setHospitalSeleccionado(misHospitales[0]);
        }
    }, [misHospitales, isAdmin, hospitalSeleccionado]);

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

    // 👇 NUEVO: Funciones para manejar la edición
    const iniciarEdicion = (turno: Turno) => {
        setTurnoEnEdicion(turno);
        setNuevoNombre(turno.nombre);
        setHospitalSeleccionado(turno.hospital_id);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube el scroll hacia el formulario
    };

    const cancelarEdicion = () => {
        setTurnoEnEdicion(null);
        setNuevoNombre("");
        if (!isAdmin && misHospitales.length > 0) {
            setHospitalSeleccionado(misHospitales[0]);
        }
    };

    // 👇 MODIFICADO: Ahora maneja Create y Update
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoNombre.trim() || hospitalSeleccionado === 0) return;
        
        setLoading(true);
        
        if (turnoEnEdicion) {
            // Lógica de ACTUALIZAR
            // Asegúrate de tener este método updateTurno en tu repositorio
            const { error } = await turnoRepo.updateTurno(turnoEnEdicion.id, nuevoNombre.trim());
            if (error) setErrorMsg("Error al actualizar el turno.");
            else {
                cancelarEdicion();
                await cargarTurnos();
            }
        } else {
            // Lógica de CREAR
            const { error } = await turnoRepo.createTurno(nuevoNombre.trim(), hospitalSeleccionado);
            if (error) setErrorMsg("Error al crear el turno.");
            else { 
                setNuevoNombre(""); 
                await cargarTurnos(); 
            }
        }
        setLoading(false);
    };

    const handleToggleActivo = async (id: number, estadoActual: boolean) => {
        await turnoRepo.toggleActivo(id, !estadoActual);
        await cargarTurnos(); 
    };

    const solicitarBorrado = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmarBorrado = async () => {
        if (!deleteModal.id) return;
        setLoading(true);
        await turnoRepo.deleteTurno(deleteModal.id);
        await cargarTurnos();
        setDeleteModal({ isOpen: false, id: null });
    };

    return (
        <div className="space-y-6 relative">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    {isAdmin ? "Visión Global de Turnos" : "Gestión de Turnos"}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {isAdmin ? "Auditoría de todos los turnos configurados." : "Administra los turnos de comida de tus hospitales."}
                </p>
            </div>

            {errorMsg && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">{errorMsg}</div>}

            {!isAdmin && (
                <TurnosForm 
                    nuevoNombre={nuevoNombre} setNuevoNombre={setNuevoNombre}
                    hospitalSeleccionado={hospitalSeleccionado} setHospitalSeleccionado={setHospitalSeleccionado}
                    misHospitales={misHospitales} loading={loading} 
                    onSubmit={handleSubmit} // 👈 Cambiado
                    isEditing={!!turnoEnEdicion} // 👈 Nueva prop
                    onCancelEdit={cancelarEdicion} // 👈 Nueva prop
                />
            )}

            <TurnosTabla 
                turnos={turnos} isAdmin={isAdmin} loading={loading}
                onToggleActivo={handleToggleActivo} onDelete={solicitarBorrado}
                onEdit={iniciarEdicion} // 👈 Pasamos la función a la tabla
            />

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                title="¿Eliminar turno?"
                message="Esta acción no se puede deshacer. Se borrará permanentemente de la base de datos."
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmarBorrado}
                isDeleting={loading}
            />
        </div>
    );
};