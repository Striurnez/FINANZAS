"use client";

import { useEffect, useState } from "react";
import {
    Zap,
    Calendar,
    Plus,
    Trash2,
    AlertCircle,
    Clock,
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    X
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PlaneacionPage() {
    const [recurring, setRecurring] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningAutomation, setRunningAutomation] = useState(false);

    // Forms
    const [showRecurringForm, setShowRecurringForm] = useState(false);
    const [newRecurring, setNewRecurring] = useState({
        name: "",
        amount: "",
        frequency: "monthly",
        nextDueDate: format(new Date(), "yyyy-MM-dd"),
        autoRegister: true,
        notify: true
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [recRes, ruleRes] = await Promise.all([
                fetch("/api/user/recurring-payments"),
                fetch("/api/user/financial-rules")
            ]);
            const [recJson, ruleJson] = await Promise.all([recRes.json(), ruleRes.json()]);
            if (recJson.success) setRecurring(recJson.data);
            if (ruleJson.success) setRules(ruleJson.data);
        } catch (error) {
            console.error("Error fetching planeacion data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddRecurring = async () => {
        if (!newRecurring.name || !newRecurring.amount) return;
        try {
            const res = await fetch("/api/user/recurring-payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRecurring)
            });
            if (res.ok) {
                setShowRecurringForm(false);
                setNewRecurring({
                    name: "",
                    amount: "",
                    frequency: "monthly",
                    nextDueDate: format(new Date(), "yyyy-MM-dd"),
                    autoRegister: true,
                    notify: true
                });
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteRecurring = async (id: string) => {
        try {
            await fetch(`/api/user/recurring-payments?id=${id}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const runAutomation = async () => {
        setRunningAutomation(true);
        try {
            const res = await fetch("/api/automation/run", { method: "POST" });
            const json = await res.json();
            if (json.success) {
                alert(`¡Éxito! ${json.message}`);
                fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRunningAutomation(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-5xl mx-auto pb-24 md:pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <Zap className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Motor Financiero</h1>
                        <p className="text-gray-400 text-sm">Automatización y planificación inteligente.</p>
                    </div>
                </div>
                <button
                    onClick={runAutomation}
                    disabled={runningAutomation}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                    {runningAutomation ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                    Ejecutar Motor Ahora
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. PAGOS RECURRENTES */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            <h2 className="text-xl font-bold text-white">Pagos Recurrentes</h2>
                        </div>
                        <button
                            onClick={() => setShowRecurringForm(!showRecurringForm)}
                            className="bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 text-gray-400 transition-all hover:text-white"
                        >
                            {showRecurringForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                    </div>

                    {showRecurringForm && (
                        <div className="glass p-6 rounded-3xl border border-indigo-500/30 bg-indigo-500/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nombre / Concepto</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Netflix, Alquiler"
                                        value={newRecurring.name}
                                        onChange={e => setNewRecurring({ ...newRecurring, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Monto (Gasto = -)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={newRecurring.amount}
                                        onChange={e => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Frecuencia</label>
                                    <select
                                        value={newRecurring.frequency}
                                        onChange={e => setNewRecurring({ ...newRecurring, frequency: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                    >
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensual</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Próximo Vencimiento</label>
                                    <input
                                        type="date"
                                        value={newRecurring.nextDueDate}
                                        onChange={e => setNewRecurring({ ...newRecurring, nextDueDate: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={newRecurring.autoRegister}
                                        onChange={e => setNewRecurring({ ...newRecurring, autoRegister: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-500 focus:ring-indigo-500/20"
                                    />
                                    <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">Auto-registrar</span>
                                </label>
                                <button
                                    onClick={handleAddRecurring}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    Guardar Pago
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {recurring.length > 0 ? recurring.map((p) => (
                            <div key={p.id} className="glass p-4 rounded-2xl border border-white/5 transition-all hover:bg-white/[0.02] flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${p.amount > 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                        <Calendar className={`w-5 h-5 ${p.amount > 0 ? "text-emerald-400" : "text-red-400"}`} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{p.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{p.frequency}</span>
                                            <span className="text-[10px] text-indigo-400 font-bold italic">Próximo: {format(new Date(p.nextDueDate), "d MMM", { locale: es })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className={`font-black text-sm ${p.amount > 0 ? "text-emerald-400" : "text-white"}`}>
                                        {p.amount > 0 ? "+" : ""}${p.amount.toLocaleString('es-CO')}
                                    </p>
                                    <button
                                        onClick={() => handleDeleteRecurring(p.id)}
                                        className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 border border-dashed border-white/10 rounded-3xl">
                                <p className="text-sm text-gray-500">No tienes pagos recurrentes configurados.</p>
                                <button onClick={() => setShowRecurringForm(true)} className="text-indigo-400 text-xs mt-2 font-bold hover:underline">Añadir el primero</button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. REGLAS FINANCIERAS */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-bold text-white">Alertas & Reglas Inteligentes</h2>
                    </div>

                    <div className="glass p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/5 to-transparent space-y-4">
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg">
                                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Alerta de Sobregasto</p>
                                    <p className="text-xs text-gray-400 mt-1">Si gasto más del 20% en <span className="text-white font-medium italic">Alimentación</span> comparado con el mes anterior.</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Activa</span>
                                        <span className="text-[10px] text-gray-500 italic">Pre-configurada por IA</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <TrendingUp className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Detector de Suscripciones</p>
                                    <p className="text-xs text-gray-400 mt-1">Notificarme si tengo más de 3 transacciones recurrentes el mismo día.</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Activa</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-xs text-gray-500 mb-2">Las reglas avanzadas usan aprendizaje automático.</p>
                                <button className="text-[10px] bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10 font-bold transition-all">Crear Regla Personalizada</button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-bold text-white italic">IA Proactiva</h3>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">
                            Cashora está monitoreando tus flujos 24/7. Pronto recibirás recomendaciones directas si detectamos anomalías en tus patrones de consumo.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
