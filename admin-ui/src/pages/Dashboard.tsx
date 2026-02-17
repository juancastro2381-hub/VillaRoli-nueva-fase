import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { KPICards } from "../components/admin/KPICards";
import { ReservationsTable } from "../components/admin/ReservationsTable";
import { BookingDetailModal } from "../components/admin/BookingDetailModal";
import { CreateBookingModal } from "../components/admin/CreateBookingModal";
import { PendingPaymentsTable } from "../components/PendingPaymentsTable";
import { usePendingPayments } from "../hooks/usePendingPayments";
import { useAdminKpis } from "../hooks/useAdminKpis";
import { useFinanceSummary } from "../hooks/useFinanceSummary";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { FileDown, RefreshCw, Filter, CreditCard, CalendarDays } from "lucide-react";

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

const Dashboard = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);

    // KPI Hooks
    const { kpis, loading: kpisLoading, refetch: refetchKpis } = useAdminKpis();
    const { summary: financeSummary } = useFinanceSummary(); // For debug/future use

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("reservations");

    // Filters & Pagination State
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const limit = 20; // Pagination limit

    // Pending Payments Hook
    const { payments: pendingPayments, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = usePendingPayments();

    useEffect(() => {
        loadDashboardData();
    }, [statusFilter, page]);

    // Debug visibility for Finance Summary
    useEffect(() => {
        if (financeSummary) {
            console.log('financeSummary', financeSummary);
        }
    }, [financeSummary]);

    // Auto-clear notifications
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const loadDashboardData = () => {
        setIsLoading(true);
        // Don't clear error here to allow persistence if needed, or clear it if it's a fresh load
        // setError(null); 
        Promise.all([fetchBookings(), refetchKpis()])
            .catch(e => {
                console.error("Dashboard data error:", e);
                // Only set error if it's a hard fail
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
        }
    };

    const handleKpiClick = (type: 'bookings' | 'revenue' | 'active' | 'occupancy') => {
        switch (type) {
            case 'bookings':
                setActiveTab('reservations');
                setStatusFilter('ALL');
                break;
            case 'revenue':
                // Route doesn't exist yet, but user requested navigation. 
                // For now, staying on dashboard or could navigate to a finance page if created.
                // console.log("Navigate to Finance");
                navigate('/admin/finance');
                break;
            case 'active':
                setActiveTab('reservations');
                setStatusFilter('CONFIRMED');
                break;
            case 'occupancy':
                // navigate('/admin/calendar'); // Route doesn't exist in App.tsx yet
                console.log("Navigate to Calendar");
                navigate('/admin/calendar');
                break;
        }
    };

    const handleConfirm = async (id: number) => {
        try {
            await api.post(`/admin/bookings/${id}/confirm`);
            setSuccess("Reserva confirmada exitosamente.");
            fetchBookings();
            refetchKpis();
        } catch (e: any) {
            setError(e.response?.data?.detail || "Error al confirmar la reserva.");
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm("¿Estás seguro de cancelar esta reserva? ESTA ACCIÓN NO SE PUEDE DESHACER.\n\nSe liberarán las fechas inmediatamente.")) return;

        try {
            await api.post(`/admin/bookings/${id}/cancel`);
            setSuccess("Reserva cancelada exitosamente.");
            fetchBookings(); // Refresh list
            refetchKpis(); // Refresh stats
        } catch (e: any) {
            setError(e.response?.data?.detail || "Error al cancelar la reserva.");
        }
    };

    const handleComplete = async (id: number) => {
        if (!confirm("¿Marcar esta reserva como COMPLETADA?")) return;
        try {
            await api.post(`/admin/bookings/${id}/complete`);
            setSuccess("Reserva marcada como completada.");
            fetchBookings();
            refetchKpis();
        } catch (e) {
            setError("Error al completar la reserva.");
        }
    };

    const handleExpire = async (id: number) => {
        if (!confirm("¿Marcar esta reserva como expirada?")) return;
        try {
            await api.post(`/admin/bookings/${id}/expire`);
            setSuccess("Reserva marcada como expirada.");
            await loadDashboardData();
        } catch (e: any) {
            setError(
                e.response?.data?.detail ||
                "Error al marcar reserva como expirada."
            );
        }
    };

    const handlePaymentConfirmed = (paymentId: number) => {
        setSuccess(`Pago #${paymentId} confirmado exitosamente.`);
        refetchPayments();
        loadDashboardData(); // Refresh list
        refetchKpis(); // Refresh KPIs
    };

    const handlePaymentRejected = (paymentId: number) => {
        setSuccess(`Pago #${paymentId} rechazado.`);
        refetchPayments();
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
            setSuccess(`Reporte ${format.toUpperCase()} exportado correctamente.`);
        } catch (e) {
            setError("Error al exportar.");
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 via-primary-50/20 to-secondary-50/20 min-h-screen pb-20 relative">
            <div className="absolute inset-0 bg-pattern-dots bg-pattern-dots opacity-20 pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Panel de Control</h1>
                        <p className="text-gray-600 mt-2 font-medium">Vista general y gestión diaria.</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
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

                {/* Notifications */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <strong className="font-bold">Éxito: </strong>
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}

                {/* KPI Cards */}
                <KPICards
                    totalBookings={kpis.total_bookings}
                    totalRevenue={kpis.monthly_revenue}
                    activeBookings={kpis.active_bookings}
                    occupancyRate={kpis.occupancy_rate}
                    onCardClick={handleKpiClick}
                />

                {/* Main Content with Tabs */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                            <TabsTrigger value="reservations" className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Reservaciones
                            </TabsTrigger>
                            <TabsTrigger value="payments" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Pagos
                                {pendingPayments.length > 0 && (
                                    <Badge variant="danger" className="ml-1">
                                        {pendingPayments.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Reservations Tab */}
                        <TabsContent value="reservations" className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
                                onConfirm={handleConfirm}
                                onCancel={handleCancel}
                                onComplete={handleComplete}
                                onExpire={handleExpire}
                            />

                            {bookings.length === 0 && !isLoading && (
                                <div className="text-center py-12 text-gray-500">
                                    No se encontraron reservas con los filtros seleccionados.
                                </div>
                            )}
                        </TabsContent>

                        {/* Payments Tab */}
                        <TabsContent value="payments">
                            <PendingPaymentsTable
                                payments={pendingPayments}
                                loading={paymentsLoading}
                                error={paymentsError}
                                onRefresh={refetchPayments}
                                onPaymentConfirmed={handlePaymentConfirmed}
                                onPaymentRejected={handlePaymentRejected}
                            />
                        </TabsContent>
                    </Tabs>
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
                    setSuccess("Reserva creada exitosamente.");
                }}
            />
        </div>
    );
};

export default Dashboard;
