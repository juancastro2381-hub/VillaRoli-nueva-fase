import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, Home, Info, MessageCircle, Sun, UserCheck, Moon, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import fincaPiscinaNoche from "@/assets/finca-piscina-noche2.jpg";
import { AvailabilityCalendar } from "@/components/ui/AvailabilityCalendar";
import {
  WHATSAPP_NUMBER,
  PASADIA_PRICES,
  PASADIA_INFO,
  NOCHES_PRICES,
  NOCHES_INFO,
  PLAN_FAMILIA,
  HORA_ADICIONAL,
  DEPOSITO_GARANTIA,
  TIPO_RESERVA_LABELS,
  calcularPrecio,
  validarReglasNegocio,
  type TipoReserva,
} from "@/lib/pricing";
import { fetchHolidayContext, type HolidayContext } from "@/lib/calendar";

// Form imports
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { reservationSchema, type ReservationFormValues } from "@/lib/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const Reservas = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      ciudad: "",
      tipoReserva: "",
      huespedes: "",
      checkin: "",
      checkout: "",
      mensaje: "",
    },
  });

  // Watch values for calculations
  const checkin = form.watch("checkin");
  const checkout = form.watch("checkout");
  const tipoReserva = form.watch("tipoReserva") as TipoReserva | "";
  const huespedes = form.watch("huespedes");

  // Holiday Context State (from API) - MUST be before validationResult useMemo
  const [holidayContext, setHolidayContext] = useState<HolidayContext | null>(null);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);

  // Calcular noches
  const noches = useMemo(() => {
    if (!checkin || !checkout) return 1;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkin, checkout]);

  // Calcular precio
  const precioCalculado = useMemo(() => {
    if (!tipoReserva || !huespedes) return null;
    const personas = parseInt(huespedes);
    if (isNaN(personas)) return null;
    return calcularPrecio(tipoReserva as TipoReserva, personas, noches);
  }, [tipoReserva, huespedes, noches]);

  // Adapter for pricing logic (API snake_case -> Pricing camelCase)
  const pricingContext = useMemo(() => holidayContext ? {
    hasHolidayInWindow: holidayContext.has_holiday_in_window,
    holidays: holidayContext.holidays_in_window || [],
    holidays_in_range: holidayContext.holidays_in_range || [],
    holidays_in_window: holidayContext.holidays_in_window || []
  } : undefined, [holidayContext]);

  // 1. Validar reglas de negocio (Frontend Mirror)
  const validationResult = useMemo(() => {
    // Basic checks
    if (!tipoReserva || !huespedes || !checkin) return { valido: true, mensaje: "" };

    // For non-pasadia, we need checkout
    if (tipoReserva !== "pasadia" && !checkout) return { valido: true, mensaje: "" };

    const personas = parseInt(huespedes);
    if (isNaN(personas)) return { valido: true, mensaje: "" };

    // Pass detailed holiday context to validator
    return validarReglasNegocio(
      tipoReserva as TipoReserva,
      personas,
      checkin,
      checkout || checkin, // Fallback for pasadia
      pricingContext
    );
  }, [tipoReserva, huespedes, checkin, checkout, pricingContext]);

  const isPasadia = tipoReserva === "pasadia";

  // Opciones de personas según tipo de reserva
  const personasOptions = useMemo(() => {
    if (tipoReserva === "plan-familia") return [1, 2, 3, 4, 5];

    // Day pass can be large groups
    if (tipoReserva === "pasadia") return Array.from({ length: 100 }, (_, i) => i + 1);

    // Full Property Plans (Weekday, Weekend, Holiday) require Min 10
    // Backend/Pricing rule: Min 10. Max Capacity: 37.
    if (["noches-entre-semana", "noches-fin-semana", "noches-festivo"].includes(tipoReserva)) {
      // Generate range 10 to 37
      return Array.from({ length: 37 - 9 }, (_, i) => i + 10);
    }

    // Default fallback (should effectively be unreachable if all types covered above, but safe to keep)
    return Array.from({ length: 37 }, (_, i) => i + 1);
  }, [tipoReserva]);


  // Helper to translate backend error codes
  const translateError = (code: string) => {
    const errors: Record<string, string> = {
      "PAST_DATE_NOT_ALLOWED": "No puedes seleccionar fechas pasadas para realizar una reserva.",
      "MIN_NIGHTS_REQUIRED": "Este plan requiere mínimo una noche de estadía.",
      "DAY_PASS_INVALID_RANGE": "El plan Pasadía solo permite seleccionar una sola fecha. Por favor elige un solo día.",
      "MIN_PEOPLE_NOT_MET": "Este plan requiere un mínimo de personas (10 para Finca Completa).",
      "INVALID_WEEKDAY_DATES": "La Finca Completa entre semana solo se puede reservar de lunes a jueves (noches de lun, mar, mie, jue).",
      "INVALID_WEEKEND_DATES": "El plan Fin de Semana es Viernes a Domingo (noches de viernes y sábado).",
      "HOLIDAY_REQUIRED": "Este plan solo aplica para fines de semana que tengan un día festivo asociado.",
      "PLAN_NOT_ALLOWED_ON_HOLIDAY": "Este plan no está permitido en fechas festivas.",
      "FAMILY_PLAN_LIMIT_EXCEEDED": "El Plan Familia es válido solo para máximo 5 personas.",
      "FAMILY_PLAN_ONE_NIGHT": "El Plan Familia es para exactamente 1 noche.",
      "OVERBOOKING_NOT_ALLOWED": "Las fechas seleccionadas ya están reservadas. Por favor elige otras fechas.",
      "OverbookingError": "Las fechas seleccionadas no están disponibles."
    };
    return errors[code] || "Error en la validación de la reserva: " + code;
  };

  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [formData, setFormData] = useState<ReservationFormValues | null>(null);

  // Availability Check State
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [holidayFetchError, setHolidayFetchError] = useState(false);

  // Debounced Availability Check
  useEffect(() => {
    // Reset error when inputs change (optimistic)
    setAvailabilityError(null);

    if (!checkin) return;

    // Determine effective dates
    const effectiveCheckIn = checkin;
    const effectiveCheckOut = tipoReserva === "pasadia" ? checkin : checkout;

    if (!effectiveCheckOut) return;

    // Validate dates locally first (don't spam backend with invalid ranges)
    if (new Date(effectiveCheckIn).getTime() < new Date().setHours(0, 0, 0, 0)) return;
    if (tipoReserva !== "pasadia" && effectiveCheckIn >= effectiveCheckOut) return;

    const timer = setTimeout(async () => {
      setIsCheckingAvailability(true);
      try {
        const query = new URLSearchParams({
          check_in: effectiveCheckIn,
          check_out: effectiveCheckOut,
          property_id: "1"
        });

        const res = await fetch(`http://localhost:8000/bookings/availability?${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.available === false) {
            setAvailabilityError("Las fechas seleccionadas no están disponibles. Por favor elige otras.");
          } else {
            setAvailabilityError(null);
          }
        }
      } catch (err) {
        console.error("Availability check failed", err);
        // We don't block the user on network error here, let the main submit handle it
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [checkin, checkout, tipoReserva]);

  // Fetch Holiday Context from API for Festivo plan
  useEffect(() => {
    // (e.g. Weekday plan must block holidays)
    if (!tipoReserva) {
      setHolidayContext(null);
      return;
    }

    if (!checkin || !checkout) {
      setHolidayContext(null);
      return;
    }

    const fetchHolidays = async () => {
      setIsLoadingHolidays(true);
      setHolidayFetchError(false); // Reset error state
      try {
        const context = await fetchHolidayContext(checkin, checkout);
        if (!context) {
          console.warn("Holiday context returned null");
          setHolidayFetchError(true);
        }
        setHolidayContext(context);
      } catch (err) {
        console.error("Failed to fetch holiday context", err);
        setHolidayFetchError(true);
        setHolidayContext(null);
      } finally {
        setIsLoadingHolidays(false);
      }
    };

    fetchHolidays();
  }, [checkin, checkout, tipoReserva]);

  const onSubmit = async (data: ReservationFormValues) => {
    console.log("🔍 onSubmit called with data:", data);

    // 0. Loading Gate: Prevent submit if holidays are still loading (initial load)
    if (isLoadingHolidays) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. BLOCKING DATA FETCH: Get fresh holiday context
      // We do not rely on state here to avoid race conditions.
      // We treat the backend as the single source of truth at the moment of submission.
      const freshHolidayContext = await fetchHolidayContext(
        data.checkin,
        data.checkout || data.checkin
      );

      // Update state to keep UI in sync, but don't wait for re-render
      setHolidayContext(freshHolidayContext);

      const currentPricingContext = freshHolidayContext ? {
        hasHolidayInWindow: freshHolidayContext.has_holiday_in_window,
        holidays: freshHolidayContext.holidays_in_window || [],
        holidays_in_range: freshHolidayContext.holidays_in_range || [],
        holidays_in_window: freshHolidayContext.holidays_in_window || []
      } : undefined;

      // 2. Safety Check: Run validation with FRESH context
      const validation = validarReglasNegocio(
        data.tipoReserva as TipoReserva,
        parseInt(data.huespedes),
        data.checkin,
        data.checkout || data.checkin,
        currentPricingContext // Use fresh mapped context
      );

      console.log("📋 Validation result (Fresh Context):", validation);

      if (!validation.valido) {
        console.warn("❌ BLOCKED: Business rule validation failed:", validation.mensaje);
        toast({
          variant: "destructive",
          title: "Reserva no válida",
          description: validation.mensaje
        });
        setIsSubmitting(false);
        return;
      }

      // 3. BLOCKING Availability Check (Final Safety Net)
      if (availabilityError) {
        console.warn("❌ BLOCKED: Availability error present:", availabilityError);
        setIsSubmitting(false);
        return;
      }

      // 4. Final blocking availability query (synchronous check)
      console.log("🔄 Starting final availability check...");

      const effectiveCheckIn = data.checkin;
      const effectiveCheckOut = data.tipoReserva === "pasadia" ? data.checkin : (data.checkout || data.checkin);

      const query = new URLSearchParams({
        check_in: effectiveCheckIn,
        check_out: effectiveCheckOut,
        property_id: "1"
      });

      const availabilityRes = await fetch(`http://localhost:8000/bookings/availability?${query}`);

      if (availabilityRes.ok) {
        const availabilityData = await availabilityRes.json();
        console.log("📡 Availability response:", availabilityData);

        if (availabilityData.available === false) {
          console.warn("❌ BLOCKED: Dates unavailable");
          setAvailabilityError("Las fechas seleccionadas no están disponibles. Por favor elige otras.");
          setIsSubmitting(false);
          return;
        }
      }

      // 5. Move to Payment Selection (All validations passed)
      console.log("✅ ALL VALIDATIONS PASSED - Transitioning to payment screen");
      setFormData(data);
      setShowPaymentSelection(true);
      setIsSubmitting(false);
      toast({
        title: "Paso 1 completado",
        description: "Ahora selecciona tu método de pago.",
      });

    } catch (err) {
      console.error("Submission process failed", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al procesar tu solicitud. Intenta nuevamente."
      });
      setIsSubmitting(false);
    }
  };

  const handleFinalizeReservation = async (method: string, type: string) => {
    if (!formData) return;
    setIsSubmitting(true);
    console.log(`🚀 Initiating Booking... Method: ${method}, Type: ${type}`);

    try {
      const policyMap: Record<string, string> = {
        "pasadia": "day_pass",
        "noches-entre-semana": "full_property_weekday",
        "noches-fin-semana": "full_property_weekend",
        "noches-festivo": "full_property_holiday",
        "plan-familia": "family_plan"
      };

      const payload = {
        check_in: formData.checkin,
        check_out: formData.checkout || formData.checkin,
        guest_count: parseInt(formData.huespedes),
        policy_type: policyMap[formData.tipoReserva],
        guest_name: formData.nombre,
        guest_email: formData.email,
        guest_phone: formData.telefono,
        guest_city: formData.ciudad,
        payment_method: method,
        payment_type: type
      };

      console.log("📦 Sending Payload:", payload);

      const response = await fetch("http://localhost:8000/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("📩 Backend Response:", result);

      if (!response.ok) {
        let errorMessage = "No pudimos procesar tu solicitud.";

        if (result.error_code === "OverbookingError" || result.error_code === "OVERBOOKING_NOT_ALLOWED" || response.status === 409) {
          // Map 409 to same frontend availability error (consistency)
          setAvailabilityError("Las fechas seleccionadas no están disponibles. Por favor elige otras.");
          setShowPaymentSelection(false); // Go back to form
          setIsSubmitting(false);
          return;
        }

        if (result.error_code) {
          errorMessage = translateError(result.error_code);
        }
        // Handle Pydantic Validation Errors (422 with detail array)
        else if (Array.isArray(result.detail)) {
          const firstError = result.detail[0];
          errorMessage = `Error: ${firstError.msg} en ${firstError.loc.join(".")}`;
        }
        else if (result.message) {
          errorMessage = result.message;
        }

        console.error("❌ Booking Failed:", errorMessage);
        // CRITICAL: DO NOT show toast in payment screen.
        // Silent redirect to form where inline error will show.
        setShowPaymentSelection(false);
        setFormData(null);
        setIsSubmitting(false);
        return;
      }

      // Success Logic
      console.log("✅ Booking Created! ID:", result.booking_id);

      // Explicit Redirection Logic
      if (method === "ONLINE_GATEWAY") {
        if (result.payment_url) {
          console.log("🔗 Redirecting to Payment URL:", result.payment_url);
          window.location.href = result.payment_url;
          return; // Prevent further execution
        } else {
          console.error("❌ Missing Payment URL in response:", result);
          toast({
            variant: "destructive",
            title: "Error de Pago",
            description: "El servidor no devolvió la URL de pago. Por favor contacta soporte."
          });
          setIsSubmitting(false);
        }
      } else if (method === "BANK_TRANSFER") {
        console.log("🏦 Redirecting to Success Page (Bank Transfer)");
        window.location.href = `/checkout/success?booking_id=${result.booking_id}&method=bt&expires=${result.expires_at}`;
        return;
      } else {
        // Direct Agreement
        console.log("🤝 Redirecting to Success Page (Direct)");
        window.location.href = `/checkout/success?booking_id=${result.booking_id}&method=direct`;
        return;
      }

    } catch (error) {
      console.error("🔥 Network/Runtime Error:", error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Verifica tu conexión a internet.",
      });
      setIsSubmitting(false);
    }
  };

  if (showPaymentSelection && formData && precioCalculado) {
    // DEFENSIVE CHECK: Validate before showing payment screen
    // This prevents UI desync edge cases

    // Ensure we map the context correctly again
    const currentPricingContext = holidayContext ? {
      hasHolidayInWindow: holidayContext.has_holiday_in_window,
      holidays: holidayContext.holidays_in_window || [],
      holidays_in_range: holidayContext.holidays_in_range || [],
      holidays_in_window: holidayContext.holidays_in_window || []
    } : undefined;

    const defensiveValidation = validarReglasNegocio(
      formData.tipoReserva as TipoReserva,
      parseInt(formData.huespedes),
      formData.checkin,
      formData.checkout || formData.checkin,
      currentPricingContext // Ensure WE PASS CONTEXT
    );

    if (!defensiveValidation.valido) {
      // Critical: Business rule violation detected at payment screen
      console.warn("🛡️ PAYMENT GUARD BLOCKED: Invalid state detected.", {
        reason: defensiveValidation.mensaje,
        context: currentPricingContext
      });
      setShowPaymentSelection(false);
      setFormData(null);
      // The inline alert will show automatically via validationResult
      return (
        <Layout>
          <div className="section-padding bg-gray-50 min-h-[60vh] flex items-center justify-center">
            <div className="container-custom max-w-3xl text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Reserva no válida</h2>
              <p className="text-muted-foreground mb-4">{defensiveValidation.mensaje}</p>
              <p className="text-sm text-gray-400">Redirigiendo al formulario...</p>
            </div>
          </div>
        </Layout>
      );
    }

    console.log("✅ Payment screen validation passed");

    return (
      <Layout>
        <div className="section-padding bg-gray-50 min-h-[60vh]">
          <div className="container-custom max-w-3xl">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Selecciona tu Método de Pago</h2>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h3 className="font-semibold text-lg text-gray-700">Resumen de Pago</h3>
                <button onClick={() => setShowPaymentSelection(false)} className="text-gold underline text-sm">Volver</button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Total a Pagar:</span>
                  <span className="font-bold text-xl">${precioCalculado.total.toLocaleString()} COP</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Opción Abono (50%):</span>
                  <span>${(precioCalculado.total * 0.5).toLocaleString()} COP</span>
                </div>
              </div>

              <div className="video-options space-y-4">
                {/* Online Payment */}
                <div className="border rounded-lg p-4 hover:border-gold transition cursor-pointer bg-blue-50/50">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Sun size={18} /> Pago Online (Tarjetas / PSE)</h4>
                  <div className="flex gap-4 mt-3">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleFinalizeReservation("ONLINE_GATEWAY", "FULL")}
                      disabled={isSubmitting}
                    >
                      Pagar Totalidad
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleFinalizeReservation("ONLINE_GATEWAY", "PARTIAL")}
                      disabled={isSubmitting}
                    >
                      Abonar 50%
                    </Button>
                  </div>
                  <p className="text-xs text-blue-800/60 mt-2">Confirmación inmediata.</p>
                </div>

                {/* Bank Transfer */}
                <div className="border rounded-lg p-4 hover:border-gold transition cursor-pointer bg-white">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Home size={18} /> Transferencia Bancaria</h4>
                  <p className="text-sm text-gray-500 mb-3">Nequi, Daviplata o Bancolombia. Tienes 60 minutos para enviar el comprobante.</p>
                  <Button
                    className="w-full bg-gray-800 hover:bg-gray-900"
                    onClick={() => handleFinalizeReservation("BANK_TRANSFER", "PARTIAL")}
                    disabled={isSubmitting}
                  >
                    Reservar con Abono (50%)
                  </Button>
                </div>

                {/* Alert 60 min */}
                <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-3 rounded">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>Al seleccionar "Abonar 50%" o "Transferencia", tu reserva quedará reservada por 60 minutos hasta que se confirme el pago.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={fincaPiscinaNoche}
            alt="Reservas en Villa Roli"
            className="w-full h-full object-cover"
            loading="lazy"
            height="100%"
            width="100%"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
        </div>

        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-cta/20 backdrop-blur-sm rounded-full text-gold font-body text-sm tracking-wider uppercase mb-4">
              Reservas
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-cream-light">
              Reservar Finca
            </h1>
            <p className="font-body text-cream-light/80 text-lg mt-4 max-w-2xl mx-auto">
              Selecciona tu plan ideal y completa el formulario para enviar tu solicitud.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-cta font-body text-sm tracking-wider uppercase">
              Precios 2026
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
              Nuestros Planes
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pasadía */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                  <Sun className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Pasadía</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{PASADIA_INFO.horario}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Por persona:</span>
                  <span className="font-semibold text-gold">${PASADIA_PRICES.entreSemana.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">{PASADIA_INFO.nota}</p>
            </motion.div>

            {/* Noches - Finca Completa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                  <Moon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Noches</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{NOCHES_INFO.horario}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lun - Jue (mín. 10):</span>
                  <span className="font-semibold text-gold">${NOCHES_PRICES.entreSemana.precio.toLocaleString()}/p</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Vie - Dom (mín. 10):</span>
                  <span className="font-semibold text-gold">${NOCHES_PRICES.finDeSemana.precio.toLocaleString()}/p</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Festivo (mín. 10):</span>
                  <span className="font-semibold text-gold">${NOCHES_PRICES.festivo.precio.toLocaleString()}/p</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">+ Aseo: ${NOCHES_INFO.aseo.toLocaleString()}</p>
            </motion.div>

            {/* Plan Familia */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 border border-gold/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-cream-light">Plan Familia</h3>
              </div>
              <p className="text-cream-light/70 text-sm mb-4">{PLAN_FAMILIA.horario}</p>
              <div className="mb-4">
                <span className="font-display text-2xl font-bold text-gold">${PLAN_FAMILIA.precio.toLocaleString()}</span>
                <span className="text-cream-light/70 text-sm"> / noche</span>
              </div>
              <ul className="space-y-1 text-sm text-cream-light/80 mb-4">
                <li>• Máximo {PLAN_FAMILIA.maxPersonas} personas</li>
                <li>• {PLAN_FAMILIA.cabana}</li>
                <li>• Aseo incluido</li>
              </ul>
              <p className="text-xs text-gold italic">{PLAN_FAMILIA.nota}</p>
            </motion.div>
          </div>

          {/* Info adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-card/50 rounded-xl p-4 border border-border flex items-center gap-3">
              <Shield className="w-6 h-6 text-gold flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Depósito de garantía:</strong> ${DEPOSITO_GARANTIA.toLocaleString()} COP (reembolsable)
              </p>
            </div>
            <div className="bg-card/50 rounded-xl p-4 border border-border flex items-center gap-3">
              <Info className="w-6 h-6 text-gold flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Hora adicional:</strong> desde ${HORA_ADICIONAL.hasta10.toLocaleString()} COP
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Info */}
                  <div className="bg-card rounded-2xl p-8 border border-border">
                    <h2 className="font-display text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                      <Users className="text-gold" />
                      Información Personal
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo *</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu nombre" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="tu@email.com" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+57 322 972 6625" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ciudad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad de Origen</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu ciudad" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className="bg-card rounded-2xl p-8 border border-border">
                    <h2 className="font-display text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                      <Home className="text-gold" />
                      Detalles de la Reserva
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="tipoReserva"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Reserva *</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  form.setValue("huespedes", ""); // Reset huespedes when type changes
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Selecciona el tipo de reserva" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pasadia">
                                    <span className="flex items-center gap-2">
                                      <Sun size={16} className="text-gold" />
                                      Pasadía (8AM - 5PM) - ${PASADIA_PRICES.entreSemana.toLocaleString()}/persona
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="noches-entre-semana">
                                    <span className="flex items-center gap-2">
                                      <Moon size={16} className="text-gold" />
                                      Finca Completa Entre Semana - ${NOCHES_PRICES.entreSemana.precio.toLocaleString()}/persona/noche
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="noches-fin-semana">
                                    <span className="flex items-center gap-2">
                                      <Moon size={16} className="text-gold" />
                                      Finca Completa Fin de Semana - ${NOCHES_PRICES.finDeSemana.precio.toLocaleString()}/persona/noche
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="noches-festivo">
                                    <span className="flex items-center gap-2">
                                      <Moon size={16} className="text-gold" />
                                      Finca Completa Festivo - ${NOCHES_PRICES.festivo.precio.toLocaleString()}/persona/noche
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="plan-familia">
                                    <span className="flex items-center gap-2">
                                      <UserCheck size={16} className="text-gold" />
                                      Plan Familia (máx. 5 personas) - ${PLAN_FAMILIA.precio.toLocaleString()}
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="huespedes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Personas *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background">
                                  <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {personasOptions.map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} {num === 1 ? "persona" : "personas"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="checkin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{isPasadia ? "Fecha del Pasadía *" : "Fecha de Llegada *"}</FormLabel>
                            <FormControl>
                              <Input type="date" className="bg-background" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!isPasadia && (
                        <FormField
                          control={form.control}
                          name="checkout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Salida *</FormLabel>
                              <FormControl>
                                <Input type="date" className="bg-background" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {/* Validation Alert - Only show in form, not in payment screen */}
                    {!showPaymentSelection && !validationResult.valido && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-red-700 mb-1">Corrección Requerida</p>
                          <p className="text-red-800/80">{validationResult.mensaje}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Availability Checking Indicator */}
                    {isCheckingAvailability && !availabilityError && validationResult.valido && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3"
                      >
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                        <p className="text-sm text-blue-800">Verificando disponibilidad...</p>
                      </motion.div>
                    )}

                    {/* Availability Error Alert */}
                    {availabilityError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl flex items-start gap-3 shadow-md"
                      >
                        <AlertCircle className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-red-800 mb-1">Fechas no disponibles</p>
                          <p className="text-red-900/80">{availabilityError}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Price Calculator */}
                    {precioCalculado && validationResult.valido && !availabilityError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-gradient-to-r from-gold/10 to-gold/5 rounded-xl border border-gold/20"
                      >
                        <h4 className="font-display text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                          <CheckCircle className="text-gold" size={20} />
                          Precio Estimado
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{precioCalculado.descripcion}</p>
                        <div className="space-y-1">
                          {precioCalculado.aseo > 0 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-semibold">${precioCalculado.subtotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Aseo:</span>
                                <span className="font-semibold">${precioCalculado.aseo.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between text-lg border-t border-gold/20 pt-2 mt-2">
                            <span className="font-semibold text-foreground">Total:</span>
                            <span className="font-bold text-gold">${precioCalculado.total.toLocaleString()} COP</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Depósito de garantía (reembolsable):</span>
                            <span>${DEPOSITO_GARANTIA.toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="bg-card rounded-2xl p-8 border border-border">
                    <h2 className="font-display text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                      <Info className="text-gold" />
                      Información Adicional
                    </h2>
                    <FormField
                      control={form.control}
                      name="mensaje"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comentarios o Solicitudes Especiales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Cuéntanos si tienes alguna solicitud especial, hora de llegada estimada, servicios adicionales que te interesen, etc."
                              rows={4}
                              className="bg-background resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmitting || isLoadingHolidays || !validationResult.valido || !!availabilityError || isCheckingAvailability}
                  >
                    {isCheckingAvailability ? "Verificando disponibilidad..." : (isSubmitting ? "Abriendo Reservas..." : "Realizar Reserva")}
                  </Button>
                </form>
              </Form>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-32 space-y-8">
                <AvailabilityCalendar />

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                    Acomodaciones Disponibles
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para reservas de Finca Completa, contamos con 3 cabañas:
                  </p>
                  <div className="space-y-3">
                    {NOCHES_INFO.cabanas.map((cabana) => (
                      <div key={cabana.nombre} className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0">
                        <div>
                          <p className="font-semibold text-foreground">{cabana.nombre}</p>
                          <p className="text-sm text-muted-foreground">{cabana.camas}</p>
                        </div>
                        <p className="text-gold font-semibold">{cabana.capacidad} pers.</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Capacidad total:</strong> 37 personas
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                    Información Importante
                  </h3>
                  <ul className="space-y-4 text-muted-foreground font-body">
                    <li className="flex items-start gap-3">
                      <Calendar size={20} className="text-gold shrink-0 mt-1" />
                      <span><strong className="text-foreground">Noches:</strong> Ingreso 1 PM - Salida 1 PM</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sun size={20} className="text-gold shrink-0 mt-1" />
                      <span><strong className="text-foreground">Pasadía:</strong> 8 AM - 5 PM</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield size={20} className="text-gold shrink-0 mt-1" />
                      <span><strong className="text-foreground">Depósito:</strong> ${DEPOSITO_GARANTIA.toLocaleString()} (reembolsable)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-primary text-primary-foreground rounded-2xl p-8">
                  <h3 className="font-display text-xl font-semibold mb-4">
                    ¿Necesitas Ayuda?
                  </h3>
                  <p className="font-body text-primary-foreground/80 mb-4">
                    Si tienes preguntas o prefieres reservar por teléfono,
                    estamos aquí para ayudarte.
                  </p>
                  <p className="font-body font-semibold text-gold">
                    +57 322 972 6625
                  </p>
                  <p className="font-body text-primary-foreground/80 text-sm mt-1">
                    Lun - Dom: 8:00 AM - 8:00 PM
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Reservas;
