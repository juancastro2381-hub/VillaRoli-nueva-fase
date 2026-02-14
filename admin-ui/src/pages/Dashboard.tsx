import { useEffect, useState } from "react";
import api from "../lib/api";
import { KPICards } from "../components/admin/KPICards";
import { ReservationsTable } from "../components/admin/ReservationsTable";
import { BookingDetailModal } from "../components/admin/BookingDetailModal";
import { Button } from "../components/ui/button";
import { FileDown, RefreshCw } from "lucide-react";

interface Booking {
    id: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_city?: string;
    check_in: string;
    check_out: string;
    status: string;
    guest_count: number;
    total_amount: number;
    payment_method?: string;
    payment_status?: string;
    created_at?: string;
    is_override: boolean;
    override_reason?: string;
}

interface KPIStats {
    total_bookings: number;
    monthly_revenue: number;
    active_bookings: number;
    occupancy_rate: number;
}

const Dashboard = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [kpis, setKpis] = useState<KPIStats>({
        total_bookings: 0,
        monthly_revenue: 0,
        active_bookings: 0,
        occupancy_rate: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = () => {
        setIsLoading(true);
        setError(null);
        Promise.all([fetchBookings(), fetchKPIs()])
            .catch(e => {
                console.error("Dashboard data error:", e);
                if (!error) setError("Ocurrió un error al cargar los datos. Verifica tu conexión.");
            })
            .finally(() => setIsLoading(false));
    };

    const fetchBookings = async () => {
        try {
            // Using public endpoint for development - switch to /admin/bookings when auth is configured
            const res = await api.get("/admin/bookings/public");
            setBookings(res.data);
        } catch (e: any) {
            console.error("Failed to fetch bookings:", e);
            setError("Error al cargar las reservas. Verifica que el backend esté corriendo.");
            throw e;
        }
    };

    const fetchKPIs = async () => {
        try {
            // Using public endpoint for development - switch to /admin/kpis when auth is configured
            const res = await api.get("/admin/kpis/public");
            setKpis(res.data);
        } catch (e: any) {
            console.error("Failed to load KPIs:", e);
            setError("Error al cargar los KPIs. Verifica que el backend esté corriendo.");
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm("¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer.")) return;

        try {
            await api.post(`/admin/bookings/${id}/cancel`);
            fetchBookings(); // Refresh data
            fetchKPIs(); // Update stats
        } catch (e) {
            alert("Error al cancelar la reserva.");
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.get("/admin/reports/bookings", {
                params: { format: "pdf" },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = "reservas.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            alert("Error al exportar.");
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 via-primary-50/20 to-secondary-50/20 min-h-screen pb-20 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-pattern-dots bg-pattern-dots opacity-20 pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Panel de Reservas</h1>
                        <p className="text-gray-600 mt-2 font-medium">Gestiona y monitorea todas las reservas del sistema.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                        <Button variant="gradient-secondary" onClick={handleExport}>
                            <FileDown className="h-4 w-4" />
                            Exportar PDF
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-danger-50 border-2 border-danger-200 text-danger-700 px-4 py-3 rounded-lg relative animate-slide-down" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* KPI Cards */}
                <KPICards
                    totalBookings={kpis.total_bookings}
                    totalRevenue={kpis.monthly_revenue}
                    activeBookings={kpis.active_bookings}
                    occupancyRate={kpis.occupancy_rate}
                />

                {/* Main Content */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Listado de Reservas</h2>
                        <p className="text-sm text-gray-600 mt-1">Visualiza y administra las reservas recientes.</p>
                    </div>

                    <ReservationsTable
                        data={bookings}
                        isLoading={isLoading}
                        onView={(b) => setSelectedBooking(b)}
                        onCancel={handleCancel}
                    />
                </div>
            </div>

            <BookingDetailModal
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                booking={selectedBooking}
            />
        </div>
    );
};

export default Dashboard;

