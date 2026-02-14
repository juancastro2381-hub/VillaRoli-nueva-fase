// Frontend Calendar Service - Calls Backend Holiday API

export interface HolidayContext {
    has_holiday_in_window: boolean;
    holidays_in_window: string[];
    holidays_in_range: string[];
    window_start: string;
    window_end: string;
}

export async function fetchHolidayContext(checkIn: string, checkOut: string): Promise<HolidayContext | null> {
    try {
        const params = new URLSearchParams({
            check_in: checkIn,
            check_out: checkOut
        });

        const res = await fetch(`http://localhost:8000/api/v1/calendar/holidays?${params}`);

        if (res.ok) {
            const data = await res.json();
            return {
                has_holiday_in_window: data.has_holiday_in_window,
                holidays_in_window: data.holidays_in_window,
                holidays_in_range: data.holidays_in_range,
                window_start: data.window_start,
                window_end: data.window_end
            };
        }

        return null;
    } catch (err) {
        console.error("Failed to fetch holiday context", err);
        return null;
    }
}
