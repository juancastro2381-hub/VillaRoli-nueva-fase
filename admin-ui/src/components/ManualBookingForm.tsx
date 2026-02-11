
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { AlertCircle } from 'lucide-react';

export default function ManualBookingForm({ onSuccess }: { onSuccess: () => void }) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        property_id: 1,
        check_in: '',
        check_out: '',
        guest_count: 1,
        policy_type: 'full_property_weekend',
        is_override: false,
        override_reason: ''
    });
    const [error, setError] = useState('');

    const createBooking = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/admin/bookings', data);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            onSuccess();
            alert(`Reserva creada Exitosamente! ID: ${data.booking_id}`);
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Error creando reserva');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.is_override && !formData.override_reason) {
            setError('Debe especificar una razón para la excepción.');
            return;
        }
        createBooking.mutate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded flex items-center gap-2 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Check In</label>
                    <input
                        type="date" required
                        className="w-full p-2 border rounded"
                        value={formData.check_in}
                        onChange={e => setFormData({ ...formData, check_in: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Check Out</label>
                    <input
                        type="date" required
                        className="w-full p-2 border rounded"
                        value={formData.check_out}
                        onChange={e => setFormData({ ...formData, check_out: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Huéspedes</label>
                    <input
                        type="number" min="1" required
                        className="w-full p-2 border rounded"
                        value={formData.guest_count}
                        onChange={e => setFormData({ ...formData, guest_count: parseInt(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Propiedad</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={formData.property_id}
                        onChange={e => setFormData({ ...formData, property_id: parseInt(e.target.value) })}
                    >
                        <option value={1}>Finca Principal</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Plan / Política</label>
                <select
                    className="w-full p-2 border rounded"
                    value={formData.policy_type}
                    onChange={e => setFormData({ ...formData, policy_type: e.target.value })}
                >
                    <option value="day_pass">Pasadía</option>
                    <option value="full_property_weekday">Finca Completa (Semana)</option>
                    <option value="full_property_weekend">Finca Completa (Finde)</option>
                    <option value="full_property_holiday">Finca Completa (Festivo)</option>
                    <option value="family_plan">Plan Familia</option>
                </select>
            </div>

            <div className="bg-orange-50 p-4 rounded border border-orange-200">
                <label className="flex items-center gap-2 font-semibold text-orange-800 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.is_override}
                        onChange={e => setFormData({ ...formData, is_override: e.target.checked })}
                    />
                    Override Rules (Admin Exception)
                </label>

                {formData.is_override && (
                    <div className="mt-2">
                        <label className="block text-sm font-medium text-orange-800 mb-1">Razón de Excepción *</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-orange-300 rounded"
                            placeholder="Ej: Autorizado por Gerencia, Evento especial, etc."
                            value={formData.override_reason}
                            onChange={e => setFormData({ ...formData, override_reason: e.target.value })}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium"
                    disabled={createBooking.isPending}
                >
                    {createBooking.isPending ? 'Creando...' : 'Crear Reserva Manual'}
                </button>
            </div>
        </form>
    );
}
