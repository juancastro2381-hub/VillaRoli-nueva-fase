import { useEffect, useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { KPICards } from "@/components/admin/KPICards";
import { ReservationsTable } from "@/components/admin/ReservationsTable";
import { FileDown, RefreshCw } from "lucide-react";

interface Booking {
    id: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    check_in: string;
    check_out: string;
    status: string;
    guest_count: number;
    total_amount: number;
    payment_method?: string;
    created_at?: string;
    is_override: boolean;
}

const AdminBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/admin/bookings", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            } else {
                toast({ title: "Error", description: "No se pudieron cargar las reservas.", variant: "destructive" });
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Error de conexión.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm("¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer.")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8000/admin/bookings/${id}/cancel`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                toast({ title: "Reserva Cancelada", description: `La reserva #${id} ha sido cancelada.` });
                fetchBookings(); // Refresh data
            } else {
                toast({ title: "Error", description: "No se pudo cancelar la reserva.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Error al procesar la solicitud.", variant: "destructive" });
        }
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/admin/reports/bookings?format=pdf", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "reservas.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                toast({ title: "Error", description: "Falló la exportación.", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Error al exportar.", variant: "destructive" });
        }
    };

    // Calculate KPI Stats
    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const totalRevenue = bookings
            .filter(b => b.status === "CONFIRMED" || b.status === "PAID")
            .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

        const activeBookings = bookings.filter(b => b.status === "CONFIRMED").length;

        // Mock Occupancy for now (since we don't have total days available easily calculated here without more logic)
        // In a real app, this would come from backend.
        const occupancyRate = totalBookings > 0 ? 45 : 0;

        return { totalBookings, totalRevenue, activeBookings, occupancyRate };
    }, [bookings]);

    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen pb-20">
                <div className="container-custom py-8 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Reservas</h1>
                            <p className="text-muted-foreground mt-1">Gestiona y monitorea todas las reservas del sistema.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={fetchBookings} disabled={isLoading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </Button>
                            <Button onClick={handleExport}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Exportar Reporte
                            </Button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <KPICards
                        totalBookings={stats.totalBookings}
                        totalRevenue={stats.totalRevenue}
                        activeBookings={stats.activeBookings}
                        occupancyRate={stats.occupancyRate}
                    />

                    {/* Main Content */}
                    <div className="bg-white rounded-xl border shadow-sm p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold">Listado de Reservas</h2>
                            <p className="text-sm text-muted-foreground">Visualiza y administra las reservas recientes.</p>
                        </div>

                        <ReservationsTable
                            data={bookings}
                            onView={(b) => console.log("View", b)}
                            onCancel={handleCancel}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminBookings;
