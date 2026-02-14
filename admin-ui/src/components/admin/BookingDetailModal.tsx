import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { StatusBadge } from "./StatusBadge";

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

interface BookingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

export const BookingDetailModal = ({ isOpen, onClose, booking }: BookingDetailModalProps) => {
    if (!booking) return null;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Reserva #${booking.id}`}
            footer={
                <Button onClick={onClose}>Cerrar</Button>
            }
        >
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                        <div className="mt-1"><StatusBadge status={booking.status} /></div>
                    </div>
                    <div className="text-right">
                        <h4 className="text-sm font-medium text-gray-500">Total</h4>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(booking.total_amount)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Huésped</h4>
                        <p className="font-medium">{booking.guest_name}</p>
                        <p className="text-sm text-gray-600">{booking.guest_email}</p>
                        <p className="text-sm text-gray-600">{booking.guest_phone}</p>
                        {booking.guest_city && <p className="text-sm text-gray-600">{booking.guest_city}</p>}
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Detalles</h4>
                        <p className="text-sm"><span className="font-medium">Check-in:</span> {formatDate(booking.check_in)}</p>
                        <p className="text-sm"><span className="font-medium">Check-out:</span> {formatDate(booking.check_out)}</p>
                        <p className="text-sm"><span className="font-medium">Huéspedes:</span> {booking.guest_count}</p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Información de Pago</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Método:</span>
                            <span className="ml-2 font-medium">{booking.payment_method || "N/A"}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Estado Pago:</span>
                            <span className="ml-2 font-medium">{booking.payment_status || "Pendiente"}</span>
                        </div>
                    </div>
                </div>

                {booking.is_override && (
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mt-4">
                        <h4 className="text-xs font-bold text-yellow-800 uppercase">Reserva Manual (Override)</h4>
                        {booking.override_reason && <p className="text-sm text-yellow-700 mt-1">{booking.override_reason}</p>}
                    </div>
                )}

                <div className="text-xs text-center text-gray-400 pt-4">
                    Creada el {formatDate(booking.created_at || "")}
                </div>
            </div>
        </Modal>
    );
};
