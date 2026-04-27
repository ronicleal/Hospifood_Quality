import { Building2 } from "lucide-react";
import type { Hospital } from "../../interfaces/Hospital";

interface Props {
    isAdmin: boolean;
    misHospitalesLength: number;
    filtroHospitalId: number;
    setFiltroHospitalId: (id: number) => void;
    hospitalesDisponibles: Hospital[];
}

export const DashboardHeader = ({ isAdmin, misHospitalesLength, filtroHospitalId, setFiltroHospitalId, hospitalesDisponibles }: Props) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground">
                    {isAdmin ? "Visión Global" : "Mi Panel de Control"}
                </h1>
                <p className="text-muted-foreground mt-1">Resumen general de satisfacción de pacientes</p>
            </div>
            
            {(isAdmin || misHospitalesLength > 1) && (
                <div className="w-full md:w-80 space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2 text-primary">
                        <Building2 size={16} /> Filtrar por Centro:
                    </label>
                    <select 
                        value={filtroHospitalId}
                        onChange={(e) => setFiltroHospitalId(Number(e.target.value))}
                        className="w-full h-11 px-4 rounded-lg border border-input bg-card text-foreground font-medium shadow-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                    >
                        <option value={0}>
                            {isAdmin ? "TODOS LOS CENTROS (Global)" : "MIS CENTROS ASIGNADOS"}
                        </option>
                        {hospitalesDisponibles.map(h => (
                            <option key={h.id} value={h.id}>{h.nombre} ({h.localidad || h.provincia})</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};