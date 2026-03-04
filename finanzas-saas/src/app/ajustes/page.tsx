"use client";

import { useSession } from "next-auth/react";
import {
    ArrowLeft,
    Bell,
    Trash2,
    Plus,
    X,
    User2,
    UserCircle,
    UserCheck,
    Sun,
    Moon,
} from "lucide-react";
import Link from "next/link";
import { MobileNavBar } from "@/components/MobileNavBar";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function AjustesPage() {
    const { data: session, update } = useSession();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // User Settings State
    const [settings, setSettings] = useState({
        nickname: "",
        profileIcon: "",
        profileColor: "#6366f1",
        notificationsOn: true,
        monthlySpendAlert: true,
        pdfReportEmail: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/user/settings");
                const setData = await res.json();

                if (setData.success) {
                    setSettings({
                        nickname: setData.data.nickname || "",
                        profileIcon: setData.data.profileIcon || "",
                        profileColor: setData.data.profileColor || "#6366f1",
                        notificationsOn: setData.data.notificationsOn ?? true,
                        monthlySpendAlert: setData.data.monthlySpendAlert ?? true,
                        pdfReportEmail: setData.data.pdfReportEmail ?? true,
                    });
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const saveSettings = async (newVal?: any) => {
        setSaving(true);
        const toSave = newVal || settings;
        try {
            await fetch("/api/user/settings", {
                method: "PATCH",
                body: JSON.stringify(toSave)
            });
            // Actualizar la sesión para que el Sidebar refleje los cambios inmediatamente
            await update({
                user: {
                    nickname: toSave.nickname,
                    profileIcon: toSave.profileIcon,
                    profileColor: toSave.profileColor,
                }
            });
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (key: string) => {
        const updated = { ...settings, [key]: !(settings as any)[key] };
        setSettings(updated);
        saveSettings(updated);
    };

    const handleBulkDelete = async (range: string, label: string) => {
        const confirmMsg = range === "all"
            ? "¿ESTÁS COMPLETAMENTE SEGURO? Esta acción borrará TODOS tus movimientos permanentemente."
            : `¿Estás seguro de que quieres borrar los movimientos de ${label}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await fetch(`/api/transactions?range=${range}`, {
                method: "DELETE"
            });
            const json = await res.json();
            if (json.success) {
                alert(`Éxito: Se han eliminado los movimientos.`);
            } else {
                alert("Error al procesar la eliminación masiva.");
            }
        } catch (error) {
            console.error("Bulk delete error:", error);
            alert("Error de conexión.");
        }
    };

    const iconOptions = ["A", "B", "C", "M", "F", "gender-male", "gender-female", "circle"];
    const colorOptions = [
        "#6366f1", // Indigo
        "#8b5cf6", // Violet
        "#ec4899", // Pink
        "#f43f5e", // Rose
        "#10b981", // Emerald
        "#0ea5e9", // Sky
        "#f59e0b", // Amber
        "#64748b", // Slate
    ];

    const profileColor = settings.profileColor;

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Cargando ajustes...</div>;

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-4xl mx-auto min-h-[calc(100vh-4rem)] pb-24 md:pb-10">
            <style jsx global>{`
                :root {
                    --primary: ${profileColor.startsWith('#') ? hexToHsl(profileColor) : "243.4 75.4% 58.6%"};
                }
            `}</style>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:opacity-80 font-medium mb-6 transition-colors bg-primary/10 px-4 py-2 rounded-xl w-fit" style={{ color: profileColor, backgroundColor: `${profileColor}15` }}>
                        <ArrowLeft className="w-5 h-5" />
                        Volver al Dashboard
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Ajustes</h1>
                        <p className="text-muted-foreground">Gestiona tus preferencias y personaliza tu perfil.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-muted rounded-2xl">
                    <button
                        onClick={() => setTheme("light")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${theme === "light" ? "bg-background shadow-lg scale-105" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Sun className="w-4 h-4" /> Claro
                    </button>
                    <button
                        onClick={() => setTheme("dark")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${theme === "dark" ? "bg-background shadow-lg scale-105 shadow-[0_0_20px_rgba(0,0,0,0.5)]" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Moon className="w-4 h-4" /> Oscuro
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="glass rounded-2xl p-6 border border-white/10 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <div className="relative group">
                            <div
                                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-lg shrink-0 overflow-hidden border-2 border-white/10 transition-all"
                                style={{ backgroundColor: settings.profileColor }}
                            >
                                {settings.profileIcon === "gender-male" ? <User2 className="w-12 h-12" /> :
                                    settings.profileIcon === "gender-female" ? <UserCircle className="w-12 h-12" /> :
                                        settings.profileIcon && settings.profileIcon.length === 1 ? settings.profileIcon :
                                            // @ts-ignore
                                            (settings.nickname?.charAt(0) || session?.user?.phone?.charAt(0) || "U").toUpperCase()}
                            </div>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Apodo / Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Tu apodo"
                                        value={settings.nickname}
                                        onChange={(e) => setSettings({ ...settings, nickname: e.target.value })}
                                        onBlur={() => saveSettings()}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teléfono (Cuenta)</label>
                                    <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-muted-foreground text-sm overflow-hidden text-ellipsis font-mono">
                                        {/* @ts-ignore */}
                                        {session?.user?.phone}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seleccionar Icono</label>
                                    <div className="flex flex-wrap gap-2">
                                        {iconOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    const updated = { ...settings, profileIcon: opt };
                                                    setSettings(updated);
                                                    saveSettings(updated);
                                                }}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${settings.profileIcon === opt ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
                                                style={settings.profileIcon === opt ? { backgroundColor: profileColor, borderColor: profileColor } : {}}
                                            >
                                                {opt === "gender-male" ? <User2 className="w-5 h-5" /> :
                                                    opt === "gender-female" ? <UserCircle className="w-5 h-5" /> :
                                                        opt === "circle" ? <UserCheck className="w-5 h-5" /> : opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color de Perfil</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    const updated = { ...settings, profileColor: color };
                                                    setSettings(updated);
                                                    saveSettings(updated);
                                                }}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${settings.profileColor === color ? 'border-primary scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color, borderColor: settings.profileColor === color ? 'white' : 'transparent' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences Grid */}
                <div className="glass rounded-2xl border border-white/10 p-6 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" style={{ color: profileColor }} /> Preferencias y Alertas
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <div className="font-medium group-hover:text-primary transition-colors">Alertas de Gasto Mensual</div>
                                <div className="text-sm text-muted-foreground">Notificar cuando supero el promedio</div>
                            </div>
                            <div onClick={() => handleToggle('monthlySpendAlert')} className={`relative inline-block w-12 h-6 rounded-full transition-colors ${settings.monthlySpendAlert ? 'bg-primary' : 'bg-white/10'}`} style={settings.monthlySpendAlert ? { backgroundColor: profileColor } : {}}>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.monthlySpendAlert ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <div className="font-medium group-hover:text-primary transition-colors">Reporte Mensual PDF</div>
                                <div className="text-sm text-muted-foreground">Recibir análisis por email el día 1</div>
                            </div>
                            <div onClick={() => handleToggle('pdfReportEmail')} className={`relative inline-block w-12 h-6 rounded-full transition-colors ${settings.pdfReportEmail ? 'bg-primary' : 'bg-white/10'}`} style={settings.pdfReportEmail ? { backgroundColor: profileColor } : {}}>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.pdfReportEmail ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="glass rounded-2xl border border-red-500/20 p-6 bg-red-500/5">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-red-400">
                        <Trash2 className="w-5 h-5" /> Zona de Peligro
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleBulkDelete("week", "esta semana")}
                            className="text-left px-4 py-3 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors text-muted-foreground"
                        >
                            Borrar movimientos de la semana
                        </button>

                        <button
                            onClick={() => handleBulkDelete("month", "este mes")}
                            className="text-left px-4 py-3 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors text-muted-foreground"
                        >
                            Borrar movimientos del mes
                        </button>

                        <button
                            onClick={() => handleBulkDelete("all", "todos los tiempos")}
                            className="sm:col-span-2 text-center px-4 py-3 rounded-xl text-sm font-bold border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                            Borrar DEFINITIVAMENTE todos los datos
                        </button>
                    </div>
                </div>
            </div>

            {saving && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl animate-fade-in z-50" style={{ backgroundColor: profileColor }}>
                    Guardando cambios...
                </div>
            )}

            <MobileNavBar />
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
