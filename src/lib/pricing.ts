// PRECIOS 2026 - Villa Roli

export const WHATSAPP_NUMBER = "3229726625";

// =====================
// HORAS ADICIONALES (Check-in temprano o Check-out tarde)
// Horas extra en Check-out hasta las 6 pm
// =====================
export const HORA_ADICIONAL = {
  hasta10: 50000, // Hasta 10 personas (también aplica para Plan Familia)
  de11a30: 70000, // De 11 a 30 personas
  mas31: 100000, // 31 personas en adelante
};

// =====================
// DEPÓSITO DE GARANTÍA
// =====================
export const DEPOSITO_GARANTIA = 200000; // $200.000 COP

// =====================
// PASADÍAS (8 AM - 5 PM)
// Solo exteriores, no se habilitan cabañas
// =====================
export const PASADIA_PRICES = {
  finDeSemana: 25000, // Precio único por persona
  entreSemana: 25000, // Precio único por persona
};

export const PASADIA_INFO = {
  horario: "8:00 AM - 5:00 PM",
  nota: "No se habilitan las cabañas, solo zonas exteriores",
  incluye: [
    "Acceso a piscina para adultos",
    "Acceso a piscina para niños",
    "Zonas verdes y jardines",
    "Parqueadero privado",
    "Zona de BBQ disponible",
    "Sillas y mesas de descanso",
    "Baños y duchas",
  ],
};

// =====================
// NOCHES - FINCA COMPLETA (1 PM - 1 PM)
// Por persona, grupos
// =====================
export const NOCHES_PRICES = {
  entreSemana: {
    precio: 55000, // Lunes a Jueves
    minimoPersonas: 10,
  },
  finDeSemana: {
    precio: 60000, // Viernes a Domingo (sin festivo)
    minimoPersonas: 10,
  },
  festivo: {
    precio: 70000, // Fin de semana con festivo o día festivo
    minimoPersonas: 10,
  },
};

export const NOCHES_INFO = {
  horario: "Ingreso: 1:00 PM - Salida: 1:00 PM",
  aseo: 70000, // No incluido en el precio por persona
  nota: "No incluye el valor del aseo ($70.000)",
  cabanas: [
    { nombre: "Cabaña 1", capacidad: 12, camas: "4 habitaciones" },
    { nombre: "Cabaña 2", capacidad: 15, camas: "5 habitaciones" },
    { nombre: "Cabaña 3", capacidad: 10, camas: "3 habitaciones" },
  ],
};

// =====================
// PLAN FAMILIA (1 PM - 1 PM)
// Solo cabaña #3, máximo 5 personas
// NO DISPONIBLE EN DÍAS FESTIVOS
// =====================
export const PLAN_FAMILIA = {
  precio: 420000,
  maxPersonas: 5,
  cabana: "Cabaña #3",
  horario: "Ingreso: 1:00 PM - Salida: 1:00 PM",
  nota: "No disponible para días festivos",
  incluye: [
    "Hospedaje en Cabaña #3",
    "Valor del aseo incluido",
    "Acceso a piscinas",
    "Zonas verdes",
    "Parqueadero",
  ],
};

// =====================
// PLAN PAREJA - ELIMINADO EN 2026
// =====================
// El Plan Pareja ya no está disponible en 2026

// Tipos de reserva disponibles (sin Plan Pareja)
export type TipoReserva =
  | "pasadia"
  | "noches-entre-semana"
  | "noches-fin-semana"
  | "noches-festivo"
  | "plan-familia";

export const TIPO_RESERVA_LABELS: Record<TipoReserva, string> = {
  "pasadia": "Pasadía (8AM - 5PM)",
  "noches-entre-semana": "Finca Completa - Entre Semana (Lun-Jue)",
  "noches-fin-semana": "Finca Completa - Fin de Semana (Vie-Dom)",
  "noches-festivo": "Finca Completa - Festivo",
  "plan-familia": "Plan Familia (máx. 5 personas)",
};

// Función para calcular precio estimado
export function calcularPrecio(
  tipo: TipoReserva,
  personas: number,
  noches: number = 1
): { subtotal: number; aseo: number; deposito: number; total: number; descripcion: string } {
  let subtotal = 0;
  let aseo = 0;
  const deposito = DEPOSITO_GARANTIA;
  let descripcion = "";

  switch (tipo) {
    case "pasadia":
      subtotal = PASADIA_PRICES.entreSemana * personas;
      descripcion = `${personas} personas × $${PASADIA_PRICES.entreSemana.toLocaleString()}`;
      break;
    case "noches-entre-semana":
      subtotal = NOCHES_PRICES.entreSemana.precio * personas * noches;
      aseo = NOCHES_INFO.aseo;
      descripcion = `${personas} personas × ${noches} noche(s) × $${NOCHES_PRICES.entreSemana.precio.toLocaleString()} + aseo`;
      break;
    case "noches-fin-semana":
      subtotal = NOCHES_PRICES.finDeSemana.precio * personas * noches;
      aseo = NOCHES_INFO.aseo;
      descripcion = `${personas} personas × ${noches} noche(s) × $${NOCHES_PRICES.finDeSemana.precio.toLocaleString()} + aseo`;
      break;
    case "noches-festivo":
      subtotal = NOCHES_PRICES.festivo.precio * personas * noches;
      aseo = NOCHES_INFO.aseo;
      descripcion = `${personas} personas × ${noches} noche(s) × $${NOCHES_PRICES.festivo.precio.toLocaleString()} + aseo`;
      break;
    case "plan-familia":
      subtotal = PLAN_FAMILIA.precio;
      descripcion = `Plan Familia (hasta ${PLAN_FAMILIA.maxPersonas} personas, aseo incluido)`;
      break;
  }

  return { subtotal, aseo, deposito, total: subtotal + aseo, descripcion };
}

// Validar mínimo de personas
export function validarMinimoPersonas(tipo: TipoReserva, personas: number): { valido: boolean; mensaje: string } {
  switch (tipo) {
    case "noches-entre-semana":
      if (personas < NOCHES_PRICES.entreSemana.minimoPersonas) {
        return {
          valido: false,
          mensaje: `Mínimo ${NOCHES_PRICES.entreSemana.minimoPersonas} personas para entre semana`
        };
      }
      break;
    case "noches-fin-semana":
      if (personas < NOCHES_PRICES.finDeSemana.minimoPersonas) {
        return {
          valido: false,
          mensaje: `Mínimo ${NOCHES_PRICES.finDeSemana.minimoPersonas} personas para fin de semana`
        };
      }
      break;
    case "noches-festivo":
      if (personas < NOCHES_PRICES.festivo.minimoPersonas) {
        return {
          valido: false,
          mensaje: `Mínimo ${NOCHES_PRICES.festivo.minimoPersonas} personas para festivos`
        };
      }
      break;
    case "plan-familia":
      if (personas > PLAN_FAMILIA.maxPersonas) {
        return {
          valido: false,
          mensaje: `Máximo ${PLAN_FAMILIA.maxPersonas} personas para Plan Familia`
        };
      }
      break;
  }
  return { valido: true, mensaje: "" };
}

// Festivos 2026 (Source of Truth matches Backend)
export const HOLIDAYS_2026 = [
  "2026-01-01", "2026-01-12", "2026-03-23", "2026-04-02", "2026-04-03",
  "2026-05-01", "2026-05-18", "2026-06-08", "2026-06-15", "2026-06-29",
  "2026-07-20", "2026-08-07", "2026-08-17", "2026-10-12", "2026-11-02",
  "2026-11-16", "2026-12-08", "2026-12-25"
];

// Helper: Get dates between range (inclusive start, exclusive end)
const getDatesInRange = (startStr: string, endStr: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");

  // Logic: Iterate until < end (exclusive for nights logic check)
  // Backend logic yields [start, end).
  // Frontend logic checks the NIGHTS booked.
  const current = new Date(start);
  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Helper: Check holidays
const getHolidaysInRange = (startStr: string, endStr: string): string[] => {
  const dates = getDatesInRange(startStr, endStr);
  return dates.filter(d => HOLIDAYS_2026.includes(d));
};

// =====================
// VALIDACIÓN INTEGRAL (Mirror Backend Rules)
// =====================
export interface ValidationResult {
  valido: boolean;
  mensaje: string;
}

// Helper: Get the relevant "Sunday" for a date to determine the weekend window (Thu-Mon)
const getWeekendSunday = (d: Date): Date => {
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const sunday = new Date(d);

  if (day === 0) { // Sun
    // It is the sunday
  } else if (day === 1) { // Mon -> belong to previous weekend
    sunday.setDate(d.getDate() - 1);
  } else if (day >= 4) { // Thu(4), Fri(5), Sat(6) -> belong to upcoming weekend
    sunday.setDate(d.getDate() + (7 - day) % 7); // 4->+3(Sun), 5->+2, 6->+1
  } else {
    // Tue(2), Wed(3) -> No valid weekend context for this logic usually, 
    // but let's default to next sunday to fail validation gracefully later
    sunday.setDate(d.getDate() + (7 - day) % 7);
  }
  sunday.setHours(0, 0, 0, 0);
  return sunday;
};

export function validarReglasNegocio(
  tipo: TipoReserva,
  personas: number,
  checkin: string,
  checkout: string
): ValidationResult {
  if (!checkin || !checkout || !tipo || !personas) return { valido: true, mensaje: "" };

  const start = new Date(checkin + "T00:00:00");
  const end = new Date(checkout + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Past Dates
  if (start < today) {
    return { valido: false, mensaje: "No puedes reservar fechas pasadas." };
  }

  // 2. Day Pass Logic
  if (tipo === "pasadia") {
    if (checkin !== checkout) {
      return { valido: false, mensaje: "El plan Pasadía es de un solo día (Llegada = Salida)." };
    }
    return { valido: true, mensaje: "" };
  }

  // 3. Min Nights (General)
  if (end <= start) {
    return { valido: false, mensaje: "La fecha de salida debe ser posterior a la de llegada." };
  }

  const nights = getDatesInRange(checkin, checkout);
  const holidays = getHolidaysInRange(checkin, checkout);

  switch (tipo) {
    case "noches-entre-semana": // Mon-Thu only, No Holidays
      if (personas < 10) return { valido: false, mensaje: "Se requiere un mínimo de 10 personas para este plan." };
      if (holidays.length > 0) return { valido: false, mensaje: "Este plan no está permitido en fechas festivas." };

      for (const dateStr of nights) {
        const d = new Date(dateStr + "T00:00:00");
        const day = d.getDay();
        // Allowed: Mon(1), Tue(2), Wed(3), Thu(4)
        if (day === 0 || day === 5 || day === 6) {
          return { valido: false, mensaje: "Este plan solo se puede reservar de lunes a jueves." };
        }
      }
      break;

    case "noches-fin-semana": // Weekend Standard: Any combination of Fri/Sat/Sun nights
      if (personas < 10) return { valido: false, mensaje: "Se requiere un mínimo de 10 personas para este plan." };

      // Block if any holiday is present
      if (holidays.length > 0) {
        return {
          valido: false,
          mensaje: "Hay un festivo en tus fechas. Debes seleccionar el plan 'Finca Completa - Festivo'."
        };
      }

      // Night-based validation: All nights must be Friday(5), Saturday(6), or Sunday(0)
      // Valid combinations:
      // - Fri only: Fri→Sat
      // - Sat only: Sat→Sun
      // - Sun only: Sun→Mon
      // - Fri+Sat: Fri→Sun
      // - Sat+Sun: Sat→Mon
      // - Fri+Sat+Sun: Fri→Mon

      for (const dateStr of nights) {
        const d = new Date(dateStr + "T00:00:00");
        const day = d.getDay();
        // Only Friday(5), Saturday(6), or Sunday(0) nights are allowed
        if (day !== 5 && day !== 6 && day !== 0) {
          return {
            valido: false,
            mensaje: "El plan Fin de Semana Estándar solo permite noches de viernes, sábado o domingo."
          };
        }
      }
      break;

    case "noches-festivo": // Extended Holiday Window (Thu-Mon)
      // 1. Min People
      if (personas < 10) return { valido: false, mensaje: "Se requiere un mínimo de 10 personas para este plan." };

      // 2. Max 4 nights (Thu-Mon = 4 nights max)
      if (nights.length > 4) return { valido: false, mensaje: "El plan Festivo permite máximo 4 noches (Jueves a Lunes)." };

      // 3. Holiday Validation (Context-Aware)
      // Requirement: Accept ANY days (Thu, Fri, Sat, Sun, Mon) IF the weekend is a "Holiday Weekend".
      // Users can book Fri-Sat, Sat-Sun, Sun-Mon, etc., even if they don't touch the holiday date itself,
      // AS LONG AS the holiday exists in the surrounding weekend context (Thu-Mon).

      // Helper to format date safely (Local YYYY-MM-DD)
      const toLocalYMD = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Identify the "Anchor Sunday" of the weekend
      const anchorSunday = getWeekendSunday(start);

      // Define the "Holiday Window" (Thu -> Mon)
      const thuDate = new Date(anchorSunday); thuDate.setDate(anchorSunday.getDate() - 3);
      const monDate = new Date(anchorSunday); monDate.setDate(anchorSunday.getDate() + 1);

      const windowStartStr = toLocalYMD(thuDate);
      const windowEndStr = toLocalYMD(monDate);

      // Check if ANY holiday exists in this Thu-Mon window
      const isHolidayWeekend = HOLIDAYS_2026.some(h => h >= windowStartStr && h <= windowEndStr);

      if (!isHolidayWeekend) {
        return {
          valido: false,
          mensaje: "Este plan requiere que el fin de semana seleccionado tenga un día festivo."
        };
      }

      // 4. Day of Week Logic (Thu-Mon ONLY)
      // Allowed nights: Thu(4), Fri(5), Sat(6), Sun(0), Mon(1).
      // Disallowed: Tue(2), Wed(3).
      for (const dateStr of nights) {
        const d = new Date(dateStr + "T00:00:00");
        const day = d.getDay();
        if (day === 2 || day === 3) { // Tue, Wed
          return { valido: false, mensaje: "El plan Festivo está diseñado para fines de semana largos (Jueves a Lunes)." };
        }
      }
      break;

    case "plan-familia":
      if (personas > 5) return { valido: false, mensaje: "El Plan Familia es válido solo para máximo 5 personas." };
      const duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      if (duration !== 1) return { valido: false, mensaje: "El Plan Familia es para exactamente 1 noche." };
      if (holidays.length > 0) return { valido: false, mensaje: "El Plan Familia no aplica en festivos." };
      break;
  }

  return { valido: true, mensaje: "" };
}

// Obtener precio de hora adicional según número de personas
export function obtenerPrecioHoraAdicional(personas: number): number {
  if (personas <= 10) return HORA_ADICIONAL.hasta10;
  if (personas <= 30) return HORA_ADICIONAL.de11a30;
  return HORA_ADICIONAL.mas31;
}
