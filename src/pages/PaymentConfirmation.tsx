import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    PaymentStatusBanner,
    type PaymentStatus,
    type PaymentMethod
} from '@/components/ui/PaymentStatusBanner';
import { BankTransferInstructions } from '@/components/ui/BankTransferInstructions';
import { EvidenceUpload } from '@/components/ui/EvidenceUpload';
import {
    ArrowLeft,
    Phone,
    Mail,
    HelpCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentData {
    payment_id: number;
    booking_id: number;
    status: PaymentStatus;
    payment_method: PaymentMethod;
    amount: number;
    currency: string;
    expires_at: string | null;
    evidence_url: string | null;
    evidence_uploaded_at: string | null;
    created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function PaymentConfirmation() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pollingInterval, setPollingInterval] = useState<number | null>(null);

    const bookingId = searchParams.get('booking_id');
    const paymentId = searchParams.get('payment_id');

    // Fetch payment data
    const fetchPaymentData = async () => {
        if (!paymentId) {
            setError('ID de pago no especificado');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/status`);

            if (!response.ok) {
                throw new Error('No se pudo cargar la información del pago');
            }

            const data = await response.json();
            setPaymentData(data);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchPaymentData();
    }, [paymentId]);

    // Poll for status updates after evidence upload
    useEffect(() => {
        if (paymentData?.status === 'AWAITING_CONFIRMATION' && paymentData.evidence_url) {
            // Poll every 10 seconds
            const interval = window.setInterval(() => {
                fetchPaymentData();
            }, 10000);

            setPollingInterval(interval);

            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        }
    }, [paymentData?.status, paymentData?.evidence_url]);

    // Stop polling when payment is confirmed
    useEffect(() => {
        if (paymentData?.status === 'PAID' || paymentData?.status === 'CONFIRMED') {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
            }

            // Show success notification
            toast({
                title: '¡Pago Confirmado!',
                description: 'Tu reserva ha sido confirmada exitosamente.',
                duration: 5000,
            });
        }
    }, [paymentData?.status]);

    const handleEvidenceUploadSuccess = (evidenceUrl: string) => {
        // Refresh payment data to reflect new status
        fetchPaymentData();
    };

    const shouldShowBankInstructions =
        paymentData?.payment_method === 'BANK_TRANSFER' &&
        paymentData?.status === 'PENDING_PAYMENT';

    const shouldShowEvidenceUpload =
        paymentData?.payment_method === 'BANK_TRANSFER' &&
        (paymentData?.status === 'PENDING_PAYMENT' || paymentData?.status === 'AWAITING_CONFIRMATION') &&
        !paymentData?.evidence_url;

    const showNextSteps =
        paymentData?.status !== 'EXPIRED' &&
        paymentData?.status !== 'FAILED';

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-muted-foreground">Cargando información del pago...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !paymentData) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <Alert variant="destructive">
                    <AlertDescription>
                        {error || 'No se encontró información del pago'}
                    </AlertDescription>
                </Alert>
                <Button
                    onClick={() => navigate('/')}
                    className="mt-4"
                    variant="outline"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Inicio
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 md:py-8" role="main" aria-label="Página de confirmación de pago">
            <div className="container max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-4 md:mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="mb-4"
                        aria-label="Volver a la página principal"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                        Volver al Inicio
                    </Button>

                    <h1 className="text-2xl md:text-3xl font-bold">Confirmación de Pago</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Reserva #{paymentData.booking_id}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Payment Status Banner */}
                    <PaymentStatusBanner
                        expiresAt={paymentData.expires_at}
                        status={paymentData.status}
                        paymentMethod={paymentData.payment_method}
                        evidenceUploaded={!!paymentData.evidence_url}
                    />

                    {/* Bank Transfer Instructions */}
                    {shouldShowBankInstructions && (
                        <BankTransferInstructions
                            amount={paymentData.amount}
                            currency={paymentData.currency}
                            bookingId={paymentData.booking_id}
                            paymentId={paymentData.payment_id}
                        />
                    )}

                    {/* Evidence Upload */}
                    {shouldShowEvidenceUpload && (
                        <>
                            <Separator />
                            <EvidenceUpload
                                paymentId={paymentData.payment_id}
                                onUploadSuccess={handleEvidenceUploadSuccess}
                            />
                        </>
                    )}

                    {/* Confirmation Success */}
                    {(paymentData.status === 'PAID' || paymentData.status === 'CONFIRMED') && (
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="py-8">
                                <div className="text-center space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-green-900">
                                            ¡Pago Confirmado!
                                        </h2>
                                        <p className="text-green-800 mt-2">
                                            Tu reserva está activa. Recibirás un email de confirmación con todos los detalles.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => navigate('/')}
                                        size="lg"
                                    >
                                        Ver Mi Reserva
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Next Steps */}
                    {showNextSteps && (
                        <Card>
                            <CardContent className="py-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    ¿Qué Sigue?
                                </h3>

                                {paymentData.status === 'PENDING_PAYMENT' && (
                                    <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>Completa la transferencia bancaria usando los datos arriba</li>
                                        <li>Sube el comprobante de pago en la sección de abajo</li>
                                        <li>Nuestro equipo verificará tu pago (usualmente en 2-24 horas)</li>
                                        <li>Recibirás un email cuando tu pago sea confirmado</li>
                                    </ol>
                                )}

                                {paymentData.status === 'AWAITING_CONFIRMATION' && (
                                    <div className="space-y-2 text-sm">
                                        <p>✓ Comprobante recibido</p>
                                        <p>⏳ Nuestro equipo está verificando tu pago</p>
                                        <p>📧 Te notificaremos por email cuando sea confirmado</p>
                                        <p className="text-muted-foreground mt-4">
                                            Tiempo de verificación: 2-24 horas (usualmente mucho más rápido)
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Contact Support */}
                    <Card>
                        <CardContent className="py-6">
                            <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                                <HelpCircle className="h-5 w-5" aria-hidden="true" />
                                ¿Necesitas Ayuda?
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center" aria-hidden="true">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">WhatsApp</p>
                                        <a
                                            href="https://wa.me/573001234567"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            +57 300 123 4567
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <a
                                            href="mailto:reservas@villaroli.com"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            reservas@villaroli.com
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <Alert className="mt-4">
                                <AlertDescription className="text-sm">
                                    Si tienes alguna pregunta sobre tu pago o reserva, incluye tu
                                    número de reserva <strong>#{paymentData.booking_id}</strong> en tu mensaje.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
