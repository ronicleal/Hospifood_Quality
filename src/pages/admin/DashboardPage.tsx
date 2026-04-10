import { useEffect, useState } from "react";
import type { DashboardData } from "../../interfaces/Estadisticas";
import { createStatsRepository } from "../../database/repositories";
import { StatsCards } from "../../components/admin/StatsCards";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const statsRepo = createStatsRepository();

  useEffect(() => {
    async function loadStats() {
      // Usamos hospital_id 1 por defecto de momento
      const { data: stast } = await statsRepo.getDashboardStats(1);
      if (stast) setData(stast);
      setLoading(false)
    }
    loadStats();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Cargando estadísticas reales...</div>;
  if (!data) return <div>Error al cargar datos.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Panel de Control</h1>
        <p className="text-slate-500">Resumen general de satisfacción de pacientes</p>
      </div>

      {/* COMPONENTE HIJO 1 */}
      <StatsCards resumen={data.resumen} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

        {/* GRÁFICO DE SATISFACCIÓN */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Satisfacción del Paciente</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.satisfaccion}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.satisfaccion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {data.satisfaccion.map(s => (
              <div key={s.name} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        {/* 2. GRÁFICO DE BARRAS: Evolución Semanal (Ocupa 2 columnas) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Evolución Semanal (Nota Media)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.evolucion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="nota" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>



  )

};