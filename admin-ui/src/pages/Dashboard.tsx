
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { LogOut, LayoutDashboard, MessageSquare, Quote, FileText, Plus, X, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingsTable from '../components/BookingsTable';
import ContentMessages from './ContentMessages';
import ContentTestimonials from './ContentTestimonials';
import ContentBlog from './ContentBlog';
import { useState } from 'react';
import ManualBookingForm from '../components/ManualBookingForm';

interface Booking {
    id: number;
    guest_name: string;
    guest_email: string;
    check_in: string;
    check_out: string;
    status: string;
    guest_count: number;
    property_id: number;
    is_override: boolean;
    override_reason?: string;
}

export default function Dashboard() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'bookings' | 'messages' | 'testimonials' | 'blog'>('bookings');
    const [showManualModal, setShowManualModal] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: bookings, isLoading, error } = useQuery<Booking[]>({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await api.get('/admin/bookings');
            return res.data;
        },
        enabled: activeTab === 'bookings'
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const renderContent = () => {
        if (isLoading && activeTab === 'bookings') {
            return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
        }
        if (error && activeTab === 'bookings') {
            return <div className="p-8 text-red-500 bg-red-50 rounded-lg">Error loading data. Please login again.</div>;
        }

        switch (activeTab) {
            case 'bookings':
                return <BookingsTable bookings={bookings || []} />;
            case 'messages':
                return <ContentMessages />;
            case 'testimonials':
                return <ContentTestimonials />;
            case 'blog':
                return <ContentBlog />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <nav className="bg-white shadow z-10 sticky top-0">
                <div className="flex items-center justify-between px-4 md:px-6 py-4 mx-auto max-w-7xl w-full">
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-2">
                            <button className="md:hidden text-gray-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                <Menu size={24} />
                            </button>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer" onClick={() => setActiveTab('bookings')}>
                                Villa Roli Admin
                            </h1>
                        </div>

                        <div className="hidden md:flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                                <LayoutDashboard size={18} />
                                Reservas
                            </button>
                            <button onClick={() => setActiveTab('messages')} className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'messages' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                                <MessageSquare size={18} />
                                Mensajes
                            </button>
                            <button onClick={() => setActiveTab('testimonials')} className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'testimonials' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                                <Quote size={18} />
                                Testimonios
                            </button>
                            <button onClick={() => setActiveTab('blog')} className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'blog' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                                <FileText size={18} />
                                Blog
                            </button>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium text-sm">
                        <LogOut size={18} />
                        <span className="hidden md:inline">Salir</span>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t px-4 py-2 space-y-1">
                        <button onClick={() => { setActiveTab('bookings'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}>Reservas</button>
                        <button onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'messages' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}>Mensajes</button>
                        <button onClick={() => { setActiveTab('testimonials'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'testimonials' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}>Testimonios</button>
                        <button onClick={() => { setActiveTab('blog'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'blog' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`}>Blog</button>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 px-4 md:px-6 py-8 mx-auto max-w-7xl w-full">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {activeTab === 'bookings' && 'Reservas'}
                            {activeTab === 'messages' && 'Mensajes Recibidos'}
                            {activeTab === 'testimonials' && 'Moderación de Opiniones'}
                            {activeTab === 'blog' && 'Gestión del Blog'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {activeTab === 'bookings' && 'Gestiona y supervisa todas las reservas desde aquí.'}
                            {activeTab === 'messages' && 'Bandeja de entrada de formulario de contacto.'}
                            {activeTab === 'testimonials' && 'Aprueba o rechaza testimonios de clientes.'}
                            {activeTab === 'blog' && 'Crea y edita artículos del blog.'}
                        </p>
                    </div>

                    {activeTab === 'bookings' && (
                        <button
                            onClick={() => setShowManualModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={20} /> <span className="hidden md:inline">Nueva Reserva</span><span className="md:hidden">Nueva</span>
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                    {renderContent()}
                </div>
            </main>

            {/* Manual Booking Modal */}
            {showManualModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold">Crear Reserva Manual</h3>
                            <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <ManualBookingForm onSuccess={() => setShowManualModal(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
