import { Building2, Download, FilterX, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { Hospital } from "../../interfaces/Hospital";

interface Props {
    isAdmin: boolean;
    misHospitales: number[];
    hospitalesDisponibles: Hospital[];
    filtroHospitalId: number;
    setFiltroHospitalId: (id: number) => void;
    fechaInicio: string;
    setFechaInicio: (val: string) => void;
    fechaFin: string;
    setFechaFin: (val: string) => void;
    turnoFiltro: string;
    setTurnoFiltro: (val: string) => void;
    searchText: string;
    setSearchText: (val: string) => void;
    onLimpiarFiltros: () => void;
    onExportarPDF: () => void;
    exportDisabled: boolean;
}

export const HistorialControles = (props: Props) => {
    return (
        <div className="space-y-6">
            {/* Cabecera y Selector */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Historial de Encuestas</h1>
                    <p className="text-muted-foreground mt-1">Filtra y analiza los datos recopilados</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-end gap-4 w-full md:w-auto">
                    {(props.isAdmin || props.misHospitales.length > 1) && (
                        <div className="w-full sm:w-64 space-y-2">
                            <label className="text-sm font-bold flex items-center gap-2 text-primary">
                                <Building2 size={16} /> Filtrar por Centro:
                            </label>
                            <select 
                                value={props.filtroHospitalId}
                                onChange={(e) => props.setFiltroHospitalId(Number(e.target.value))}
                                className="w-full h-10 px-3 rounded-lg border border-input bg-card text-foreground font-medium shadow-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
                            >
                                <option value={0}>
                                    {props.isAdmin ? "TODOS LOS CENTROS (Global)" : "MIS CENTROS ASIGNADOS"}
                                </option>
                                {props.hospitalesDisponibles.map(h => (
                                    <option key={h.id} value={h.id}>{h.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <Button onClick={props.onExportarPDF} disabled={props.exportDisabled} className="gap-2 bg-[#2563EB] hover:bg-blue-700 text-white h-10 w-full sm:w-auto">
                        <Download size={18} /> Exportar PDF
                    </Button>
                </div>
            </div>

            {/* Tarjeta de Filtros */}
            <Card className="border-border shadow-sm">
                <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>Fecha Inicio</Label>
                        <Input type="date" value={props.fechaInicio} onChange={(e) => props.setFechaInicio(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Fecha Fin</Label>
                        <Input type="date" value={props.fechaFin} onChange={(e) => props.setFechaFin(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Turno</Label>
                        <select
                            value={props.turnoFiltro}
                            onChange={(e) => props.setTurnoFiltro(e.target.value)}
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="Todos">Todos los turnos</option>
                            <option value="Desayuno">Desayuno</option>
                            <option value="Comida">Comida</option>
                            <option value="Cena">Cena</option>
                        </select>
                    </div>

                    <div className="space-y-2 lg:col-span-1">
                        <Label>Buscar (Sugerencias)</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input
                                placeholder="Ej. Frío..."
                                value={props.searchText}
                                onChange={(e) => props.setSearchText(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={props.onLimpiarFiltros} className="w-full gap-2 text-muted-foreground hover:text-foreground">
                            <FilterX size={16} /> Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};