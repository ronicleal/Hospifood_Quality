import { PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

interface Props {
    chartPieRef: React.RefObject<HTMLDivElement | null>;
    chartBarRef: React.RefObject<HTMLDivElement | null>;
    dataSatisfaccion: { name: string; value: number; color: string }[];
    dataTurnos: { name: string; nota: number }[];
}

export const ReportesGraficosOcultos = ({ chartPieRef, chartBarRef, dataSatisfaccion, dataTurnos }: Props) => {
    return (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px", color: "#000000", fill: "#000000" }}>
            <div ref={chartPieRef} style={{ width: "400px", height: "250px", backgroundColor: "#ffffff", padding: "10px" }}>
                <h4 style={{ textAlign: "center", fontFamily: "sans-serif", color: "#333", fontWeight: "bold", marginBottom: "10px" }}>Satisfacción General</h4>
                <PieChart width={400} height={200}>
                    <Pie data={dataSatisfaccion} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                        {dataSatisfaccion.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                </PieChart>
            </div>
            <div ref={chartBarRef} style={{ width: "400px", height: "250px", backgroundColor: "#ffffff", padding: "10px" }}>
                <h4 style={{ textAlign: "center", fontFamily: "sans-serif", color: "#333", fontWeight: "bold", marginBottom: "10px" }}>Nota Media por Turnos</h4>
                <BarChart width={400} height={200} data={dataTurnos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} domain={[0, 5]} />
                    <Bar dataKey="nota" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
            </div>
        </div>
    );
};