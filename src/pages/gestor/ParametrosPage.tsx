import { useEffect, useState } from "react";
import type { Parametro } from "../../interfaces/Parametro";
import { createParametroRepository } from "../../database/repositories";
import { useAuthStore } from "../../store/authStore";

// Componentes
import { ParametrosForm } from "../../components/parametros/ParametrosForm";
import { ParametrosTabla } from "../../components/parametros/ParametrosTabla";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export const ParametrosPage = () => {
    const { profile, isAdmin } = useAuthStore();
    const misHospitales = profile?.hospitales || [];

    // Estados de datos
    const [parametros, setParametros] = useState<Parametro[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // Estados del formulario
    const [nuevoTitulo, setNuevoTitulo] = useState("");
    const [nuevaDescripcion, setNuevaDescripcion] = useState("");
    const [hospitalSeleccionado, setHospitalSeleccionado] = useState<number>(0);

    // 👇 Estado para controlar la edición
    const [paramEnEdicion, setParamEnEdicion] = useState<Parametro | null>(null);

    // Estado para el modal de borrado
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({ 
        isOpen: false, 
        id: null 
    });

    const parametroRepo = createParametroRepository();

    // Carga inicial y selección de hospital por defecto
    useEffect(() => {
        if (!isAdmin && misHospitales.length > 0 && hospitalSeleccionado === 0) {
            setHospitalSeleccionado(misHospitales[0]);
        }
    }, [misHospitales, isAdmin, hospitalSeleccionado]);

    const cargarParametros = async () => {
        setLoading(true);
        const { data, error } = await parametroRepo.getParametros(misHospitales, isAdmin);
        if (error) setErrorMsg("Error al cargar los parámetros.");
        if (data) setParametros(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin || misHospitales.length > 0) cargarParametros();
    }, [misHospitales.length, isAdmin]);

    // 👇 Funciones para gestionar el modo EDICIÓN
    const iniciarEdicion = (param: Parametro) => {
        setParamEnEdicion(param);
        setNuevoTitulo(param.titulo);
        setNuevaDescripcion(param.descripcion);
        setHospitalSeleccionado(param.hospital_id);
        // Scroll suave hacia arriba para que el usuario vea el formulario relleno
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicion = () => {
        setParamEnEdicion(null);
        setNuevoTitulo("");
        setNuevaDescripcion("");
        if (!isAdmin && misHospitales.length > 0) {
            setHospitalSeleccionado(misHospitales[0]);
        }
    };

    // 👇 Manejador único para Guardar (Crear o Actualizar)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoTitulo.trim() || !nuevaDescripcion.trim() || hospitalSeleccionado === 0) return;
        
        setLoading(true);
        setErrorMsg("");

        try {
            if (paramEnEdicion) {
                // Lógica de ACTUALIZACIÓN
                const { error } = await parametroRepo.updateParametro(
                    paramEnEdicion.id, 
                    nuevoTitulo.trim(), 
                    nuevaDescripcion.trim()
                );
                if (error) throw error;
                cancelarEdicion();
            } else {
                // Lógica de CREACIÓN
                const { error } = await parametroRepo.createParametro(
                    nuevoTitulo.trim(), 
                    nuevaDescripcion.trim(), 
                    hospitalSeleccionado
                );
                if (error) throw error;
                setNuevoTitulo("");
                setNuevaDescripcion("");
            }
            await cargarParametros();
        } catch (err) {
            setErrorMsg("Hubo un problema al procesar la solicitud.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActivo = async (id: number, estadoActual: boolean) => {
        const { error } = await parametroRepo.toggleActivo(id, !estadoActual);
        if (error) {
            setErrorMsg("No se pudo cambiar el estado.");
        } else {
            await cargarParametros();
        }
    };

    const solicitarBorrado = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmarBorrado = async () => {
        if (!deleteModal.id) return;
        setLoading(true);
        const { error } = await parametroRepo.deleteParametro(deleteModal.id);
        if (error) {
            setErrorMsg("Error al eliminar el parámetro.");
        } else {
            await cargarParametros();
        }
        setDeleteModal({ isOpen: false, id: null });
        setLoading(false);
    };

    return (
        <div className="space-y-6 relative">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    {isAdmin ? "Visión Global de Parámetros" : "Parámetros a Evaluar"}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {isAdmin 
                        ? "Auditoría global de todas las preguntas configuradas." 
                        : "Gestiona las preguntas que aparecerán en las encuestas de satisfacción."}
                </p>
            </div>

            {errorMsg && (
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
                    {errorMsg}
                </div>
            )}

            {/* Solo mostramos el formulario si no es Admin o si quieres permitir al admin crear */}
            {!isAdmin && (
                <ParametrosForm 
                    nuevoTitulo={nuevoTitulo} 
                    setNuevoTitulo={setNuevoTitulo} 
                    nuevaDescripcion={nuevaDescripcion} 
                    setNuevaDescripcion={setNuevaDescripcion}
                    hospitalSeleccionado={hospitalSeleccionado} 
                    setHospitalSeleccionado={setHospitalSeleccionado}
                    misHospitales={misHospitales} 
                    loading={loading} 
                    onSubmit={handleSubmit}
                    isEditing={!!paramEnEdicion}
                    onCancelEdit={cancelarEdicion}
                />
            )}

            <ParametrosTabla 
                parametros={parametros} 
                isAdmin={isAdmin} 
                loading={loading} 
                onToggleActivo={handleToggleActivo} 
                onDelete={solicitarBorrado}
                onEdit={iniciarEdicion}
            />

            <ConfirmModal 
                isOpen={deleteModal.isOpen}
                title="¿Eliminar parámetro?"
                message="Esta acción no se puede deshacer y eliminará esta pregunta de las futuras encuestas del hospital."
                onCancel={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmarBorrado}
                isDeleting={loading}
            />
        </div>
    );
};