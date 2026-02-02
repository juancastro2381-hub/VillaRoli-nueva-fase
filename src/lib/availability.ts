// Sistema de disponibilidad - Datos mock que pueden conectarse a un backend
// Las fechas ocupadas se almacenan por tipo de reserva

export type AvailabilityType = "finca-completa" | "pasadia";

export interface OccupiedDate {
  date: string; // formato YYYY-MM-DD
  type: AvailabilityType;
  label?: string; // Ej: "Reservado", "Evento privado"
}

// Mock de fechas ocupadas (en producción esto vendría de una base de datos)
// Generamos algunas fechas de ejemplo
const generateMockOccupiedDates = (): OccupiedDate[] => {
  const today = new Date();
  const occupied: OccupiedDate[] = [];
  
  // Fechas ocupadas para finca completa (próximos 2 meses)
  const fincaOccupied = [3, 4, 10, 11, 17, 18, 24, 25, 31];
  const fincaOccupiedNext = [7, 8, 14, 15, 21, 22, 28];
  
  // Mes actual
  fincaOccupied.forEach(day => {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    if (date >= today) {
      occupied.push({
        date: date.toISOString().split('T')[0],
        type: "finca-completa",
        label: "Reservado"
      });
    }
  });
  
  // Mes siguiente
  fincaOccupiedNext.forEach(day => {
    const date = new Date(today.getFullYear(), today.getMonth() + 1, day);
    occupied.push({
      date: date.toISOString().split('T')[0],
      type: "finca-completa",
      label: "Reservado"
    });
  });
  
  // Fechas ocupadas para pasadía (diferentes días)
  const pasadiaOccupied = [5, 6, 12, 13, 19, 20, 26, 27];
  const pasadiaOccupiedNext = [2, 3, 9, 10, 16, 17, 23, 24];
  
  pasadiaOccupied.forEach(day => {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    if (date >= today) {
      occupied.push({
        date: date.toISOString().split('T')[0],
        type: "pasadia",
        label: "Completo"
      });
    }
  });
  
  pasadiaOccupiedNext.forEach(day => {
    const date = new Date(today.getFullYear(), today.getMonth() + 1, day);
    occupied.push({
      date: date.toISOString().split('T')[0],
      type: "pasadia",
      label: "Completo"
    });
  });
  
  return occupied;
};

export const MOCK_OCCUPIED_DATES = generateMockOccupiedDates();

// Función para verificar si una fecha está ocupada
export function isDateOccupied(date: Date, type: AvailabilityType): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return MOCK_OCCUPIED_DATES.some(
    occupied => occupied.date === dateStr && occupied.type === type
  );
}

// Función para obtener todas las fechas ocupadas de un tipo
export function getOccupiedDates(type: AvailabilityType): Date[] {
  return MOCK_OCCUPIED_DATES
    .filter(occupied => occupied.type === type)
    .map(occupied => new Date(occupied.date + 'T00:00:00'));
}

// Función para obtener la etiqueta de una fecha ocupada
export function getOccupiedLabel(date: Date, type: AvailabilityType): string | undefined {
  const dateStr = date.toISOString().split('T')[0];
  const found = MOCK_OCCUPIED_DATES.find(
    occupied => occupied.date === dateStr && occupied.type === type
  );
  return found?.label;
}
