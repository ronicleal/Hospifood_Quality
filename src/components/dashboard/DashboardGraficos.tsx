import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
    satisfaccion: { name: string; value: number; color: string }[];
    evolucion: { dia: string; nota: number }[];
}

export const DashboardGraficos = ({ satisfaccion, evolucion }: Props) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Gráfico de Tarta */}
            <div className="bg-card p-8 rounded-3xl shadow-sm border border-border max-w-2xl">
                <h3 className="text-xl font-bold text-card-foreground mb-6">Satisfacción del Paciente</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={satisfaccion} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                                {satisfaccion.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {satisfaccion.map(s => (
                        <div key={s.name} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.name} ({s.value})
                        </div>
                    ))}
                </div>
            </div>

            {/* Gráfico de Barras */}
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border lg:col-span-2">
                <h3 className="text-lg font-bold text-card-foreground mb-6">Evolución Semanal (Nota Media)</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={evolucion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
    );
};