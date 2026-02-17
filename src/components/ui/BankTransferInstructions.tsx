import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, CreditCard, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BankAccount {
    bank: string;
    accountNumber: string;
    accountType: string;
    holderName: string;
    holderIdType: string;

    holderId: string;
}

interface BankTransferInstructionsProps {
    amount: number;
    currency?: string;
    bookingId: number;
    paymentId: number;
}

const BANK_ACCOUNTS: BankAccount[] = [
    {
        bank: 'Bancolombia',
        accountNumber: '12345678901',
        accountType: 'Ahorros',
        holderName: 'Villa Roli SAS',
        holderIdType: 'NIT',
        holderId: '900.123.456-7',
    },
    {
        bank: 'Nequi',
        accountNumber: '3001234567',
        accountType: 'Nequi',
        holderName: 'Villa Roli',
        holderIdType: 'Celular',
        holderId: '300-123-4567',
    },
    {
        bank: 'Daviplata',
        accountNumber: '3009876543',
        accountType: 'Daviplata',
        holderName: 'Villa Roli',
        holderIdType: 'Celular',
        holderId: '300-987-6543',
    },
];

export function BankTransferInstructions({
    amount,
    currency = 'COP',
    bookingId,
    paymentId,
}: BankTransferInstructionsProps) {
    const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set());
    const { toast } = useToast();

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedFields(prev => new Set(prev).add(fieldName));

            toast({
                title: '¡Copiado!',
                description: `${fieldName} copiado al portapapeles`,
                duration: 2000,
            });

            // Remove from copied set after 2 seconds
            setTimeout(() => {
                setCopiedFields(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(fieldName);
                    return newSet;
                });
            }, 2000);
        } catch (err) {
            toast({
                title: 'Error',
                description: 'No se pudo copiar al portapapeles',
                variant: 'destructive',
            });
        }
    };

    const formatAmount = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(value);
    };

    const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => {
        const isCopied = copiedFields.has(fieldName);

        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(text, fieldName)}
                className="ml-2"
            >
                {isCopied ? (
                    <>
                        <Check className="h-4 w-4 mr-1 text-green-600" />
                        Copiado
                    </>
                ) : (
                    <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                    </>
                )}
            </Button>
        );
    };

    return (
        <div className="space-y-6">
            {/* Instructions Header */}
            <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription className="ml-6">
                    <strong className="block mb-2">Pasos para completar tu pago:</strong>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Ingresa a tu aplicación bancaria (Bancolombia, Nequi o Daviplata)</li>
                        <li>Selecciona "Transferir dinero" o "Enviar dinero"</li>
                        <li>Usa una de las cuentas disponibles abajo</li>
                        <li>Ingresa el monto exacto: <strong>{formatAmount(amount)}</strong></li>
                        <li>Completa la transferencia y guarda el comprobante</li>
                        <li>Sube el comprobante más abajo para verificación</li>
                    </ol>
                </AlertDescription>
            </Alert>

            {/* Payment Info Card */}
            <Card className="border-2 border-primary">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Información de Pago
                    </CardTitle>
                    <CardDescription>
                        Usa esta información en tu transferencia
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Monto a Transferir
                            </label>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-2xl font-bold text-primary">
                                    {formatAmount(amount)}
                                </span>
                                <CopyButton text={amount.toString()} fieldName="Monto" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Referencia
                            </label>
                            <div className="flex items-center justify-between mt-1">
                                <code className="text-lg font-mono bg-muted px-2 py-1 rounded">
                                    RES-{bookingId}
                                </code>
                                <CopyButton text={`RES-${bookingId}`} fieldName="Referencia" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Incluye esta referencia en tu transferencia
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bank Accounts */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Cuentas Disponibles
                </h3>
                <p className="text-sm text-muted-foreground">
                    Selecciona la opción que prefieras para realizar tu transferencia
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {BANK_ACCOUNTS.map((account, index) => (
                        <Card key={index} className="hover:border-primary transition-colors" role="article" aria-label={`Cuenta ${account.bank}`}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm md:text-base">{account.bank}</CardTitle>
                                    <Badge variant={account.bank === 'Bancolombia' ? 'default' : 'secondary'} aria-label={`Tipo de cuenta: ${account.accountType}`}>
                                        {account.accountType}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Número de Cuenta
                                    </label>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="font-mono text-sm font-semibold">
                                            {account.accountNumber}
                                        </span>
                                        <CopyButton
                                            text={account.accountNumber}
                                            fieldName={`Cuenta ${account.bank}`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Titular
                                    </label>
                                    <p className="text-sm font-medium mt-1">{account.holderName}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        {account.holderIdType}
                                    </label>
                                    <p className="text-sm mt-1">{account.holderId}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Important Notes */}
            <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertDescription>
                    <strong>Importante:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>El monto debe ser exacto: {formatAmount(amount)}</li>
                        <li>Incluye la referencia RES-{bookingId} para procesamiento rápido</li>
                        <li>Guarda el comprobante (captura de pantalla o PDF)</li>
                        <li>Sube el comprobante abajo para que podamos verificar tu pago</li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
    );
}
