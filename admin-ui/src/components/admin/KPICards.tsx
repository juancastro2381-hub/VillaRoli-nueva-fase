import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, DollarSign, Activity, TrendingUp } from "lucide-react";

interface KPICardsProps {
    totalBookings: number;
    totalRevenue: number;
    activeBookings: number;
    occupancyRate: number;
    onCardClick?: (type: 'bookings' | 'revenue' | 'active' | 'occupancy') => void;
}

export const KPICards = ({ totalBookings, totalRevenue, activeBookings, occupancyRate, onCardClick }: KPICardsProps) => {

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    const kpiData = [
        {
            id: 'bookings' as const,
            title: "Reservas Totales",
            value: totalBookings,
            subtitle: "Total histórico",
            icon: Calendar,
            gradient: "from-primary-400 to-primary-600",
            iconBg: "bg-primary-100",
            iconColor: "text-primary-600",
            delay: "delay-100",
        },
        {
            id: 'revenue' as const,
            title: "Ingresos",
            value: formatCurrency(totalRevenue),
            subtitle: "Mes actual",
            icon: DollarSign,
            gradient: "from-secondary-400 to-secondary-600",
            iconBg: "bg-secondary-100",
            iconColor: "text-secondary-600",
            delay: "delay-200",
        },
        {
            id: 'active' as const,
            title: "Activas",
            value: activeBookings,
            subtitle: "En curso",
            icon: Activity,
            gradient: "from-success-400 to-success-600",
            iconBg: "bg-success-100",
            iconColor: "text-success-600",
            delay: "delay-300",
        },
        {
            id: 'occupancy' as const,
            title: "Ocupación",
            value: `${occupancyRate}%`,
            subtitle: "Promedio mensual",
            icon: TrendingUp,
            gradient: "from-warning-400 to-warning-600",
            iconBg: "bg-warning-100",
            iconColor: "text-warning-600",
            delay: "delay-400",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                    <Card
                        key={index}
                        className={`animate-slide-up ${kpi.delay} overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative z-10`}
                        onClick={() => onCardClick?.(kpi.id)}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-20 pointer-events-none">
                            <CardTitle className="text-sm font-semibold text-gray-600">{kpi.title}</CardTitle>
                            <div className={`${kpi.iconBg} p-2.5 rounded-xl transition-colors duration-300`}>
                                <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-20 pointer-events-none">
                            <div className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                            <p className="text-xs text-gray-500 font-medium">{kpi.subtitle}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

