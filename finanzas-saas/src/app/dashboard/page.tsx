"use client";

import { useEffect, useState } from "react";
import { SmartInput } from "@/components/SmartInput";
import {
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    TrendingUp,
    AlertCircle,
    Download,
    CheckCircle2,
    PieChart as PieChartIcon,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Plus,
    X
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#facc15', '#10b981', '#3b82f6'];

export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);

    // Temporal Offsets
    const [weekOffset, setWeekOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/dashboard?weekOffset=${weekOffset}&monthOffset=${monthOffset}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchDashboardData();
    }, [weekOffset, monthOffset]);

    const downloadPDF = async () => {
        try {
            setPdfLoading(true);
            // Generar PDF del mes actual visualizado
            const res = await fetch(`/api/reports/pdf?mes=${data.monthly.mes}&anio=${data.monthly.anio}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `reporte-${data.monthly.mes}-${data.monthly.anio}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error al descargar PDF:", error);
        } finally {
            setPdfLoading(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const { weekly, monthly, graficas, savingsGoals, score, forecast } = data || {
        weekly: { ingresos: 0, gastos: 0, prevGastos: 0, start: new Date(), end: new Date() },
        monthly: { ingresos: 0, gastos: 0, mes: new Date().getMonth() + 1, anio: new Date().getFullYear() },
        graficas: { pastel: [], linea: [] },
        savingsGoals: [],
        score: 0,
        forecast: { balance30d: 0, alert: "" }
    };

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto pb-24 md:pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <img src="/icon.png" alt="Cashora Logo" className="w-14 h-14 aspect-square object-cover rounded-full border-2 border-indigo-500/20 shadow-lg" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Cashora</h1>
                        <p className="text-gray-400">Análisis inteligente de tus finanzas personales.</p>
                    </div>
                </div>
                <button
                    onClick={downloadPDF}
                    disabled={pdfLoading}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                >
                    {pdfLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                    Generar Reporte Mensual PDF
                </button>
            </div>

            <SmartInput onTransactionAdded={fetchDashboardData} />

            {/* SECCIÓN INTELIGENTE: SCORE Y FORECAST */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent flex items-center gap-6 transition-all hover:bg-white/[0.02]">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-white/5"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 40}
                                strokeDashoffset={2 * Math.PI * 40 * (1 - (score || 0) / 100)}
                                className="text-indigo-500 transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-white">{score}</span>
                            <span className="text-[8px] font-bold text-gray-500 uppercase">Score</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Financial Score</h3>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                            {score > 80 ? "¡Tu salud financiera es excelente! Mantén tus hábitos." :
                                score > 50 ? "Buen progreso. Aumenta tu ratio de ahorro para subir el score." :
                                    "Atención: tus ahorros están por debajo del nivel óptimo."}
                        </p>
                    </div>
                </div>

                <div className="glass p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent flex flex-col justify-center transition-all hover:bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest">Pronóstico 30 Días</h3>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-black text-white">${forecast?.balance30d?.toLocaleString('es-CO')}</span>
                        <span className="text-xs text-gray-500 font-medium italic">saldo proyectado</span>
                    </div>
                    {forecast?.alert && (
                        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-xl animate-pulse">
                            <AlertCircle className="w-3 h-3 text-red-500" />
                            <p className="text-[10px] text-red-200 font-bold uppercase tracking-tighter">{forecast.alert}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 1. SECCIÓN INFORME SEMANAL */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Informe Semanal</h2>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setWeekOffset(prev => prev + 1)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium px-2 min-w-[180px] text-center text-gray-200">
                            {weekly?.start && `${format(new Date(weekly.start), 'd MMM', { locale: es })} - ${format(new Date(weekly.end), 'd MMM', { locale: es })}`}
                            {weekOffset === 0 && <span className="ml-2 text-indigo-400 text-xs">(Actual)</span>}
                        </span>
                        <button
                            onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-20"
                            disabled={weekOffset === 0}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/5 to-transparent">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ingresos Semanales</p>
                        <h3 className="text-2xl font-bold text-emerald-400">${weekly?.ingresos.toLocaleString('es-CO')}</h3>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-red-500/5 to-transparent">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gastos Semanales</p>
                        <h3 className="text-2xl font-bold text-red-400">${weekly?.gastos.toLocaleString('es-CO')}</h3>
                        {weekly?.prevGastos > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${weekly.gastos > weekly.prevGastos ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {weekly.gastos > weekly.prevGastos ? '↑' : '↓'} {Math.abs(((weekly.gastos - weekly.prevGastos) / weekly.prevGastos) * 100).toFixed(1)}%
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium italic">vs semana anterior</span>
                            </div>
                        )}
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Balance Neto Semanal</p>
                        <h3 className="text-2xl font-bold text-white">${(weekly?.ingresos - weekly?.gastos).toLocaleString('es-CO')}</h3>
                    </div>
                </div>
            </section>

            {/* 2. SECCIÓN INFORME MENSUAL */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <PieChartIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Informe Mensual</h2>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setMonthOffset(prev => prev + 1)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium px-2 min-w-[120px] text-center text-gray-200 uppercase">
                            {monthly && format(new Date(monthly.anio, monthly.mes - 1), 'MMMM yyyy', { locale: es })}
                            {monthOffset === 0 && <span className="ml-2 text-purple-400 text-xs">(Actual)</span>}
                        </span>
                        <button
                            onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-20"
                            disabled={monthOffset === 0}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-center">
                            <p className="text-xs font-medium text-gray-500 mb-1">Balance del Mes</p>
                            <h4 className="text-2xl font-bold">${(monthly?.ingresos - monthly?.gastos).toLocaleString('es-CO')}</h4>
                        </div>
                        <div className="glass p-4 rounded-2xl border border-white/10">
                            <p className="text-xs font-medium text-gray-500 mb-1">Ingresos</p>
                            <h4 className="text-xl font-bold text-emerald-400">${monthly?.ingresos.toLocaleString('es-CO')}</h4>
                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div className="glass p-4 rounded-2xl border border-white/10">
                            <p className="text-xs font-medium text-gray-500 mb-1">Gastos</p>
                            <h4 className="text-xl font-bold text-red-400">${monthly?.gastos.toLocaleString('es-CO')}</h4>
                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div
                                    className="bg-red-500 h-full"
                                    style={{ width: `${Math.min(100, (monthly?.gastos / (monthly?.ingresos || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Pie Chart integrated in monthly section */}
                        <div className="glass p-6 rounded-2xl border border-white/10 md:col-span-3">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Distribución de Gastos</h4>
                                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-bold">DETALLE POR CATEGORÍA</span>
                            </div>
                            <div className="h-64 w-full flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    {graficas?.pastel?.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={graficas?.pastel}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {graficas?.pastel.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}
                                                    itemStyle={{ color: '#E5E7EB' }}
                                                    formatter={(value: number | undefined, name: string | undefined) => [`$${value?.toLocaleString('es-CO') || 0}`, name || ""]}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
                                            Sin datos de gastos en este periodo.
                                        </div>
                                    )}
                                </div>
                                <div className="md:w-64 flex flex-col justify-center gap-2">
                                    {graficas?.pastel?.slice(0, 5).map((entry: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{entry.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-gray-200">${entry.value.toLocaleString('es-CO')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Month's Highlights / Alerts Column (Modified for Savings Goals) */}
                    <div className="space-y-4">
                        <div className="glass p-5 rounded-2xl border border-white/10 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Resumen IA</h4>
                                <div className="p-1 px-2 bg-indigo-500/10 rounded flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-indigo-400" />
                                    <span className="text-[8px] font-bold text-indigo-400 uppercase">Inteligencia saas</span>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                {(monthly?.gastos > monthly?.ingresos) && monthly?.ingresos > 0 && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-xs text-red-200 leading-relaxed font-medium">Tus gastos superaron tus ingresos. Considera reducir compras no esenciales.</p>
                                    </div>
                                )}
                                {(monthly?.ingresos > monthly?.gastos) && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <p className="text-xs text-emerald-200 leading-relaxed font-medium">¡Buen trabajo! Has ahorrado ${(monthly.ingresos - monthly.gastos).toLocaleString('es-CO')} este mes.</p>
                                    </div>
                                )}
                                <div className="p-3 bg-indigo-500/5 border border-white/5 rounded-xl">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Ratio Ahorro Real</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-xl font-bold text-indigo-400">
                                            {monthly?.ingresos > 0 ? (((monthly?.ingresos - monthly?.gastos) / monthly?.ingresos) * 100).toFixed(1) : 0}%
                                        </span>
                                        <span className="text-[10px] text-gray-500 mb-1">del total mensual</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SECCIÓN CRECIMIENTO 6 MESES */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Evolución Histórica</h2>
                </div>

                <div className="glass p-8 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-200">Crecimiento de los últimos 6 meses</h4>
                            <p className="text-xs text-gray-500">Tendencia mensual de ingresos vs gastos</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-gray-400">Ingresos</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-gray-400">Gastos</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graficas?.linea} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#555"
                                    tick={{ fill: '#777', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#555"
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                    tick={{ fill: '#777', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    formatter={(value: number | undefined) => [`$${value?.toLocaleString() || 0}`, '']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ingresos"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="gastos"
                                    stroke="#f43f5e"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
                                    activeDot={{ r: 6, stroke: '#f43f5e', strokeWidth: 2, fill: 'white' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>
        </div>
    );
}
