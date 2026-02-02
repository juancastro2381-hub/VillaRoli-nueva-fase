import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Sun, CalendarDays } from "lucide-react";
import { getOccupiedDates, type AvailabilityType } from "@/lib/availability";
import { es } from "date-fns/locale";

interface AvailabilityCalendarProps {
  className?: string;
  onDateSelect?: (date: Date | undefined, type: AvailabilityType) => void;
}

export function AvailabilityCalendar({ className, onDateSelect }: AvailabilityCalendarProps) {
  const [selectedType, setSelectedType] = useState<AvailabilityType>("finca-completa");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [month, setMonth] = useState<Date>(new Date());

  const occupiedDates = useMemo(() => {
    return getOccupiedDates(selectedType);
  }, [selectedType]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onDateSelect?.(date, selectedType);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type as AvailabilityType);
    setSelectedDate(undefined);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={cn("bg-card rounded-2xl p-6 border border-border", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Calendario de Disponibilidad
          </h3>
          <p className="text-sm text-muted-foreground">
            Consulta las fechas disponibles
          </p>
        </div>
      </div>

      <Tabs value={selectedType} onValueChange={handleTypeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="finca-completa" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Finca Completa</span>
            <span className="sm:hidden">Finca</span>
          </TabsTrigger>
          <TabsTrigger value="pasadia" className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Pasadía
          </TabsTrigger>
        </TabsList>

        <TabsContent value="finca-completa" className="mt-0">
          <CalendarView
            occupiedDates={occupiedDates}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
            month={month}
            onMonthChange={setMonth}
            today={today}
          />
          <CalendarLegend type="finca-completa" />
        </TabsContent>

        <TabsContent value="pasadia" className="mt-0">
          <CalendarView
            occupiedDates={occupiedDates}
            selectedDate={selectedDate}
            onSelect={handleDateSelect}
            month={month}
            onMonthChange={setMonth}
            today={today}
          />
          <CalendarLegend type="pasadia" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CalendarViewProps {
  occupiedDates: Date[];
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  month: Date;
  onMonthChange: (date: Date) => void;
  today: Date;
}

function CalendarView({ 
  occupiedDates, 
  selectedDate, 
  onSelect, 
  month, 
  onMonthChange,
  today 
}: CalendarViewProps) {
  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        month={month}
        onMonthChange={onMonthChange}
        locale={es}
        disabled={(date) => {
          // Deshabilitar fechas pasadas
          if (date < today) return true;
          // Deshabilitar fechas ocupadas
          return occupiedDates.some(
            occupied => 
              occupied.getFullYear() === date.getFullYear() &&
              occupied.getMonth() === date.getMonth() &&
              occupied.getDate() === date.getDate()
          );
        }}
        modifiers={{
          occupied: occupiedDates,
        }}
        modifiersClassNames={{
          occupied: "bg-destructive/20 text-destructive line-through hover:bg-destructive/30",
        }}
        className="rounded-md border-0 pointer-events-auto"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium capitalize",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] capitalize",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground font-semibold",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
}

interface CalendarLegendProps {
  type: AvailabilityType;
}

function CalendarLegend({ type }: CalendarLegendProps) {
  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-muted-foreground">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent" />
          <span className="text-muted-foreground">Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-destructive/20 line-through" />
          <span className="text-muted-foreground">
            {type === "finca-completa" ? "Reservado" : "Completo"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-card border border-border" />
          <span className="text-muted-foreground">Disponible</span>
        </div>
      </div>
    </div>
  );
}
