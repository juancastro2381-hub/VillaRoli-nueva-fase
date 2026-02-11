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

// Helper: Get dates between range
const getDatesInRange = (startStr: string, endStr: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startStr);
  const end = new Date(endStr);
  // Normalize to UTC/No Time
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Logic: Iterate until < end (exclusive for nights logic check, but let's be careful)
  // Backend logic yields [start, end).
  // Frontend logic usually needs to check the NIGHTS. Use same logic as backend.
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

export function validarReglasNegocio(
  tipo: TipoReserva,
  personas: number,
  checkin: string,
  checkout: string
): ValidationResult {
  if (!checkin || !checkout || !tipo || !personas) return { valido: true, mensaje: "" };

  const start = new Date(checkin + "T00:00:00"); // Force local date interpretation
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
    return { valido: true, mensaje: "" }; // Pasadía valid
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
        const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        // Allowed: Mon(1), Tue(2), Wed(3), Thu(4)
        if (day === 0 || day === 5 || day === 6) {
          return { valido: false, mensaje: "Este plan solo se puede reservar de lunes a jueves." };
        }
      }
      break;

    case "noches-fin-semana": // Fri, Sat. No Holidays.
      if (personas < 10) return { valido: false, mensaje: "Se requiere un mínimo de 10 personas para este plan." };
      if (holidays.length > 0) return { valido: false, mensaje: "Este plan no está permitido en fechas festivas." };

      for (const dateStr of nights) {
        const d = new Date(dateStr + "T00:00:00");
        const day = d.getDay();
        // Allowed: Fri(5), Sat(6)
        // If Sunday night (0) is included, it's usually weird for "weekend standard" unless checking out Monday.
        // Backend says: Allowed nights must be Fri(4 in Python? No 4=Fri) or Sat.
        // JS: 5=Fri, 6=Sat.
        if (day !== 5 && day !== 6) {
          return { valido: false, mensaje: "El plan Fin de Semana Estándar requiere noches de viernes o sábado." };
        }
      }
      break;

    case "noches-festivo": // Weekend + Holiday
      if (personas < 10) return { valido: false, mensaje: "Se requiere un mínimo de 10 personas para este plan." };

      // Must include a holiday OR end on a holiday monday
      const hasHolidayNight = holidays.length > 0;
      const checkoutDate = new Date(checkout + "T00:00:00");
      const checkoutIsHolidayMonday = (checkoutDate.getDay() === 1 && HOLIDAYS_2026.includes(checkout));

      if (!hasHolidayNight && !checkoutIsHolidayMonday) {
        return { valido: false, mensaje: "Este plan requiere un fin de semana con festivo." };
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
