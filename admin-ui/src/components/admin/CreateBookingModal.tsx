import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import api from "../../lib/api";

interface CreateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateBookingModal = ({ isOpen, onClose, onSuccess }: CreateBookingModalProps) => {
    const [formData, setFormData] = useState({
        property_id: 1, // Default to 1 for now, or fetch properties
        check_in: "",
        check_out: "",
        guest_count: 2,
        policy_type: "full_property_weekday", // Default
        is_override: true, // Defaulting to true as requested
        override_reason: "",
        guest_name: "",
        guest_email: "",
        guest_phone: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            setFormData({
                property_id: 1,
                check_in: "",
                check_out: "",
                guest_count: 2,
                policy_type: "full_property_weekday",
                is_override: true,
                override_reason: "",
                guest_name: "",
                guest_email: "",
                guest_phone: ""
            });
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic Validation
        if (!formData.check_in || !formData.check_out) {
            setError("Fechas requeridas.");
            return;
        }
        if (formData.is_override && !formData.override_reason.trim()) {
            // Default reason if empty
            formData.override_reason = "Reserva Manual Admin";
        }

        setIsLoading(true);
        try {
            await api.post("/admin/bookings", formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    setError(detail);
                } else if (Array.isArray(detail)) {
                    // Pydantic validation error
                    setError(detail.map((e: any) => e.msg).join(", "));
                } else {
                    setError(JSON.stringify(detail));
                }
            } else {
                setError("Error al crear la reserva.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Handle checkbox
        if (e.target.type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nueva Reserva Manual"
            footer={null} // Custom footer in form
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Propiedad</label>
                        <select
                            name="property_id"
                            value={formData.property_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value={1}>Villa Roli (Principal)</option>
                        </select>
                    </div>
                    {/* Hidden Plan Selector - Defaulting to generic weekday plan but ignored due to override */}
                    <input type="hidden" name="policy_type" value="full_property_weekday" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Check-in</label>
                        <input
                            type="date"
                            name="check_in"
                            value={formData.check_in}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Check-out</label>
                        <input
                            type="date"
                            name="check_out"
                            value={formData.check_out}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Huéspedes</label>
                        <input
                            type="number"
                            name="guest_count"
                            min="1"
                            value={formData.guest_count}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Datos del Huésped (Opcionales)</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">Nombre Completo</label>
                            <input
                                type="text"
                                name="guest_name"
                                value={formData.guest_name}
                                onChange={handleChange}
                                placeholder="Ej: Juan Pérez"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                                <input
                                    type="email"
                                    name="guest_email"
                                    value={formData.guest_email}
                                    onChange={handleChange}
                                    placeholder="juan@email.com"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Teléfono</label>
                                <input
                                    type="tel"
                                    name="guest_phone"
                                    value={formData.guest_phone}
                                    onChange={handleChange}
                                    placeholder="+57 300 123 4567"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Implicit Override: Hidden but active */}
                <div className="border-t pt-4 mt-4 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500 mb-2">
                        <strong>Nota:</strong> Como administrador, tienes permisos para ignorar restricciones de plan (mínimo de noches, personas, etc), pero <strong>NO</strong> se permite sobre-reservar fechas ocupadas ni usar fechas pasadas.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notas / Observaciones (Opcional)</label>
                        <textarea
                            name="override_reason"
                            value={formData.override_reason}
                            onChange={handleChange}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Detalles adicionales de la reserva..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creando..." : "Crear Reserva"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
