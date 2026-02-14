import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "./StatusBadge";
import { MoreHorizontal, FileDown, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

interface ReservationsTableProps {
    data: Booking[];
    onView: (booking: Booking) => void;
    onCancel: (id: number) => void;
}

export const ReservationsTable = ({ data, onView, onCancel }: ReservationsTableProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Data
    const filteredData = data.filter((item) => {
        const matchesSearch =
            item.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toString().includes(searchTerm);

        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

        return matchesSearch && matchesStatus;
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
        return format(new Date(dateStr), "dd MMM yyyy", { locale: es });
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, email o ID..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>Todos</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")}>Confirmados</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>Pendientes</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED")}>Cancelados</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Helper text */}
                <div className="text-sm text-muted-foreground self-center">
                    Mostrando {filteredData.length} resultados
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Huésped</TableHead>
                            <TableHead>Fechas</TableHead>
                            <TableHead>Pax</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Pago</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha Creación</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">#{booking.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{booking.guest_name}</span>
                                            <span className="text-xs text-muted-foreground">{booking.guest_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>Check-in: {formatDate(booking.check_in)}</span>
                                            <span className="text-xs text-muted-foreground">Check-out: {formatDate(booking.check_out)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{booking.guest_count}</TableCell>
                                    <TableCell>{formatCurrency(booking.total_amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {booking.payment_method || "N/A"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={booking.status} />
                                        {booking.is_override && (
                                            <Badge variant="secondary" className="ml-2 text-[10px] bg-purple-100 text-purple-700 border-purple-200">
                                                Manual
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(booking.created_at || "")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onView(booking)}>
                                                    Ver Detalle
                                                </DropdownMenuItem>
                                                {booking.status !== "CANCELLED" && (
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => onCancel(booking.id)}
                                                    >
                                                        Cancelar Reserva
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Anterior
                </Button>
                <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {Math.max(totalPages, 1)}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
};
