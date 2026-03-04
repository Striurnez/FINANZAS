import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addWeeks, addMonths, addYears } from "date-fns";

export async function POST(req: Request) {
    try {
        // En producción, esto debería estar protegido por un API KEY o secreto en los headers
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) ...

        const now = new Date();

        // 1. Buscar pagos recurrentes pendientes
        // @ts-ignore
        const pendingPayments = await prisma.recurringPayment.findMany({
            where: {
                nextDueDate: { lte: now }
            },
            include: { user: true }
        });

        let processedCount = 0;
        let registeredCount = 0;

        for (const payment of pendingPayments) {
            // 2. Auto-registrar si está activado
            if (payment.autoRegister) {
                await prisma.movimiento.create({
                    data: {
                        userId: payment.userId,
                        monto: payment.amount,
                        tipo: payment.amount > 0 ? "ingreso" : "gasto",
                        descripcion: `[AUTO] ${payment.name}`,
                        categoria: "Servicios", // Categoría por defecto para pagos recurrentes
                        fecha: now,
                        mes: now.getMonth() + 1,
                        anio: now.getFullYear()
                    }
                });
                registeredCount++;
            }

            // 3. Calcular próxima fecha
            let nextDate = payment.nextDueDate;
            switch (payment.frequency) {
                case "weekly": nextDate = addWeeks(nextDate, 1); break;
                case "monthly": nextDate = addMonths(nextDate, 1); break;
                case "yearly": nextDate = addYears(nextDate, 1); break;
            }

            // 4. Actualizar el pago recurrente
            // @ts-ignore
            await prisma.recurringPayment.update({
                where: { id: payment.id },
                data: { nextDueDate: nextDate }
            });

            processedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Procesados ${processedCount} pagos recurrentes.`,
            autoRegistered: registeredCount
        });

    } catch (error: any) {
        console.error("Automation Error:", error);
        return NextResponse.json({ success: false, error: "Error en la automatización", message: error.message }, { status: 500 });
    }
}
