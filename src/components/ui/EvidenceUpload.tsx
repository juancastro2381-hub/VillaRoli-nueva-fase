import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Upload,
    FileImage,
    X,
    CheckCircle2,
    AlertCircle,
    FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EvidenceUploadProps {
    paymentId: number;
    onUploadSuccess?: (evidenceUrl: string) => void;
    onUploadError?: (error: string) => void;
    maxSizeMB?: number;
    acceptedFormats?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function EvidenceUpload({
    paymentId,
    onUploadSuccess,
    onUploadError,
    maxSizeMB = 5,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
}: EvidenceUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploaded, setUploaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const { toast } = useToast();

    const validateFile = (file: File): string | null => {
        // Check file type
        if (!acceptedFormats.includes(file.type)) {
            return 'Formato no permitido. Usa JPG, PNG, WEBP o PDF.';
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            return `El archivo es muy grande. Máximo ${maxSizeMB}MB.`;
        }

        return null;
    };

    const handleFileChange = useCallback((selectedFile: File) => {
        setError(null);

        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            setFile(null);
            setPreview(null);
            return;
        }

        setFile(selectedFile);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null); // PDF doesn't need preview
        }
    }, [maxSizeMB]);

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    }, [handleFileChange]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/evidence`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al subir el archivo');
            }

            const data = await response.json();

            setUploadProgress(100);
            setUploaded(true);

            toast({
                title: '¡Comprobante enviado!',
                description: 'Tu comprobante se está verificando. Te notificaremos pronto.',
                duration: 5000,
            });

            if (onUploadSuccess) {
                onUploadSuccess(data.evidence_url);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);

            toast({
                title: 'Error al subir',
                description: errorMessage,
                variant: 'destructive',
            });

            if (onUploadError) {
                onUploadError(errorMessage);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setUploaded(false);
        setUploadProgress(0);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Subir Comprobante de Pago
                </CardTitle>
                <CardDescription>
                    Sube una captura de pantalla o PDF de tu transferencia
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!uploaded ? (
                    <>
                        {/* Drag and Drop Zone */}
                        {!file && (
                            <div
                                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${dragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                                    }
                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept={acceptedFormats.join(',')}
                                    onChange={handleInputChange}
                                />

                                <div className="space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Upload className="h-8 w-8 text-primary" />
                                    </div>

                                    <div>
                                        <p className="text-lg font-medium">
                                            Arrastra tu archivo aquí
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            o haz click para seleccionar
                                        </p>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        <p>Formatos: JPG, PNG, WEBP, PDF</p>
                                        <p>Tamaño máximo: {maxSizeMB}MB</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* File Preview */}
                        {file && !uploaded && (
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-start gap-4">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded border"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 bg-gray-100 rounded border flex items-center justify-center">
                                                <FileText className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium truncate">{file.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleRemove}
                                                    disabled={uploading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {uploading && (
                                                <div className="mt-4 space-y-2">
                                                    <Progress value={uploadProgress} />
                                                    <p className="text-xs text-muted-foreground">
                                                        Subiendo... {uploadProgress}%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="w-full"
                                    size="lg"
                                >
                                    {uploading ? (
                                        <>Subiendo...</>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Subir Comprobante
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </>
                ) : (
                    /* Success State */
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <AlertDescription className="ml-6">
                            <strong className="block text-green-900">¡Comprobante recibido!</strong>
                            <p className="text-sm text-green-800 mt-1">
                                Tu comprobante está siendo verificado por nuestro equipo.
                                Recibirás una notificación cuando tu pago sea confirmado.
                            </p>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Help Text */}
                <Alert>
                    <FileImage className="h-4 w-4" />
                    <AlertDescription className="ml-6">
                        <strong className="block mb-1">Consejos para una verificación rápida:</strong>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Asegúrate que se vea claramenté el monto transferido</li>
                            <li>Debe verse la fecha y hora de la transferencia</li>
                            <li>Incluye la referencia RES-{paymentId} si es posible</li>
                            <li>La imagen debe ser clara y legible</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}
