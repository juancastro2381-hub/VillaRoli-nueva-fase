
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Check, X, AlertTriangle } from 'lucide-react';

interface Booking {
    id: number;
    guest_name: string;
    guest_email: string;
    check_in: string;
    check_out: string;
    status: string;
    guest_count: number;
    property_id: number;
    is_override: boolean;
    override_reason?: string;
    total_price?: number;
    payment_status?: string; // If available in API
}

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
    const queryClient = useQueryClient();

    const cancelBooking = useMutation({
        mutationFn: async (id: number) => {
            await api.post(`/admin/bookings/${id}/cancel`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
    });

    const confirmBooking = useMutation({
        mutationFn: async (id: number) => {
            await api.put(`/admin/bookings/${id}/status`, { status: "CONFIRMED" });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] })
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-sm text-gray-600 uppercase">
                        <th className="p-3 border-b">ID</th>
                        <th className="p-3 border-b">Huésped</th>
                        <th className="p-3 border-b">Fechas</th>
                        <th className="p-3 border-b">Pax</th>
                        <th className="p-3 border-b">Estado</th>
                        <th className="p-3 border-b">Override</th>
                        <th className="p-3 border-b text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {bookings?.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 border-b last:border-0">
                            <td className="p-3 font-medium">#{booking.id}</td>
                            <td className="p-3">
                                <div className="font-semibold">{booking.guest_name || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{booking.guest_email}</div>
                            </td>
                            <td className="p-3">
                                {booking.check_in} <br />
                                <span className="text-gray-400">to</span><br />
                                {booking.check_out}
                            </td>
                            <td className="p-3">{booking.guest_count}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {booking.status}
                                </span>
                            </td>
                            <td className="p-3">
                                {booking.is_override ? (
                                    <div className="flex items-center gap-1 text-orange-600" title={booking.override_reason}>
                                        <AlertTriangle size={16} />
                                        <span className="text-xs font-bold">YES</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-300">-</span>
                                )}
                            </td>
                            <td className="p-3 text-right">
                                <div className="flex justify-end gap-2">
                                    {booking.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => { if (confirm('¿Confirmar reserva manual?')) confirmBooking.mutate(booking.id) }}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-green-200"
                                                title="Confirmar"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => { if (confirm('¿Cancelar reserva?')) cancelBooking.mutate(booking.id) }}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200"
                                                title="Cancelar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'CONFIRMED' && (
                                        <button
                                            onClick={() => { if (confirm('¿Cancelar reserva?')) cancelBooking.mutate(booking.id) }}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200"
                                            title="Cancelar"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
