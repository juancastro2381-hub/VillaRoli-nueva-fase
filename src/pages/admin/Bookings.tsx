import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Booking {
    id: number;
    guest_name: string;
    check_in: string;
    check_out: string;
    status: string;
    payment_type: string;
    payment_status?: string;
}

const AdminBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("token"); // Assuming auth stores it here
            const res = await fetch("http://localhost:8000/admin/bookings", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            } else {
                toast({ title: "Error", description: "Failed to load bookings" });
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Layout>
            <div className="container-custom py-10">
                <h1 className="text-3xl font-bold mb-6">Administración de Reservas</h1>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Huésped</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Pago</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((b) => (
                                <TableRow key={b.id}>
                                    <TableCell>#{b.id}</TableCell>
                                    <TableCell>{b.guest_name}</TableCell>
                                    <TableCell>{b.check_in} - {b.check_out}</TableCell>
                                    <TableCell>
                                        <Badge variant={b.status === "CONFIRMED" ? "default" : "secondary"}>
                                            {b.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{b.payment_type}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">Ver</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Layout>
    );
};

export default AdminBookings;
