import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, BookOpen, Menu, X, LogOut, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { BRAND_CONFIG } from '../../lib/constants';

export const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Panel de Control', icon: <LayoutDashboard size={20} /> },
        { path: '/messages', label: 'Mensajes', icon: <Mail size={20} /> },
        { path: '/testimonials', label: 'Testimonios', icon: <MessageSquare size={20} /> },
        { path: '/blog', label: 'Blog', icon: <BookOpen size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Brand Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                                <img
                                    src={BRAND_CONFIG.logo}
                                    alt={BRAND_CONFIG.alt}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">{BRAND_CONFIG.name}</h2>
                            <p className="text-xs text-gray-500">Admin Panel</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-orange-50 text-orange-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                    `}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                            onClick={logout}
                        >
                            <LogOut size={18} className="mr-2" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="bg-white border-b border-gray-200 lg:hidden px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <X /> : <Menu />}
                        </Button>
                        <span className="font-bold text-gray-900">{BRAND_CONFIG.name}</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
