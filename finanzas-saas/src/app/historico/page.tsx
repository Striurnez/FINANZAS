"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Tag, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { MobileNavBar } from "@/components/MobileNavBar";

export default function HistoricoPage() {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [q, setQ] = useState("");
    const [mes, setMes] = useState("");
    const [categoria, setCategoria] = useState("Todas");
    const [tipo, setTipo] = useState("Todos");

    const fetchMovimientos = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (q) params.append("q", q);
            if (mes) params.append("mes", mes);
            if (categoria !== "Todas") params.append("categoria", categoria);
            if (tipo !== "Todos") params.append("tipo", tipo);

            const res = await fetch(`/api/transactions?${params.toString()}`);
            const json = await res.json();
            if (json.success) {
                setMovimientos(json.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, description: string) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar "${description}"?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/transactions?id=${id}`, {
                method: "DELETE"
            });
            const json = await res.json();
            if (json.success) {
                fetchMovimientos();
            } else {
                alert("Error al eliminar el movimiento");
            }
        } catch (error) {
            console.error("Error delete:", error);
            alert("Error de conexión al eliminar");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMovimientos();
        }, 500);
        return () => clearTimeout(timer);
    }, [q, mes, categoria, tipo]);

    const categorias = [
        "Todas", "Alimentación", "Transporte", "Vivienda", "Ocio",
        "Educación", "Salud", "Inversión", "Servicios", "Compras", "Otros"
    ];

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col pb-24 md:pb-10">
            <div>
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-6 transition-colors bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl w-fit">
                    <ArrowLeft className="w-5 h-5" />
                    Volver al Dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">Histórico de Movimientos</h1>
                <p className="text-muted-foreground">Busca y filtra todos tus registros financieros.</p>
            </div>

            <div className="glass p-4 rounded-2xl border border-border flex flex-col flex-wrap lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por descripción..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    />
                </div>

                <div className="flex gap-4 flex-wrap">
                    <select
                        className="bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none min-w-[140px]"
                        value={mes}
                        onChange={(e) => setMes(e.target.value)}
                    >
                        <option value="" className="bg-background text-foreground">Todos los meses</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1} className="bg-background text-foreground">
                                {new Date(0, i).toLocaleString('es', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    <select
                        className="bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none min-w-[140px]"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                    >
                        {categorias.map(c => <option key={c} value={c} className="bg-background text-foreground">{c}</option>)}
                    </select>

                    <select
                        className="bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none min-w-[140px]"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value="Todos" className="bg-background text-foreground">Todos los tipos</option>
                        <option value="ingreso" className="bg-background text-foreground">Ingresos</option>
                        <option value="gasto" className="bg-background text-foreground">Gastos</option>
                    </select>
                </div>
            </div>

            <div className="glass rounded-2xl border border-border overflow-hidden flex-1 flex flex-col">
                {loading ? (
                    <div className="p-12 flex justify-center items-center flex-1">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : movimientos.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-muted-foreground flex-1">
                        <Filter className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No se encontraron movimientos.</p>
                        <p className="text-sm">Intenta con otros filtros de búsqueda.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Descripción</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Categoría</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Fecha</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right">Monto</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-center w-16">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {movimientos.map((mov: any) => (
                                    <tr key={mov.id} className="hover:bg-foreground/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{mov.descripcion}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
                                                <Tag className="w-3 h-3" />
                                                {mov.categoria}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm">
                                            {format(new Date(mov.fecha), "d MMM yyyy", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold">
                                            <div className={`flex items-center justify-end gap-1.5 ${mov.tipo === 'ingreso' ? 'text-emerald-500' : 'text-foreground'}`}>
                                                {mov.tipo === 'ingreso' ? '+' : '-'} ${mov.monto.toLocaleString('es-CO')}
                                                {mov.tipo === 'ingreso' ? <ArrowUpRight className="w-4 h-4 text-emerald-500/50" /> : <ArrowDownRight className="w-4 h-4 text-muted-foreground/50" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(mov.id, mov.descripcion)}
                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Eliminar movimiento"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <MobileNavBar />
        </div>
    );
}
