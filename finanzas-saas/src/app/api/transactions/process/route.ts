import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clasificarMovimiento } from "@/lib/openai";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { texto } = await req.json();

        if (!texto) {
            return NextResponse.json({ error: "Texto Requerido" }, { status: 400 });
        }

        // Detectar opcionalmente un signo, un número (que puede tener puntos de miles), y luego texto
        const match = texto.match(/^([+-]?)(\d+(?:[\.,]\d+)*)\s+(.+)$/);

        if (!match) {
            return NextResponse.json({ error: "Formato inválido. Ejemplo: +200.000 Pago o 25000 Almuerzo" }, { status: 400 });
        }

        const sign = match[1];
        const montoLimpio = match[2].replace(/\./g, "").replace(/,/g, ".");
        const monto = parseFloat(montoLimpio);
        const descripcion = match[3].trim();

        // Lógica de signo: "+" es ingreso, "-" o nada es gasto
        const tipo = sign === "+" ? "ingreso" : "gasto";

        // Llamada a OpenAI
        const categoria = await clasificarMovimiento(descripcion);

        // Fechas
        const date = new Date();
        const mes = date.getMonth() + 1; // 1-12
        const anio = date.getFullYear();

        // Guardar en DB
        const movimiento = await prisma.movimiento.create({
            data: {
                userId: session.user.id,
                monto,
                tipo,
                descripcion,
                categoria,
                fecha: date,
                mes,
                anio,
            }
        });

        return NextResponse.json({ success: true, data: movimiento }, { status: 201 });
    } catch (error: any) {
        console.error("Error al procesar movimiento:", error);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}
