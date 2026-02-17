import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import {
    calculateCountdown,
    formatCountdownTime,
    getWarningLevel,
    getTimeRemainingMessage,
    type CountdownTime
} from '@/utils/formatCountdown';

export type PaymentStatus =
    | 'PENDING_PAYMENT'
    | 'AWAITING_CONFIRMATION'
    | 'PAID'
    | 'CONFIRMED'
    | 'EXPIRED'
    | 'FAILED';

export type PaymentMethod =
    | 'BANK_TRANSFER'
    | 'ONLINE_GATEWAY'
    | 'DIRECT_ADMIN_AGREEMENT';

interface PaymentStatusBannerProps {
    expiresAt: string | null;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    evidenceUploaded?: boolean;
}

export function PaymentStatusBanner({
    expiresAt,
    status,
    paymentMethod,
    evidenceUploaded = false,
}: PaymentStatusBannerProps) {
    const [countdown, setCountdown] = useState<CountdownTime>(() =>
        calculateCountdown(expiresAt)
    );

    // Update countdown every second
    useEffect(() => {
        if (status === 'EXPIRED' || status === 'PAID' || status === 'CONFIRMED') {
            return; // No countdown needed for final states
        }

        const interval = setInterval(() => {
            setCountdown(calculateCountdown(expiresAt));
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt, status]);

    // Determine banner variant and content based on status
    const getBannerConfig = () => {
        switch (status) {
            case 'CONFIRMED':
            case 'PAID':
                return {
                    variant: 'default' as const,
                    icon: CheckCircle2,
                    iconColor: 'text-green-600',
                    title: '¡Pago Confirmado!',
                    description: 'Tu reserva está activa y confirmada.',
                    bgColor: 'bg-green-50 border-green-200',
                };

            case 'EXPIRED':
                return {
                    variant: 'destructive' as const,
                    icon: XCircle,
                    iconColor: 'text-red-600',
                    title: 'Tiempo Agotado',
                    description: 'Esta reserva ha expirado. Por favor, crea una nueva reserva.',
                    bgColor: 'bg-red-50 border-red-200',
                };

            case 'FAILED':
                return {
                    variant: 'destructive' as const,
                    icon: XCircle,
                    iconColor: 'text-red-600',
                    title: 'Pago Rechazado',
                    description: 'Tu pago fue rechazado. Por favor contacta soporte.',
                    bgColor: 'bg-red-50 border-red-200',
                };

            case 'AWAITING_CONFIRMATION':
                return {
                    variant: 'default' as const,
                    icon: Clock,
                    iconColor: 'text-blue-600',
                    title: 'Comprobante Recibido',
                    description: evidenceUploaded
                        ? 'Tu comprobante está siendo verificado por nuestro equipo. Te notificaremos pronto.'
                        : 'En espera de verificación administrativa.',
                    bgColor: 'bg-blue-50 border-blue-200',
                };

            case 'PENDING_PAYMENT':
            default:
                const warningLevel = getWarningLevel(countdown.totalSeconds);
                return {
                    variant: warningLevel === 'danger' ? 'destructive' as const : 'default' as const,
                    icon: warningLevel === 'danger' ? AlertTriangle : Clock,
                    iconColor: warningLevel === 'safe'
                        ? 'text-green-600'
                        : warningLevel === 'warning'
                            ? 'text-yellow-600'
                            : 'text-red-600',
                    title: paymentMethod === 'BANK_TRANSFER'
                        ? 'Completa tu Transferencia Bancaria'
                        : 'Completa tu Pago',
                    description: `${getTimeRemainingMessage(countdown)} para completar el pago.`,
                    bgColor: warningLevel === 'safe'
                        ? 'bg-green-50 border-green-200'
                        : warningLevel === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-red-50 border-red-200',
                };
        }
    };

    const config = getBannerConfig();
    const Icon = config.icon;
    const showCountdown = status === 'PENDING_PAYMENT' && !countdown.isExpired;

    return (
        <Alert className={`${config.bgColor} border-2`} variant={config.variant}>
            <div className="flex items-start gap-4">
                <Icon className={`h-6 w-6 ${config.iconColor} mt-0.5`} />

                <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <AlertTitle className="text-lg font-semibold mb-0">
                            {config.title}
                        </AlertTitle>

                        {showCountdown && (
                            <Badge
                                variant={
                                    getWarningLevel(countdown.totalSeconds) === 'danger'
                                        ? 'destructive'
                                        : 'secondary'
                                }
                                className="font-mono text-base px-3 py-1"
                            >
                                <Clock className="h-4 w-4 mr-1" />
                                {formatCountdownTime(countdown)}
                            </Badge>
                        )}

                        {status === 'AWAITING_CONFIRMATION' && (
                            <Badge variant="outline" className="bg-blue-100">
                                En Verificación
                            </Badge>
                        )}

                        {status === 'CONFIRMED' && (
                            <Badge variant="outline" className="bg-green-100">
                                Confirmado
                            </Badge>
                        )}
                    </div>

                    <AlertDescription className="mt-2 text-sm">
                        {config.description}
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    );
}
