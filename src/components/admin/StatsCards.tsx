// src/components/admin/StatsCards.tsx
import { Users, TrendingUp, Utensils, MessageSquare } from 'lucide-react';
import type { ResumenKPI } from '../../interfaces/Estadisticas';
import { Card, CardContent } from '../ui/card'; // Importamos el componente Shadcn

interface Props { resumen: ResumenKPI }

export const StatsCards = ({ resumen }: Props) => {
  const cards = [
    { title: "Total Encuestas", value: resumen.totalEncuestas, icon: Users, color: "text-blue-600 bg-blue-50" },
    { title: "Nota Media", value: `${resumen.notaMedia} / 5`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { title: "Mejor Turno", value: resumen.mejorTurno, icon: Utensils, color: "text-purple-600 bg-purple-50" },
    { title: "Sugerencias", value: resumen.totalSugerencias, icon: MessageSquare, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c, i) => (
        <Card key={i} className="shadow-sm border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${c.color}`}>
              <c.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{c.title}</p>
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};