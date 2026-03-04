import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { es } from "date-fns/locale";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const weekOffset = parseInt(searchParams.get("weekOffset") || "0");
        const monthOffset = parseInt(searchParams.get("monthOffset") || "0");

        const now = new Date();
        const targetWeekStart = startOfWeek(subWeeks(now, Math.abs(weekOffset)), { weekStartsOn: 1 });
        const targetWeekEnd = endOfWeek(subWeeks(now, Math.abs(weekOffset)), { weekStartsOn: 1 });

        const prevWeekStart = startOfWeek(subWeeks(targetWeekStart, 1), { weekStartsOn: 1 });
        const prevWeekEnd = endOfWeek(subWeeks(targetWeekStart, 1), { weekStartsOn: 1 });

        const targetMonthDate = subMonths(now, Math.abs(monthOffset));
        const qMes = targetMonthDate.getMonth() + 1;
        const qAnio = targetMonthDate.getFullYear();

        // --- DASHBOARD WEEKLY ---
        let weekly = { ingresos: 0, gastos: 0, prevGastos: 0, start: targetWeekStart, end: targetWeekEnd };
        try {
            const movsWeek = await prisma.movimiento.findMany({
                where: {
                    userId: session.user.id,
                    fecha: { gte: targetWeekStart, lte: targetWeekEnd }
                }
            });

            const movsPrevWeek = await prisma.movimiento.findMany({
                where: {
                    userId: session.user.id,
                    fecha: { gte: prevWeekStart, lte: prevWeekEnd }
                }
            });

            weekly.ingresos = movsWeek.filter(m => m.tipo === "ingreso").reduce((a: number, b: any) => a + (b.monto || 0), 0);
            weekly.gastos = movsWeek.filter(m => m.tipo === "gasto").reduce((a: number, b: any) => a + (b.monto || 0), 0);
            weekly.prevGastos = movsPrevWeek.filter(m => m.tipo === "gasto").reduce((a: number, b: any) => a + (b.monto || 0), 0);
        } catch (e) {
            console.error("Error in weekly logic:", e);
        }

        // --- DASHBOARD MONTHLY ---
        let monthly = { ingresos: 0, gastos: 0, mes: qMes, anio: qAnio };
        let graficaPastel: any[] = [];
        try {
            const movsMonth = await prisma.movimiento.findMany({
                where: { userId: session.user.id, mes: qMes, anio: qAnio }
            });

            monthly.ingresos = movsMonth.filter(m => m.tipo === "ingreso").reduce((a: number, b: any) => a + (b.monto || 0), 0);
            monthly.gastos = movsMonth.filter(m => m.tipo === "gasto").reduce((a: number, b: any) => a + (b.monto || 0), 0);

            const gastosPorCategoriaData = movsMonth.filter(m => m.tipo === "gasto").reduce((acc: any, m: any) => {
                acc[m.categoria] = (acc[m.categoria] || 0) + m.monto;
                return acc;
            }, {});

            graficaPastel = Object.keys(gastosPorCategoriaData).map(name => ({
                name,
                value: gastosPorCategoriaData[name]
            }));
        } catch (e) {
            console.error("Error in monthly logic:", e);
        }

        // --- HISTORICAL LINE ---
        const graficaLineaArray = [];
        const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        try {
            for (let i = 5; i >= 0; i--) {
                const d = subMonths(now, i);
                const m = d.getMonth() + 1;
                const y = d.getFullYear();

                const movsMes = await prisma.movimiento.findMany({
                    where: { userId: session.user.id, mes: m, anio: y },
                });

                graficaLineaArray.push({
                    name: mesesNombres[m - 1],
                    ingresos: movsMes.filter((x: any) => x.tipo === "ingreso").reduce((a: number, b: any) => a + (b.monto || 0), 0),
                    gastos: movsMes.filter((x: any) => x.tipo === "gasto").reduce((a: number, b: any) => a + (b.monto || 0), 0),
                });
            }
        } catch (e) {
            console.error("Error in historical logic:", e);
        }

        // --- CASHORA SCORE ---
        let score = 0;
        try {
            const savingsRatio = monthly.ingresos > 0 ? (monthly.ingresos - monthly.gastos) / monthly.ingresos : 0;

            // Score simplificado: 80% basado en el ratio de ahorro (max 100) + 20% base de consistencia
            score = Math.round((Math.max(0, Math.min(1, savingsRatio)) * 80) + 20);
            score = Math.max(0, Math.min(100, score));
        } catch (e) {
            console.error("Error calculating score:", e);
        }

        // --- FORECAST ---
        let forecast = { balance30d: 0, alert: "" };
        try {
            const avgDailySpend = monthly.gastos / 30;
            const projectedSpend = avgDailySpend * 30;
            forecast.balance30d = (monthly.ingresos - projectedSpend);

            if (monthly.gastos > monthly.ingresos * 0.9) {
                forecast.alert = "¡Alerta! Estás gastando casi el 100% de tus ingresos.";
            } else if (weekly.gastos > weekly.prevGastos * 1.3 && weekly.prevGastos > 0) {
                forecast.alert = "Tus gastos esta semana subieron significativamente vs la anterior.";
            }
        } catch (e) {
            console.error("Error in forecast logic:", e);
        }

        // --- USER INFO ---
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                nickname: true,
                profileColor: true,
                profileIcon: true,
                waOnboardingDone: true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                user, // Añadido para que el frontend sepa si mostrar el modal de WA
                weekly,
                monthly,
                score,
                forecast,
                graficas: {
                    pastel: graficaPastel,
                    linea: graficaLineaArray,
                }
            },
        });
    } catch (error: any) {
        console.error("Fatal Dashboard API Error:", error);
        return NextResponse.json({
            success: false,
            error: "Error fatal en el servidor",
            message: error.message
        }, { status: 500 });
    }
}
