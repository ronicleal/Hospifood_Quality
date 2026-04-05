import { AlertCircle, TrendingUp, Users, Utensils } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// DATOS SIMULADOS (Mock Data) - Luego los traeremos de Supabase
const dataSatisfaccion = [
  { name: 'Excelente', value: 45, color: '#22c55e' },
  { name: 'Bueno', value: 30, color: '#84cc16' },
  { name: 'Regular', value: 15, color: '#eab308' },
  { name: 'Malo', value: 7, color: '#f97316' },
  { name: 'Pésimo', value: 3, color: '#ef4444' },
];

const dataEvolucion = [
  { dia: 'Lun', nota: 4.2 }, { dia: 'Mar', nota: 4.0 }, { dia: 'Mié', nota: 4.5 },
  { dia: 'Jue', nota: 3.8 }, { dia: 'Vie', nota: 4.1 }, { dia: 'Sáb', nota: 4.6 }, { dia: 'Dom', nota: 4.4 },
];

// COMPONENTE: Tarjeta pequeña de resumen (KPI)
const KpiCard = ({ titulo, valor, subtitulo, Icono, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
    <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
      <Icono size={28} className={color.replace('bg-', 'text-').replace('-100', '-600')} />
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-semibold mb-1">{titulo}</h3>
      <p className="text-3xl font-extrabold text-slate-800">{valor}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitulo}</p>
    </div>
  </div>
);

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 mt-1">Resumen general de satisfacción de pacientes</p>
        </div>
      </div>

      {/* FILA 1: Tarjetas de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard titulo="Encuestas Totales" valor="1,284" subtitulo="+12% este mes" Icono={Users} color="bg-blue-100" />
        <KpiCard titulo="Nota Media" valor="4.2 / 5" subtitulo="Estable" Icono={TrendingUp} color="bg-green-100" />
        <KpiCard titulo="Mejor Turno" valor="Comida" subtitulo="Nota: 4.5" Icono={Utensils} color="bg-purple-100" />
        <KpiCard titulo="Quejas" valor="18" subtitulo="-5% este mes" Icono={AlertCircle} color="bg-orange-100" />
      </div>

      {/* FILA 2: Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Gráfico de Anillo (Satisfacción General) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Satisfacción General</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataSatisfaccion} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {dataSatisfaccion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {dataSatisfaccion.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Barras (Evolución Semanal) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Evolución Semanal (Nota Media)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataEvolucion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
  );
};