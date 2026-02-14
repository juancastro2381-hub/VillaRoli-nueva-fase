import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/token', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.data.access_token) {
                login(response.data.access_token);
                navigate('/');
            } else {
                throw new Error('No access token received');
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            setError('Credenciales inválidas');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-success-50 relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-pattern-dots bg-pattern-dots opacity-30"></div>

            {/* Gradient orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow delay-300"></div>

            {/* Login Card */}
            <div className="relative w-full max-w-md p-8 mx-4 animate-fade-in">
                <div className="glass rounded-2xl shadow-2xl p-8 space-y-6 border-2 border-white/20">
                    {/* Logo/Header */}
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4 transform hover:scale-110 transition-transform duration-300">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold gradient-text">Villa Roli</h1>
                        <p className="text-gray-600 font-medium">Panel de Administración</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-danger-50 border-2 border-danger-200 text-danger-700 rounded-lg text-sm font-medium animate-slide-down">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="email"
                                    required
                                    className="pl-10"
                                    placeholder="admin@villaroli.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="password"
                                    required
                                    className="pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="gradient-primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            {!isLoading && <LogIn className="w-5 h-5" />}
                            Iniciar Sesión
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                        Sistema de gestión de reservas Villa Roli
                    </p>
                </div>
            </div>
        </div>
    );
}

