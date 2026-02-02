import { z } from "zod";
import { NOCHES_PRICES, PLAN_FAMILIA, TipoReserva } from "./pricing";

// =====================
// RESERVATION SCHEMA
// =====================

export const reservationSchema = z.object({
    nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Ingresa un correo electrónico válido" }),
    telefono: z.string().min(7, { message: "Ingresa un número de teléfono válido" }),
    ciudad: z.string().optional(),
    tipoReserva: z.string().min(1, { message: "Selecciona un tipo de reserva" }),
    huespedes: z.string().min(1, { message: "Selecciona la cantidad de personas" }),
    checkin: z.string().min(1, { message: "Selecciona la fecha de llegada" }),
    checkout: z.string().optional(),
    mensaje: z.string().optional(),
}).refine((data) => {
    // Pasadía validation
    if (data.tipoReserva === "pasadia") {
        return true; // No special validation needed for pasadia basic fields
    }

    // If not pasadia, checkout is required
    if (!data.checkin) return false;

    if (data.tipoReserva !== "pasadia" && !data.checkout) {
        return false;
    }

    return true;
}, {
    message: "La fecha de salida es obligatoria para hospedaje",
    path: ["checkout"],
}).superRefine((data, ctx) => {
    const personas = parseInt(data.huespedes);
    const tipo = data.tipoReserva as TipoReserva;

    if (isNaN(personas)) return;

    // Validate "Entre Semana"
    if (tipo === "noches-entre-semana") {
        if (personas < NOCHES_PRICES.entreSemana.minimoPersonas) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Mínimo ${NOCHES_PRICES.entreSemana.minimoPersonas} personas para entre semana`,
                path: ["huespedes"],
            });
        }
    }

    // Validate "Fin de Semana"
    if (tipo === "noches-fin-semana") {
        if (personas < NOCHES_PRICES.finDeSemana.minimoPersonas) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Mínimo ${NOCHES_PRICES.finDeSemana.minimoPersonas} personas para fin de semana`,
                path: ["huespedes"],
            });
        }
    }

    // Validate "Festivo"
    if (tipo === "noches-festivo") {
        if (personas < NOCHES_PRICES.festivo.minimoPersonas) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Mínimo ${NOCHES_PRICES.festivo.minimoPersonas} personas para festivos`,
                path: ["huespedes"],
            });
        }
    }

    // Validate "Plan Familia"
    if (tipo === "plan-familia") {
        if (personas > PLAN_FAMILIA.maxPersonas) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Máximo ${PLAN_FAMILIA.maxPersonas} personas para Plan Familia`,
                path: ["huespedes"],
            });
        }
    }
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;


// =====================
// CONTACT SCHEMA
// =====================

export const contactSchema = z.object({
    nombre: z.string().min(2, { message: "El nombre es muy corto" }),
    email: z.string().email({ message: "Email inválido" }),
    telefono: z.string().optional(),
    asunto: z.string().min(4, { message: "El asunto es muy corto" }),
    mensaje: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres" }),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
