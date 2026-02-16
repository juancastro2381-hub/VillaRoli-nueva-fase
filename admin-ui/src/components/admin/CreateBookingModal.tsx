import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { CheckCircle2 } from "lucide-react";
import api from "../../lib/api";

interface CreateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateBookingModal = ({ isOpen, onClose, onSuccess }: CreateBookingModalProps) => {
    const [formData, setFormData] = useState({
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
        cleaning_fee: 0,
    });

    // Formatting Helpers
    const formatCurrency = (value: number | string) => {
        if (value === undefined || value === null) return "0";
        return new Intl.NumberFormat('es-CO').format(Number(value));
    };

    const parseCurrency = (value: string) => {
        return Number(value.replace(/\./g, ''));
    };

    // State
    const [priceBreakdown, setPriceBreakdown] = useState<string[]>([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial State Reset
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
            setPriceBreakdown([]);
        }
    }, [isOpen]);

    // Plan Change Handler
    const handlePlanChange = (newPolicy: string) => {
        let updates: any = { policy_type: newPolicy };

        if (newPolicy === 'day_pass') {
            // Pasadía: Force same day
            if (formData.check_in) {
                updates.check_out = formData.check_in;
            }
        } else if (newPolicy === 'family_plan') {
            // Family Plan: Max 5 guests, 1 night
            if (formData.guest_count > 5) {
                updates.guest_count = 5;
            }
            if (formData.check_in) {
                const d = new Date(formData.check_in);
                d.setDate(d.getDate() + 1);
                updates.check_out = d.toISOString().split('T')[0];
            }
        }
        setFormData(prev => ({ ...prev, ...updates }));
    };

    // Calculate Price via Server-Side Preview
    useEffect(() => {
        const fetchPrice = async () => {
            if (!formData.check_in || !formData.check_out) {
                return;
            }

            // Basic validation
            const start = new Date(formData.check_in);
            const end = new Date(formData.check_out);
            const diffTime = end.getTime() - start.getTime();
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (days < 0) return;

            // Plan Specific Checks
            if (formData.policy_type === 'day_pass' && days !== 0) return;
            if (formData.policy_type === 'family_plan' && (days !== 1 || formData.guest_count > 5)) return;

            setIsCalculating(true);
            try {
                const res = await api.post("/admin/pricing/preview", {
                    check_in: formData.check_in,
                    check_out: formData.check_out,
                    guest_count: formData.guest_count,
                    policy_type: formData.policy_type
                });

                const data = res.data;
                setFormData(prev => ({
                    ...prev,
                    subtotal: data.subtotal,
                    cleaning_fee: data.cleaning_fee
                }));
                setPriceBreakdown(data.breakdown || []);
                setError(null);
            } catch (err: any) {
                console.error("Price Preview Error:", err);
                if (err.response?.status === 400) {
                    // Only set error if it is a strict validation error we want to show immediately?
                    // Or just let them try to submit? 
                    // Let's show it if it's descriptive
                    setError(err.response.data.detail);
                }
            } finally {
                setIsCalculating(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchPrice();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.check_in, formData.check_out, formData.guest_count, formData.policy_type]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.check_in || !formData.check_out) {
            setError("Fechas son obligatorias");
            return;
        }

        const checkInDate = new Date(formData.check_in);
        const checkOutDate = new Date(formData.check_out);

        // Strict Plan Validations
        if (formData.policy_type === 'day_pass') {
            if (formData.check_in !== formData.check_out) {
                setError("Para Pasadía, la fecha de llegada y salida debe ser la misma.");
                return;
            }
        } else if (formData.policy_type === 'family_plan') {
            const diff = checkOutDate.getTime() - checkInDate.getTime();
            const nights = Math.ceil(diff / (1000 * 3600 * 24));
            if (nights !== 1) {
                setError("El Plan Familia es para exactamente 1 noche.");
                return;
            }
            if (formData.guest_count > 5) {
                setError("El Plan Familia permite un máximo de 5 personas.");
                return;
            }
        } else {
            if (checkOutDate <= checkInDate) {
                setError("La fecha de salida debe ser posterior a la de llegada.");
                return;
            }
        }

        if (!formData.guest_name || !formData.guest_email || !formData.guest_phone) {
            setError("Todos los datos del huésped (Nombre, Email, Teléfono) son obligatorios.");
            return;
        }

        const total = formData.subtotal + formData.cleaning_fee;
        if (total <= 0) {
            setError("Error calculando el precio. Revise las fechas.");
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
                setError(err.response.data.detail);
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

            // Auto-adjust dates if plan constraints exist
            if (name === 'check_in' && value) {
                const dateVal = value;
                if (formData.policy_type === 'day_pass') {
                    setFormData(prev => ({ ...prev, check_out: dateVal }));
                } else if (formData.policy_type === 'family_plan') {
                    const d = new Date(dateVal);
                    d.setDate(d.getDate() + 1);
                    const nextDay = d.toISOString().split('T')[0];
                    setFormData(prev => ({ ...prev, check_out: nextDay }));
                }
            }
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
                    <div className="bg-red-50 text-red-600 p-3 rounded text-sm font-medium border border-red-200">
                        {error}
                    </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg border mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Plan</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="plan_selector"
                                className="text-orange-600 focus:ring-orange-500"
                                checked={formData.policy_type === 'full_property_weekday'}
                                onChange={() => handlePlanChange('full_property_weekday')}
                            />
                            <span className="text-sm text-gray-900">Manual / Estándar</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="plan_selector"
                                className="text-orange-600 focus:ring-orange-500"
                                checked={formData.policy_type === 'day_pass'}
                                onChange={() => handlePlanChange('day_pass')}
                            />
                            <span className="text-sm text-gray-900">Pasadía ($25k)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="plan_selector"
                                className="text-orange-600 focus:ring-orange-500"
                                checked={formData.policy_type === 'family_plan'}
                                onChange={() => handlePlanChange('family_plan')}
                            />
                            <span className="text-sm text-gray-900">Plan Familiar ($420k)</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Llegada (Check-in)</label>
                        <input
                            type="date"
                            name="check_in"
                            value={formData.check_in}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {formData.policy_type === 'day_pass' ? "Salida (Mismo Día)" : "Salida (Check-out)"}
                        </label>
                        <input
                            type="date"
                            name="check_out"
                            value={formData.check_out}
                            onChange={handleChange}
                            required
                            disabled={formData.policy_type === 'day_pass' || formData.policy_type === 'family_plan'}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border ${formData.policy_type !== 'full_property_weekday' ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                        />
                        {formData.policy_type === 'family_plan' && (
                            <p className="text-xs text-blue-600 mt-1">Fijo 1 noche</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Huéspedes</label>
                        <input
                            type="number"
                            name="guest_count"
                            min="1"
                            max={formData.policy_type === 'family_plan' ? 5 : 20}
                            value={formData.guest_count}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                        {formData.policy_type === 'family_plan' && (
                            <p className="text-xs text-red-500 mt-1">Máximo 5 personas</p>
                        )}
                    </div>
                </div>

                {/* Price Breakdown Card */}
                {formData.check_in && formData.check_out && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-2">
                        <h4 className="text-orange-900 font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-orange-600" />
                            {isCalculating ? "Calculando..." : "Detalle de Precio"}
                        </h4>

                        {!isCalculating && priceBreakdown.length > 0 && (
                            <ul className="text-sm text-orange-800 mb-4 list-disc pl-5 space-y-1">
                                {priceBreakdown.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        )}

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
                                <span className="font-bold text-lg text-orange-900">Total a Pagar:</span>
                                <span className="font-bold text-xl text-orange-700">${formatCurrency(derivedTotal)} COP</span>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="border-t pt-4 mt-4 bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500 mb-2">
                        <strong>Nota:</strong> Como administrador, tienes permisos para ignorar ciertas reglas, pero el precio se calcula automáticamente según la política seleccionada.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notas / Observaciones (Opcional)</label>
                        <textarea
                            name="override_reason"
                            value={formData.override_reason}
                            onChange={handleChange}
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Detalles adicionales..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={isLoading || isCalculating}>
                        {isLoading ? "Creando..." : "Crear Reserva"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
