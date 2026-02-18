import { useFinanceSummary } from "../hooks/useFinanceSummary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Loader2, DollarSign, CreditCard, Users, TrendingUp } from "lucide-react";

export default function Finance() {
    const { summary, loading, error } = useFinanceSummary();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Error cargando finanzas: {error}
            </div>
        );
    }

    if (!summary) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
                <p className="text-muted-foreground">Resumen de ingresos y métricas financieras.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${summary.total_revenue.toLocaleString('es-CO')} {summary.currency}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Confirmados y Pagados
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reservas Pagadas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total_bookings_confirmed}</div>
                        <p className="text-xs text-muted-foreground">Total histórico</p>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdowns */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {/* Revenue by Plan */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Por Plan</CardTitle>
                        <CardDescription>Distribución de ingresos por tipo de plan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(summary.revenue_by_plan).map(([plan, amount]) => (
                                <div key={plan} className="flex items-center">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{plan || "Desconocido"}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {((amount / summary.total_revenue) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="font-bold">
                                        ${amount.toLocaleString('es-CO')}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(summary.revenue_by_plan).length === 0 && (
                                <p className="text-sm text-muted-foreground">No hay datos disponibles.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue by Method */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Por Método de Pago</CardTitle>
                        <CardDescription>Canales de recaudo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(summary.revenue_by_payment_method).map(([method, amount]) => (
                                <div key={method} className="flex items-center">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{method}</p>
                                    </div>
                                    <div className="font-bold">
                                        ${amount.toLocaleString('es-CO')}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(summary.revenue_by_payment_method).length === 0 && (
                                <p className="text-sm text-muted-foreground">No hay datos disponibles.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue by Channel */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Por Canal</CardTitle>
                        <CardDescription>Origen de la reserva</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(summary.revenue_by_channel).map(([channel, amount]) => (
                                <div key={channel} className="flex items-center">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{channel}</p>
                                    </div>
                                    <div className="font-bold">
                                        ${amount.toLocaleString('es-CO')}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(summary.revenue_by_channel).length === 0 && (
                                <p className="text-sm text-muted-foreground">No hay datos disponibles.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
