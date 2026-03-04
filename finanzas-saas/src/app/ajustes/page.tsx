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
    UserCheck
} from "lucide-react";
import Link from "next/link";
import { MobileNavBar } from "@/components/MobileNavBar";
import { useState, useEffect } from "react";

export default function AjustesPage() {
    const { data: session, update } = useSession();
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

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">Cargando ajustes...</div>;

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-4xl mx-auto min-h-[calc(100vh-4rem)] pb-24 md:pb-10">
            <div>
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium mb-6 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-xl w-fit">
                    <ArrowLeft className="w-5 h-5" />
                    Volver al Dashboard
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Ajustes</h1>
                        <p className="text-gray-400">Gestiona tus preferencias y personaliza tu perfil.</p>
                    </div>
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
                                            (settings.nickname?.charAt(0) || session?.user?.phone?.charAt(0) || "U").toUpperCase()}
                            </div>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Apodo / Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Tu apodo"
                                        value={settings.nickname}
                                        onChange={(e) => setSettings({ ...settings, nickname: e.target.value })}
                                        onBlur={() => saveSettings()}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono (Cuenta)</label>
                                    <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-gray-400 text-sm overflow-hidden text-ellipsis font-mono">
                                        {/* @ts-ignore */}
                                        {session?.user?.phone}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seleccionar Icono</label>
                                    <div className="flex flex-wrap gap-2">
                                        {iconOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    const updated = { ...settings, profileIcon: opt };
                                                    setSettings(updated);
                                                    saveSettings(updated);
                                                }}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${settings.profileIcon === opt ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                            >
                                                {opt === "gender-male" ? <User2 className="w-5 h-5" /> :
                                                    opt === "gender-female" ? <UserCircle className="w-5 h-5" /> :
                                                        opt === "circle" ? <UserCheck className="w-5 h-5" /> : opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color de Perfil</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    const updated = { ...settings, profileColor: color };
                                                    setSettings(updated);
                                                    saveSettings(updated);
                                                }}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${settings.profileColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: color }}
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
                        <Bell className="w-5 h-5 text-indigo-400" /> Preferencias y Alertas
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <div className="font-medium text-gray-200 group-hover:text-white transition-colors">Alertas de Gasto Mensual</div>
                                <div className="text-sm text-gray-500">Notificar cuando supero el promedio</div>
                            </div>
                            <div onClick={() => handleToggle('monthlySpendAlert')} className={`relative inline-block w-12 h-6 rounded-full transition-colors ${settings.monthlySpendAlert ? 'bg-indigo-600' : 'bg-white/10'}`}>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.monthlySpendAlert ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <div className="font-medium text-gray-200 group-hover:text-white transition-colors">Reporte Mensual PDF</div>
                                <div className="text-sm text-gray-500">Recibir análisis por email el día 1</div>
                            </div>
                            <div onClick={() => handleToggle('pdfReportEmail')} className={`relative inline-block w-12 h-6 rounded-full transition-colors ${settings.pdfReportEmail ? 'bg-indigo-600' : 'bg-white/10'}`}>
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
                            className="text-left px-4 py-3 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors text-gray-300"
                        >
                            Borrar movimientos de la semana
                        </button>

                        <button
                            onClick={() => handleBulkDelete("month", "este mes")}
                            className="text-left px-4 py-3 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors text-gray-300"
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
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl animate-fade-in z-50">
                    Guardando cambios...
                </div>
            )}

            <MobileNavBar />
        </div>
    );
}
