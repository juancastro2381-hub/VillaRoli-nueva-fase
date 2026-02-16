import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { CheckCircle2 } from "lucide-react"; // Import Icon
import api from "../../lib/api";

interface CreateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateBookingModal = ({ isOpen, onClose, onSuccess }: CreateBookingModalProps) => {
    const [formData, setFormData] = useState({
        property_id: 1, // Default to 1
        check_in: "",
        check_out: "",
        guest_count: 2,
        policy_type: "full_property_weekday",
        is_override: true,
        override_reason: "",
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        subtotal: 0,
        cleaning_fee: 0,
        // total_amount is derived
    });

    const [nights, setNights] = useState(0);
    const [appliedRate, setAppliedRate] = useState(0);

    // Pricing Constants
    const RATES = {
        WEEKDAY: 55000,
        WEEKEND: 60000,
        HOLIDAY: 70000,
        CLEANING: 70000
    };

    // Currency Formatter
    const formatCurrency = (value: number | string) => {
        if (value === undefined || value === null) return "";
        return new Intl.NumberFormat('es-CO').format(Number(value));
    };

    const parseCurrency = (value: string) => {
        return Number(value.replace(/\./g, ''));
    };

    // Auto-calculate suggested price
    useEffect(() => {
        const calculatePrice = async () => {
            if (!formData.check_in || !formData.check_out) {
                setNights(0);
                return;
            }

            const start = new Date(formData.check_in);
            const end = new Date(formData.check_out);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                setNights(0);
                return;
            }

            const diffTime = Math.abs(end.getTime() - start.getTime());
            const calculatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

            setNights(calculatedNights);

            let rate = RATES.WEEKDAY;
            let isHoliday = false;
            let isWeekend = false;

            // Check for Weekend
            let currentDate = new Date(start);
            while (currentDate < end) {
                const day = currentDate.getDay();
                if (day === 5 || day === 6 || day === 0) { // Fri, Sat, Sun
                    isWeekend = true;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Check for Holidays
            try {
                const baseUrl = "http://localhost:8000/api/v1/calendar/holidays";
                const params = new URLSearchParams();
                params.append("check_in", formData.check_in);
                params.append("check_out", formData.check_out);

                const res = await fetch(baseUrl + "?" + params.toString());

                if (res.ok) {
                    const data = await res.json();
                    if (data.has_holiday_in_window || (data.holidays_in_range && data.holidays_in_range.length > 0)) {
                        isHoliday = true;
                    }
                }
            } catch (err) {
                console.error("Error fetching holidays:", err);
            }

            if (isHoliday) {
                rate = RATES.HOLIDAY;
            } else if (isWeekend) {
                rate = RATES.WEEKEND;
            } else {
                rate = RATES.WEEKDAY;
            }

            setAppliedRate(rate);

            // Calculate Suggested Splits
            const newSubtotal = rate * formData.guest_count * calculatedNights;
            const newCleaning = RATES.CLEANING;

            setFormData(prev => ({
                ...prev,
                subtotal: newSubtotal,
                cleaning_fee: newCleaning
            }));
        };

        calculatePrice();
    }, [formData.check_in, formData.check_out, formData.guest_count]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form
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
                guest_phone: "",
                subtotal: 0,
                cleaning_fee: 0
            });
            setError(null);
            setNights(0);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.check_in || !formData.check_out) {
            setError("Fechas son obligatorias");
            return;
        }

        const checkInDate = new Date(formData.check_in);
        const checkOutDate = new Date(formData.check_out);

        if (checkOutDate <= checkInDate) {
            setError("La fecha de salida debe ser posterior a la de llegada.");
            return;
        }

        if (!formData.guest_name || !formData.guest_email || !formData.guest_phone) {
            setError("Todos los datos del huésped (Nombre, Email, Teléfono) son obligatorios.");
            return;
        }

        const total = formData.subtotal + formData.cleaning_fee;
        if (total <= 0) {
            setError("El valor total de la reserva debe ser mayor a 0.");
            return;
        }

        if (formData.is_override && !formData.override_reason.trim()) {
            formData.override_reason = "Reserva Manual Admin";
        }

        setIsLoading(true);
        try {
            await api.post("/admin/bookings", {
                ...formData,
                manual_total_amount: total
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    setError(detail);
                } else if (Array.isArray(detail)) {
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
        if (e.target.type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMoneyChange = (name: 'subtotal' | 'cleaning_fee', valStr: string) => {
        const val = parseCurrency(valStr);
        if (!isNaN(val)) {
            setFormData(prev => ({ ...prev, [name]: val }));
        }
    };

    const derivedTotal = formData.subtotal + formData.cleaning_fee;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nueva Reserva Manual"
            footer={null}
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

                {/* Price Breakdown Card */}
                {formData.check_in && formData.check_out && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-2">
                        <h4 className="text-orange-900 font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-orange-600" />
                            Precio Estimado
                        </h4>
                        <p className="text-sm text-orange-800 mb-4">
                            {formData.guest_count} personas × {nights} noche(s) × ${formatCurrency(appliedRate)} + aseo
                        </p>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-orange-900">Subtotal:</label>
                                <div className="relative flex items-center w-40">
                                    <span className="text-gray-500 text-sm absolute ml-2 opacity-50">$</span>
                                    <input
                                        type="text"
                                        value={formatCurrency(formData.subtotal)}
                                        onChange={(e) => handleMoneyChange('subtotal', e.target.value)}
                                        className="w-full text-right bg-white border border-orange-300 rounded px-3 py-1 text-sm focus:ring-orange-500 focus:border-orange-500 pl-7"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-orange-900">Aseo:</label>
                                <div className="relative flex items-center w-40">
                                    <span className="text-gray-500 text-sm absolute ml-2 opacity-50">$</span>
                                    <input
                                        type="text"
                                        value={formatCurrency(formData.cleaning_fee)}
                                        onChange={(e) => handleMoneyChange('cleaning_fee', e.target.value)}
                                        className="w-full text-right bg-white border border-orange-300 rounded px-3 py-1 text-sm focus:ring-orange-500 focus:border-orange-500 pl-7"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-orange-200 mt-3 pt-3 flex justify-between items-center">
                                <span className="font-bold text-lg text-orange-900">Total:</span>
                                <span className="font-bold text-lg text-orange-700">${formatCurrency(derivedTotal)} COP</span>
                            </div>
                        </div>
                    </div>
                )}


                <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Datos del Huésped (Obligatorios)</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase">Nombre Completo</label>
                            <input
                                type="text"
                                name="guest_name"
                                value={formData.guest_name}
                                onChange={handleChange}
                                placeholder="Ej: Juan Pérez"
                                required
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
                                    required
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
                                    required
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
