import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const mes = searchParams.get("mes");
        const categoria = searchParams.get("categoria");
        const tipo = searchParams.get("tipo");
        const q = searchParams.get("q");

        const filters: any = { userId: session.user.id };

        if (mes) filters.mes = parseInt(mes);
        if (categoria && categoria !== "Todas") filters.categoria = categoria;
        if (tipo && tipo !== "Todos") filters.tipo = tipo;
        if (q) filters.descripcion = { contains: q, mode: "insensitive" };

        const movimientos = await prisma.movimiento.findMany({
            where: filters,
            orderBy: { fecha: "desc" },
        });

        return NextResponse.json({ success: true, data: movimientos });
    } catch (error) {
        console.error("Error al obtener transacciones:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const range = searchParams.get("range");

        if (id) {
            // Borrado individual
            await prisma.movimiento.delete({
                where: {
                    id,
                    userId: session.user.id
                }
            });
            return NextResponse.json({ success: true, message: "Movimiento eliminado" });
        }

        if (range) {
            const now = new Date();
            let filters: any = { userId: session.user.id };

            if (range === "all") {
                // Borrar todo: ya está en el filtro inicial de userId
            } else if (range === "month") {
                filters.mes = now.getMonth() + 1;
                filters.anio = now.getFullYear();
            } else if (range === "week") {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(now.getDate() - 7);
                filters.fecha = { gte: sevenDaysAgo };
            } else {
                return NextResponse.json({ error: "Rango de borrado no válido" }, { status: 400 });
            }

            const deleted = await prisma.movimiento.deleteMany({
                where: filters
            });

            return NextResponse.json({ success: true, count: deleted.count });
        }

        return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 });
    } catch (error) {
        console.error("Error al borrar transacciones:", error);
        return NextResponse.json({ error: "Error al eliminar registros" }, { status: 500 });
    }
}
