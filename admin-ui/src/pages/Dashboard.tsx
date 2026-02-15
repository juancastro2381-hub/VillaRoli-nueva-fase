import { useEffect, useState } from "react";
import api from "../lib/api";
import { KPICards } from "../components/admin/KPICards";
import { ReservationsTable } from "../components/admin/ReservationsTable";
import { BookingDetailModal } from "../components/admin/BookingDetailModal";
import { CreateBookingModal } from "../components/admin/CreateBookingModal";
import { Button } from "../components/ui/button";
import { FileDown, RefreshCw, Filter } from "lucide-react";

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

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filters & Pagination State
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const limit = 20; // Pagination limit

    useEffect(() => {
        loadDashboardData();
    }, [statusFilter, page]);

    const loadDashboardData = () => {
        setIsLoading(true);
        setError(null);
        Promise.all([fetchBookings(), fetchKPIs()])
            .catch(e => {
                console.error("Dashboard data error:", e);
                if (!error) setError("Ocurrió un error al cargar los datos.");
            })
            .finally(() => setIsLoading(false));
    };

    const fetchBookings = async () => {
        try {
            const skip = (page - 1) * limit;
            const res = await api.get("/admin/bookings", {
                params: {
                    status: statusFilter,
                    limit: limit,
                    skip: skip
                }
            });
            setBookings(res.data);
        } catch (e: any) {
            console.error("Failed to fetch bookings:", e);
            setError("Error al cargar las reservas. Verifica tu sesión o el backend.");
        }
    };

    const fetchKPIs = async () => {
        try {
            const res = await api.get("/admin/kpis");
            setKpis(res.data);
        } catch (e: any) {
            console.error("Failed to load KPIs:", e);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm("¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer.")) return;

        try {
            await api.post(`/admin/bookings/${id}/cancel`);
            fetchBookings(); // Refresh list
            fetchKPIs(); // Refresh stats
        } catch (e) {
            alert("Error al cancelar la reserva.");
        }
    };

    const handleComplete = async (id: number) => {
        if (!confirm("¿Marcar esta reserva como COMPLETADA?")) return;
        try {
            await api.post(`/admin/bookings/${id}/complete`);
            fetchBookings();
            fetchKPIs();
        } catch (e) {
            alert("Error al completar la reserva.");
        }
    };

    const handleExpire = async (id: number) => {
        if (!confirm("¿Forzar EXPIRACIÓN de esta reserva?")) return;
        try {
            await api.post(`/admin/bookings/${id}/expire`);
            fetchBookings();
            fetchKPIs();
        } catch (e) {
            alert("Error al expirar la reserva.");
        }
    };

    const handleExport = async (format: 'pdf' | 'xlsx') => {
        try {
            const res = await api.get("/admin/reports/bookings", {
                params: { format },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `reservas.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            alert("Error al exportar.");
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 via-primary-50/20 to-secondary-50/20 min-h-screen pb-20 relative">
            <div className="absolute inset-0 bg-pattern-dots bg-pattern-dots opacity-20 pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Panel de Control</h1>
                        <p className="text-gray-600 mt-2 font-medium">Vista general y gestión diaria.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            + Nueva Reserva
                        </Button>
                        <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                        <Button variant="secondary" onClick={() => handleExport('pdf')}>
                            <FileDown className="h-4 w-4 mr-2" />
                            PDF
                        </Button>
                        <Button variant="outline" onClick={() => handleExport('xlsx')}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Excel
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Página {page} - Mostrando {bookings.length} resultados
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Filter Control */}
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                <Filter size={16} className="text-gray-500 ml-2" />
                                <select
                                    className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 font-medium"
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="ALL">Todos los Estados</option>
                                    <option value="PENDING">Pendientes</option>
                                    <option value="CONFIRMED">Confirmadas</option>
                                    <option value="CANCELLED">Canceladas</option>
                                    <option value="EXPIRED">Expiradas</option>
                                    <option value="CHECKED_IN">Check-in</option>
                                    <option value="COMPLETED">Completadas</option>
                                </select>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={bookings.length < limit}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </div>

                    <ReservationsTable
                        data={bookings}
                        isLoading={isLoading}
                        onView={(b) => setSelectedBooking(b)}
                        onCancel={handleCancel}
                        onComplete={handleComplete}
                        onExpire={handleExpire}
                    />

                    {bookings.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-gray-500">
                            No se encontraron reservas con los filtros seleccionados.
                        </div>
                    )}
                </div>
            </div>

            <BookingDetailModal
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                booking={selectedBooking}
            />

            <CreateBookingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    loadDashboardData();
                    alert("Reserva creada exitosamente");
                }}
            />
        </div>
    );
};

export default Dashboard;
