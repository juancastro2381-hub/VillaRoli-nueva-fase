import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, DollarSign, Activity, TrendingUp } from "lucide-react";

interface KPICardsProps {
    totalBookings: number;
    totalRevenue: number;
    activeBookings: number;
    occupancyRate: number;
}

export const KPICards = ({ totalBookings, totalRevenue, activeBookings, occupancyRate }: KPICardsProps) => {

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    const kpiData = [
        {
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
                        className={`animate-slide-up ${kpi.delay} overflow-hidden group`}
                        hover={true}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                            <CardTitle className="text-sm font-semibold text-gray-600">{kpi.title}</CardTitle>
                            <div className={`${kpi.iconBg} p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                                <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                            <p className="text-xs text-gray-500 font-medium">{kpi.subtitle}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

