import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Download,
    ZoomIn,
    ZoomOut,
    User,
    Mail,
    Calendar,
    DollarSign,
    FileText,
    Building2,
} from 'lucide-react';
import { type PendingPayment } from '@/hooks/usePendingPayments';
import { PaymentActions } from './PaymentActions';

interface EvidencePreviewModalProps {
    payment: PendingPayment;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onReject: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function EvidencePreviewModal({
    payment,
    isOpen,
    onClose,
    onConfirm,
    onReject,
}: EvidencePreviewModalProps) {
    const [zoom, setZoom] = useState(100);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatAmount = (amount: number, currency: string = 'COP') => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', {
            dateStyle: 'long',
        }).format(date);
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 25, 50));
    };

    const handleDownload = () => {
        if (payment.evidence_url) {
            const url = normalizePath(payment.evidence_url);
            window.open(url, '_blank');
        }
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await onConfirm();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        setIsProcessing(true);
        try {
            await onReject();
        } finally {
            setIsProcessing(false);
        }
    };

    const normalizePath = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // Replace backslashes with forward slashes (fix for Windows paths)
        const cleanPath = path.replace(/\\/g, '/');
        // Remove leading ./ or /
        const relativePath = cleanPath.replace(/^(\.\/|\/)/, '');
        return `${API_BASE_URL}/${relativePath}`;
    };

    const evidenceUrl = payment.evidence_url ? normalizePath(payment.evidence_url) : null;

    const isPDF = payment.evidence_url?.toLowerCase().endsWith('.pdf');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Revisión de Pago #{payment.payment_id}
                    </DialogTitle>
                    <DialogDescription>
                        Verifica el comprobante de pago y aprueba o rechaza la transacción
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Evidence Preview - 2/3 width */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Zoom Controls */}
                        {evidenceUrl && !isPDF && (
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Comprobante</h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleZoomOut}
                                        disabled={zoom <= 50}
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground w-16 text-center">
                                        {zoom}%
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleZoomIn}
                                        disabled={zoom >= 200}
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleDownload}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Descargar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Evidence Display */}
                        <div className="border rounded-lg overflow-hidden bg-gray-50">
                            {evidenceUrl ? (
                                isPDF ? (
                                    <div className="p-8 text-center">
                                        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Archivo PDF adjunto
                                        </p>
                                        <Button onClick={handleDownload}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Abrir PDF
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="overflow-auto max-h-[500px] flex items-center justify-center p-4">
                                        <img
                                            src={evidenceUrl}
                                            alt="Comprobante de pago"
                                            className="max-w-full h-auto"
                                            style={{ transform: `scale(${zoom / 100})` }}
                                        />
                                    </div>
                                )
                            ) : (
                                <div className="p-12 text-center">
                                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-muted-foreground">
                                        No hay comprobante disponible
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Details - 1/3 width */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Detalles del Pago
                            </h3>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <label className="text-muted-foreground block mb-1">
                                        Monto
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                        <span className="font-bold text-lg">
                                            {formatAmount(payment.amount, payment.currency)}
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <label className="text-muted-foreground block mb-1">
                                        Método de Pago
                                    </label>
                                    <Badge>
                                        {payment.payment_method === 'BANK_TRANSFER'
                                            ? 'Transferencia Bancaria'
                                            : 'Acuerdo Directo'}
                                    </Badge>
                                </div>

                                <div>
                                    <label className="text-muted-foreground block mb-1">
                                        Estado Actual
                                    </label>
                                    <Badge variant="outline" className="bg-yellow-50">
                                        En Verificación
                                    </Badge>
                                </div>

                                {payment.evidence_uploaded_at && (
                                    <div>
                                        <label className="text-muted-foreground block mb-1">
                                            Comprobante Subido
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDate(payment.evidence_uploaded_at)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Guest Details */}
                        {payment.booking && (
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Cliente
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div>
                                        <label className="text-muted-foreground block mb-1">
                                            Nombre
                                        </label>
                                        <p className="font-medium">{payment.booking.guest_name}</p>
                                    </div>

                                    <div>
                                        <label className="text-muted-foreground block mb-1">
                                            Email
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            <a
                                                href={`mailto:${payment.booking.guest_email}`}
                                                className="text-primary hover:underline"
                                            >
                                                {payment.booking.guest_email}
                                            </a>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-muted-foreground block mb-1">
                                            Reserva
                                        </label>
                                        <p>#{payment.booking_id}</p>
                                    </div>

                                    <div>
                                        <label className="text-muted-foreground block mb-1">
                                            Fechas
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{formatDate(payment.booking.check_in)}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <span>{formatDate(payment.booking.check_out)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Separator />

                        {/* Important Note */}
                        <Alert>
                            <AlertDescription className="text-xs">
                                <strong>Recuerda verificar:</strong>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Monto coincide exactamente</li>
                                    <li>Comprobante es legible</li>
                                    <li>Fecha de transferencia es reciente</li>
                                    <li>Referencia incluye ID de reserva</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>

                <DialogFooter>
                    <PaymentActions
                        paymentId={payment.payment_id}
                        bookingId={payment.booking_id}
                        onConfirm={handleConfirm}
                        onReject={handleReject}
                        isProcessing={isProcessing}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
