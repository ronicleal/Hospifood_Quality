import { useEffect, useState } from "react";
import { createGestorRepository, createHospitalRepository } from "../../database/repositories";
import type { Hospital } from "../../interfaces/Hospital";
import type { GestorData } from "../../database/repositories/GestorRepository";

import { UsuariosAsignacionForm } from "../../components/usuarios/UsuariosAsignacionForm";
import { UsuariosTabla } from "../../components/usuarios/UsuariosTabla";

export const UsuariosPage = () => {
    const [gestores, setGestores] = useState<GestorData[]>([]);
    const [hospitalesDisponibles, setHospitalesDisponibles] = useState<Hospital[]>([]);
    const [gestorEditando, setGestorEditando] = useState<GestorData | null>(null);
    const [hospitalesSeleccionados, setHospitalesSeleccionados] = useState<number[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const gestorRepo = createGestorRepository();
    const hospitalRepo = createHospitalRepository();

    const cargarDatos = async () => {
        setLoading(true);
        const [resGestores, resHospitales] = await Promise.all([gestorRepo.getGestores(), hospitalRepo.getHospitales()]);
        if (resGestores.error) setErrorMsg("Error al cargar los gestores.");
        else setGestores(resGestores.data || []);
        if (resHospitales.data) setHospitalesDisponibles(resHospitales.data.filter(h => h.activo));
        setLoading(false);
    };

    useEffect(() => { cargarDatos(); }, []);

    const iniciarEdicion = (gestor: GestorData) => {
        setGestorEditando(gestor);
        setHospitalesSeleccionados(gestor.hospitales?.map(h => h.hospital_id) || []);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const cancelarEdicion = () => { setGestorEditando(null); setHospitalesSeleccionados([]); };

    const toggleHospitalSelection = (id: number) => {
        setHospitalesSeleccionados(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
    };

    const handleSaveAsignacion = async () => {
        if (!gestorEditando) return;
        setSaving(true); setErrorMsg("");
        const { error } = await gestorRepo.assignHospitales(gestorEditando.id, hospitalesSeleccionados);
        if (error) setErrorMsg("Error al guardar la asignación. Inténtalo de nuevo.");
        else { cancelarEdicion(); await cargarDatos(); }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Estás seguro de revocar permanentemente el acceso a este gestor?")) return;
        await gestorRepo.deleteGestor(id);
        if (gestorEditando?.id === id) cancelarEdicion();
        await cargarDatos();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Gestión de Responsables</h1>
                <p className="text-muted-foreground mt-1">Controla los permisos de los gestores y asígnalos a sus centros correspondientes.</p>
            </div>

            {errorMsg && <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md font-medium text-sm">{errorMsg}</div>}

            {gestorEditando && (
                <UsuariosAsignacionForm 
                    gestorEditando={gestorEditando} hospitalesDisponibles={hospitalesDisponibles}
                    hospitalesSeleccionados={hospitalesSeleccionados} onToggleHospital={toggleHospitalSelection}
                    onCancel={cancelarEdicion} onSave={handleSaveAsignacion} saving={saving}
                />
            )}

            <UsuariosTabla gestores={gestores} gestorEditando={gestorEditando} loading={loading} onEdit={iniciarEdicion} onDelete={handleDelete} />
        </div>
    );
};