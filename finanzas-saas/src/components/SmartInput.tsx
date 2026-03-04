"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";

export function SmartInput({ onTransactionAdded }: { onTransactionAdded: () => void }) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text) return;

        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const res = await fetch("/api/transactions/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texto: text }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al procesar el movimiento.");
            }

            setStatus({ type: "success", message: `¡Movimiento clasificado como ${data.data.categoria}!` });
            setText("");
            onTransactionAdded();
        } catch (err: any) {
            setStatus({ type: "error", message: err.message });
        } finally {
            setLoading(false);

            // Clear status after 3 seconds
            setTimeout(() => {
                setStatus({ type: "", message: "" });
            }, 3000);
        }
    };

    return (
        <div className="glass rounded-2xl p-6 border border-border relative overflow-hidden group">
            {/* Background glow effect following hover would be here conceptually, keeping it simple for now */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 transition duration-1000 blur" />

            <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Registro Inteligente</h2>
                </div>

                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                        placeholder='Ej: "25000 Almuerzo con compañeros" o "+200000 Pago cliente"'
                        className="w-full bg-muted border border-border rounded-xl py-4 pl-4 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    />
                    <button
                        type="submit"
                        disabled={loading || !text}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-primary hover:brightness-110 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>

                {/* Amount Preview Overlay */}
                {text && (
                    <div className="mt-2 flex items-center gap-2">
                        {(() => {
                            const match = text.match(/-?\d+/);
                            if (match) {
                                const amount = parseInt(match[0]);
                                return (
                                    <span className="text-[10px] font-medium text-muted-foreground bg-foreground/5 px-2 py-1 rounded-md">
                                        Detectado: <span className="text-primary font-bold">${amount.toLocaleString('es-CO')}</span>
                                    </span>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}

                {status.message && (
                    <div className={`mt-3 text-sm font-medium animate-fade-in flex items-center gap-2 ${status.type === "success" ? "text-emerald-500" : "text-red-500"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}
