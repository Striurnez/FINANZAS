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
    X,
    ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PlaneacionPage() {
    const { data: session } = useSession();
    const [recurring, setRecurring] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningAutomation, setRunningAutomation] = useState(false);

    // Forms
    const [showRecurringForm, setShowRecurringForm] = useState(false);
    const [showRuleForm, setShowRuleForm] = useState(false);
    const [newRecurring, setNewRecurring] = useState({
        name: "",
        amount: "",
        frequency: "monthly",
        nextDueDate: format(new Date(), "yyyy-MM-dd"),
        autoRegister: true,
        notify: true
    });

    const [newRule, setNewRule] = useState({
        triggerType: "spending_limit",
        condition: { category: "Alimentación", limit: 0 },
        action: "notify"
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

    const handleAddRule = async () => {
        try {
            const res = await fetch("/api/user/financial-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRule)
            });
            if (res.ok) {
                setShowRuleForm(false);
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

    const handleDeleteRule = async (id: string) => {
        try {
            await fetch(`/api/user/financial-rules?id=${id}`, { method: "DELETE" });
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

    const profileColor = session?.user?.profileColor || "#6366f1";

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-5xl mx-auto pb-24 md:pb-10">
            <style jsx global>{`
                :root {
                    --primary: ${profileColor.startsWith('#') ? hexToHsl(profileColor) : "243.4 75.4% 58.6%"};
                }
            `}</style>

            <header className="space-y-6">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl w-fit">
                    <ArrowLeft className="w-5 h-5" />
                    Volver al Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <Zap className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Motor Financiero</h1>
                            <p className="text-muted-foreground text-sm">Automatización y planificación inteligente.</p>
                        </div>
                    </div>
                    <button
                        onClick={runAutomation}
                        disabled={runningAutomation}
                        className="bg-primary hover:brightness-110 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {runningAutomation ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                        Ejecutar Motor Ahora
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. PAGOS RECURRENTES */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            <h2 className="text-xl font-bold text-foreground">Pagos Recurrentes</h2>
                        </div>
                        <button
                            onClick={() => setShowRecurringForm(!showRecurringForm)}
                            className="bg-muted hover:bg-muted/80 p-2 rounded-xl border border-border text-muted-foreground transition-all hover:text-foreground"
                        >
                            {showRecurringForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                    </div>

                    {showRecurringForm && (
                        <div className="glass p-6 rounded-3xl border border-primary/30 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Nombre / Concepto</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Netflix, Alquiler"
                                        value={newRecurring.name}
                                        onChange={e => setNewRecurring({ ...newRecurring, name: e.target.value })}
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Monto (Gasto = -)</label>
                                    <input
                                        type="text"
                                        placeholder="0"
                                        value={newRecurring.amount ? Number(newRecurring.amount).toLocaleString('es-CO') : ""}
                                        onChange={e => {
                                            const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9-]/g, '');
                                            setNewRecurring({ ...newRecurring, amount: rawValue });
                                        }}
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Frecuencia</label>
                                    <select
                                        value={newRecurring.frequency}
                                        onChange={e => setNewRecurring({ ...newRecurring, frequency: e.target.value })}
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 text-foreground"
                                    >
                                        <option value="weekly" className="bg-background">Semanal</option>
                                        <option value="monthly" className="bg-background">Mensual</option>
                                        <option value="yearly" className="bg-background">Anual</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Próximo Vencimiento</label>
                                    <input
                                        type="date"
                                        value={newRecurring.nextDueDate}
                                        onChange={e => setNewRecurring({ ...newRecurring, nextDueDate: e.target.value })}
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={newRecurring.autoRegister}
                                        onChange={e => setNewRecurring({ ...newRecurring, autoRegister: e.target.checked })}
                                        className="w-4 h-4 rounded border-border bg-muted text-primary focus:ring-primary/20"
                                    />
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Auto-registrar</span>
                                </label>
                                <button
                                    onClick={handleAddRecurring}
                                    className="bg-primary hover:brightness-110 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    Guardar Pago
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {recurring.length > 0 ? recurring.map((p) => (
                            <div key={p.id} className="glass p-4 rounded-2xl border border-border transition-all hover:bg-foreground/[0.02] flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${p.amount > 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                        <Calendar className={`w-5 h-5 ${p.amount > 0 ? "text-emerald-500" : "text-red-500"}`} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground text-sm">{p.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{p.frequency}</span>
                                            <span className="text-[10px] text-primary font-bold italic">Próximo: {format(new Date(p.nextDueDate), "d MMM", { locale: es })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className={`font-black text-sm ${p.amount > 0 ? "text-emerald-500" : "text-foreground"}`}>
                                        {p.amount > 0 ? "+" : ""}${p.amount.toLocaleString('es-CO')}
                                    </p>
                                    <button
                                        onClick={() => handleDeleteRecurring(p.id)}
                                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 border border-dashed border-border rounded-3xl">
                                <p className="text-sm text-muted-foreground">No tienes pagos recurrentes configurados.</p>
                                <button onClick={() => setShowRecurringForm(true)} className="text-primary text-xs mt-2 font-bold hover:underline">Añadir el primero</button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. REGLAS FINANCIERAS */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground">Alertas & Reglas Inteligentes</h2>
                        </div>
                        <button
                            onClick={() => setShowRuleForm(!showRuleForm)}
                            className="bg-muted hover:bg-muted/80 p-2 rounded-xl border border-border text-muted-foreground transition-all hover:text-foreground"
                        >
                            {showRuleForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                    </div>

                    {showRuleForm && (
                        <div className="glass p-6 rounded-3xl border border-primary/30 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Tipo de Regla</label>
                                    <select
                                        value={newRule.triggerType}
                                        onChange={e => setNewRule({ ...newRule, triggerType: e.target.value })}
                                        className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="spending_limit" className="bg-background">Límite de Gasto</option>
                                        <option value="category_alert" className="bg-background">Alerta por Categoría</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Categoría</label>
                                        <select
                                            value={newRule.condition.category}
                                            onChange={e => setNewRule({ ...newRule, condition: { ...newRule.condition, category: e.target.value } })}
                                            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="Alimentación" className="bg-background">Alimentación</option>
                                            <option value="Transporte" className="bg-background">Transporte</option>
                                            <option value="Ocio" className="bg-background">Ocio</option>
                                            <option value="Vivienda" className="bg-background">Vivienda</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Límite ($)</label>
                                        <input
                                            type="number"
                                            value={newRule.condition.limit}
                                            onChange={e => setNewRule({ ...newRule, condition: { ...newRule.condition, limit: parseInt(e.target.value) || 0 } })}
                                            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddRule}
                                    className="w-full bg-primary hover:brightness-110 text-white py-2.5 rounded-xl text-sm font-bold transition-all"
                                >
                                    Guardar Regla
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {rules.length > 0 ? rules.map((rule) => {
                            const condition = typeof rule.condition === 'string' ? JSON.parse(rule.condition) : rule.condition;
                            return (
                                <div key={rule.id} className="glass p-5 rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-transparent flex items-start gap-4 group">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <ArrowRight className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-foreground">
                                            {rule.triggerType === 'spending_limit' ? 'Límite de Gasto' : 'Alerta Personalizada'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Si el gasto en <span className="text-foreground font-medium italic">{condition?.category}</span> supera los <span className="text-foreground font-medium">${condition?.limit?.toLocaleString('es-CO')}</span>.
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold uppercase">Activa</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRule(rule.id)}
                                                className="p-1 px-2 text-muted-foreground hover:text-red-500 transition-colors text-[10px] font-bold"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-10 border border-dashed border-border rounded-3xl">
                                <p className="text-sm text-muted-foreground">No has creado reglas personalizadas todavía.</p>
                            </div>
                        )}

                        {/* Reglas de ejemplo (solo visuales por ahora si no hay nada) */}
                        <div className="p-4 bg-muted/50 border border-border rounded-2xl flex items-start gap-4 opacity-70 grayscale-[0.5]">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Detector de Suscripciones</p>
                                <p className="text-xs text-muted-foreground mt-1">Notificarme si tengo más de 3 transacciones recurrentes el mismo día.</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold uppercase">Recomendado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-3xl border border-border">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-foreground italic">IA Proactiva</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            Cashora está monitoreando tus flujos 24/7. Pronto recibirás recomendaciones directas si detectamos anomalías en tus patrones de consumo.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

// Helper to convert HEX to HSL format for CSS variables
function hexToHsl(hex: string): string {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
        }
        h /= 6;
    }

    return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}
