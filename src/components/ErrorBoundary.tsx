import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Algo salió mal
                        </h1>

                        <p className="text-gray-600 mb-6">
                            Ocurrió un error inesperado al cargar la aplicación. Por favor recarga la página.
                        </p>

                        <div className="bg-gray-100 p-4 rounded text-left text-xs text-gray-500 font-mono mb-6 overflow-auto max-h-32">
                            {this.state.error?.message}
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full gap-2"
                        >
                            <RefreshCw size={18} />
                            Recargar Página
                        </Button>

                        <div className="mt-4">
                            <a href="/" className="text-sm text-blue-600 hover:underline">
                                Volver al Inicio
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
