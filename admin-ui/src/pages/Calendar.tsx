import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../components/ui/badge";

interface Booking {
    id: number;
    guest_name: string;
    check_in: string;
    check_out: string;
    status: string;
}

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            // Fetch generous limit of bookings to cover the month.
            // Ideally backend should support date range filtering.
            // Using existing list endpoint for now.
            const res = await api.get("/admin/bookings", {
                params: {
                    limit: 100,
                    status: 'CONFIRMED' // Only show confirmed for occupancy
                }
            });
            setBookings(res.data);
        } catch (e) {
            console.error("Error fetching bookings for calendar:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isBooked = (date: Date) => {
        // Simple check if date falls within any booking range
        // Note: Check-in is occupied from 3PM, Check-out is occupied until 11AM.
        // For visual simplicity, we mark full days if clearly inside.
        // Better logic: standard overlapping check.

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        return bookings.filter(b => {
            // Parse dates (assuming YYYY-MM-DD string from API)
            // API returns YYYY-MM-DD usually.
            // We need to be careful with timezones.
            // Let's treat strings as local dates by splitting.
            const [inY, inM, inD] = b.check_in.split('-').map(Number);
            const [outY, outM, outD] = b.check_out.split('-').map(Number);

            const start = new Date(inY, inM - 1, inD);
            const end = new Date(outY, outM - 1, outD);

            return dayStart >= start && dayStart < end; // < end because checkout day is usually free for next guest
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendario de Ocupación</h1>
                    <p className="text-muted-foreground">Vista mensual de disponibilidad.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[150px] text-center font-medium capitalize">{monthName}</span>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1 md:gap-2 text-center">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                <div key={day} className="font-bold text-gray-500 pb-2">{day}</div>
                            ))}

                            {/* Empty cells for start of month */}
                            {Array.from({ length: days[0].getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-24 bg-gray-50/50 rounded-lg"></div>
                            ))}

                            {days.map(date => {
                                const dailyBookings = isBooked(date);
                                const isToday = date.toDateString() === new Date().toDateString();

                                return (
                                    <div
                                        key={date.toISOString()}
                                        className={`h-24 border rounded-lg p-1 flex flex-col justify-start items-start relative hover:shadow-md transition-shadow
                                            ${isToday ? 'border-primary ring-1 ring-primary' : 'border-gray-100 bg-white'}
                                        `}
                                    >
                                        <span className={`text-xs ml-1 mt-1 font-medium ${isToday ? 'text-primary' : 'text-gray-400'}`}>
                                            {date.getDate()}
                                        </span>

                                        <div className="w-full mt-1 space-y-1 overflow-y-auto max-h-[70px] no-scrollbar">
                                            {dailyBookings.map(b => (
                                                <div
                                                    key={b.id}
                                                    className="text-[10px] bg-indigo-100 text-indigo-700 p-1 rounded leading-tight truncate w-full text-left"
                                                    title={`#${b.id} ${b.guest_name}`}
                                                >
                                                    {b.guest_name.split(' ')[0]}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
