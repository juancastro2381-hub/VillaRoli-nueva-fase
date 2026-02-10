import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Booking {
    id: number;
    property_id: number;
    check_in: string;
    check_out: string;
    status: string;
    guest_count: number;
}

export default function Dashboard() {
    const navigate = useNavigate();

    const { data: bookings, isLoading, error } = useQuery<Booking[]>({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await api.get('/admin/bookings');
            return res.data;
        }
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">Error loading bookings</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>Admin Dashboard</h1>
                        <div className="flex gap-4 text-sm font-medium text-gray-600">
                            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-blue-600">Bookings</span>
                            <span onClick={() => navigate('/messages')} className="cursor-pointer hover:text-blue-600">Mensajes</span>
                            <span onClick={() => navigate('/testimonials')} className="cursor-pointer hover:text-blue-600">Testimonios</span>
                            <span onClick={() => navigate('/blog')} className="cursor-pointer hover:text-blue-600">Blog</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-500">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </nav>

            <main className="px-4 py-8 mx-auto max-w-7xl">
                <div className="bg-white rounded shadow">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">Recent Bookings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 border-b">ID</th>
                                    <th className="p-3 border-b">Dates</th>
                                    <th className="p-3 border-b">Guests</th>
                                    <th className="p-3 border-b">Status</th>
                                    <th className="p-3 border-b">Property</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings?.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="p-3 border-b">#{booking.id}</td>
                                        <td className="p-3 border-b">
                                            {booking.check_in} → {booking.check_out}
                                        </td>
                                        <td className="p-3 border-b">{booking.guest_count}</td>
                                        <td className="p-3 border-b">
                                            <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="p-3 border-b">Cabin {booking.property_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
