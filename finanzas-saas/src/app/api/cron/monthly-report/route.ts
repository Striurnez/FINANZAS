import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { subMonths } from "date-fns";

/**
 * Endpoint para ejecución automática el día 1 de cada mes.
 * Genera el reporte del mes anterior para todos los usuarios o un usuario específico.
 * Es idempotente: si ya existe el reporte para ese mes/año/tipo, no lo vuelve a crear.
 */
export async function POST(req: Request) {
    try {
        // En producción, esto debería estar protegido por un SECRET_KEY en las headers
        // o ser una tarea interna de Vercel/Cron.
        const authHeader = req.headers.get("authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const now = new Date();
        const lastMonth = subMonths(now, 1);
        const qMes = lastMonth.getMonth() + 1;
        const qAnio = lastMonth.getFullYear();

        // Obtener todos los usuarios (en una app SaaS real, esto se haría por lotes/jobs)
        const usuarios = await prisma.user.findMany();
        const resultados = [];

        for (const user of usuarios) {
            // 1. Verificar idempotencia
            const reporteExistente = await prisma.report.findUnique({
                where: {
                    userId_mes_anio_tipo: {
                        userId: user.id,
                        mes: qMes,
                        anio: qAnio,
                        tipo: "mensual"
                    }
                }
            });

            if (reporteExistente) {
                resultados.push({ userId: user.id, status: "already_exists" });
                continue;
            }

            // 2. Disparar generación (En este prototipo, guardamos la entrada en la DB)
            // La generación real del archivo físico se haría aquí o bajo demanda.
            // Para cumplir con el requerimiento de "almacenarlo", creamos el registro del reporte.
            const nuevoReporte = await prisma.report.create({
                data: {
                    userId: user.id,
                    mes: qMes,
                    anio: qAnio,
                    tipo: "mensual",
                    path: `/reports/mensual-${qAnio}-${qMes}-${user.id}.pdf` // Mock path
                }
            });

            resultados.push({ userId: user.id, status: "created", reportId: nuevoReporte.id });
        }

        return NextResponse.json({
            success: true,
            processed: usuarios.length,
            period: `${qMes}/${qAnio}`,
            details: resultados
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Error en el proceso de automatización" }, { status: 500 });
    }
}
