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
        <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
            {/* Background glow effect following hover would be here conceptually, keeping it simple for now */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-1000 blur" />

            <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-semibold tracking-tight">Registro Inteligente</h2>
                </div>

                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={loading}
                        placeholder='Ej: "25000 Almuerzo con compañeros" o "+200000 Pago cliente"'
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                    <button
                        type="submit"
                        disabled={loading || !text}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>

                {status.message && (
                    <div className={`mt-3 text-sm font-medium animate-fade-in flex items-center gap-2 ${status.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}
