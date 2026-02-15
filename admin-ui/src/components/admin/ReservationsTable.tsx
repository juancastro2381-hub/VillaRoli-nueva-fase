import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { Search, MoreHorizontal } from "lucide-react";

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

interface ReservationsTableProps {
    data: Booking[];
    isLoading?: boolean;
    onView: (booking: Booking) => void;
    onCancel: (id: number) => void;
    onComplete: (id: number) => void;
    onExpire: (id: number) => void;
}

export const ReservationsTable = ({ data, isLoading = false, onView, onCancel, onComplete, onExpire }: ReservationsTableProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const itemsPerPage = 10;

    // Filter Data
    const filteredData = data.filter((item) => {
        // Search
        const matchesSearch =
            item.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toString().includes(searchTerm);

        // Status
        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

        // Date Range (Check-in)
        let matchesDate = true;
        if (dateStart) {
            matchesDate = matchesDate && new Date(item.check_in) >= new Date(dateStart);
        }
        if (dateEnd) {
            matchesDate = matchesDate && new Date(item.check_in) <= new Date(dateEnd);
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const toggleMenu = (id: number) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por nombre, id..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative w-full sm:w-40">
                        <select
                            className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">Estado: Todos</option>
                            <option value="CONFIRMED">Confirmados</option>
                            <option value="PENDING">Pendientes</option>
                            <option value="CANCELLED">Cancelados</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="date"
                                className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                            />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="relative">
                            <input
                                type="date"
                                className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                            />
                        </div>
                        {(dateStart || dateEnd) && (
                            <Button variant="ghost" size="sm" onClick={() => { setDateStart(""); setDateEnd(""); }}>
                                Limpiar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Helper text */}
                <div className="text-sm text-gray-500 self-center whitespace-nowrap">
                    {isLoading ? "Cargando..." : `Mostrando ${filteredData.length} resultados`}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 w-[80px]">ID</th>
                                <th className="px-4 py-3">Huésped</th>
                                <th className="px-4 py-3">Fechas</th>
                                <th className="px-4 py-3">Pax</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Pago</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Creación</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                // Skeleton Loader Rows
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-4"><Skeleton className="h-4 w-8" /></td>
                                        <td className="px-4 py-4">
                                            <Skeleton className="h-4 w-24 mb-1" />
                                            <Skeleton className="h-3 w-32" />
                                        </td>
                                        <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-4 w-8" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                                        No se encontraron resultados que coincidan con los filtros.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">#{booking.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{booking.guest_name}</span>
                                                <span className="text-xs text-gray-500">{booking.guest_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col text-sm text-gray-600">
                                                <span className="whitespace-nowrap">In: {formatDate(booking.check_in)}</span>
                                                <span className="whitespace-nowrap">Out: {formatDate(booking.check_out)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{booking.guest_count}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(booking.total_amount)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                                    {booking.payment_method || "N/A"}
                                                </span>
                                                {booking.payment_status && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${booking.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {booking.payment_status}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={booking.status} />
                                            {booking.is_override && (
                                                <div className="mt-1">
                                                    <span className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                                        EXCEPCIÓN
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                            {formatDate(booking.created_at || "")}
                                        </td>
                                        <td className="px-4 py-3 text-right relative">
                                            <Button variant="ghost" size="icon" onClick={() => toggleMenu(booking.id)} className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>

                                            {openMenuId === booking.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                                                        <button
                                                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                                            onClick={() => { onView(booking); setOpenMenuId(null); }}
                                                        >
                                                            Ver Detalle
                                                        </button>
                                                        {booking.status !== "CANCELLED" && (
                                                            <button
                                                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                                                onClick={() => { onCancel(booking.id); setOpenMenuId(null); }}
                                                            >
                                                            </button>
                                                        )}
                                                        {booking.status === "CONFIRMED" && (
                                                            <button
                                                                className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100"
                                                                onClick={() => { onComplete(booking.id); setOpenMenuId(null); }}
                                                            >
                                                                Marcar Completada
                                                            </button>
                                                        )}
                                                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                                                            <button
                                                                className="block w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-100"
                                                                onClick={() => { onExpire(booking.id); setOpenMenuId(null); }}
                                                            >
                                                                Forzar Expiración
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                >
                    Anterior
                </Button>
                <div className="text-sm text-gray-500">
                    Página {currentPage} de {Math.max(totalPages, 1)}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages || isLoading}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
};
