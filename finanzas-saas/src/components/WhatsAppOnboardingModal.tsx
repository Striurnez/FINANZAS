"use client";

import { useState, useEffect } from "react";
import {
    MessageSquare,
    Sparkles,
    Zap,
    Smartphone,
    X,
    ArrowRight,
    CheckCircle2
} from "lucide-react";

interface WhatsAppOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WhatsAppOnboardingModal({ isOpen, onClose }: WhatsAppOnboardingModalProps) {
    const [step, setStep] = useState(1);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const handleComplete = async () => {
        try {
            await fetch("/api/user/wa-onboarding", { method: "PATCH" });
            onClose();
        } catch (error) {
            console.error("Error updating onboarding status:", error);
            onClose();
        }
    };

    const whatsappLink = `https://wa.me/14155238886?text=join%20tropical-giant`;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content */}
            <div className={`relative w-full max-w-lg glass border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                <div className="p-8 md:p-10 pt-12">
                    {step === 1 ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center relative">
                                    <MessageSquare className="w-10 h-10 text-emerald-500" />
                                    <div className="absolute -top-2 -right-2 bg-primary p-1.5 rounded-full shadow-lg">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tighter text-foreground">Tu Asistente de WhatsApp</h2>
                                    <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                                        Activa el bot y registra tus finanzas en segundos, sin complicaciones.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <FeatureItem
                                    icon={<Zap className="w-5 h-5 text-amber-400" />}
                                    title="Registro Instantáneo"
                                    desc="Solo envía '20k café' y la IA hará el resto por ti."
                                />
                                <FeatureItem
                                    icon={<Smartphone className="w-5 h-5 text-blue-400" />}
                                    title="Monitoreo 24/7"
                                    desc="Lleva el control de tus gastos estés donde estés."
                                />
                                <FeatureItem
                                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                    title="Sincronización Total"
                                    desc="Todo lo que registres aparecerá en tu dashboard al momento."
                                />
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 group"
                            >
                                ¡Quiero activarlo!
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl font-black tracking-tighter text-foreground">Último Paso 🚀</h2>
                                <p className="text-muted-foreground text-sm">
                                    Al hacer clic abajo, se abrirá tu WhatsApp. Solo tienes que enviar el mensaje pre-llenado para activar el bot de prueba.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xs shadow-inner">1</div>
                                    <p className="text-sm text-gray-300 font-medium">Haz clic en el botón verde.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xs shadow-inner">2</div>
                                    <p className="text-sm text-gray-300 font-medium">Envía el mensaje que aparecerá escrito.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 font-bold text-xs shadow-inner">3</div>
                                    <p className="text-sm text-gray-300 font-medium">¡Listo! Mi asistente te saludará.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleComplete}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 group"
                                >
                                    Abrir WhatsApp
                                    <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </a>
                                <button
                                    onClick={handleComplete}
                                    className="w-full py-4 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
                                >
                                    Quizás más tarde
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
            <div className="mt-1 p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                {icon}
            </div>
            <div className="space-y-0.5">
                <h4 className="font-bold text-foreground text-sm">{title}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
