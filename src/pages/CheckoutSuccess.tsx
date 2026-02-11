
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Home, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const bookingId = searchParams.get("booking_id");

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-card p-8 rounded-2xl border border-gold/20 shadow-xl text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>

                    <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                        ¡Pago Exitoso!
                    </h1>

                    <p className="text-muted-foreground mb-6">
                        Tu reserva ha sido confirmada correctamente. Hemos enviado los detalles a tu correo electrónico.
                    </p>

                    {bookingId && (
                        <div className="bg-secondary/50 p-4 rounded-lg mb-8 inline-block">
                            <p className="text-sm font-semibold text-gold">Reserva #{bookingId}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate("/")}
                            className="w-full gap-2"
                            size="lg"
                        >
                            <Home size={18} />
                            Volver al Inicio
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate("/reservas")}
                            className="w-full gap-2 border-border hover:bg-secondary"
                        >
                            <Calendar size={18} />
                            Hacer otra reserva
                        </Button>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default CheckoutSuccess;
