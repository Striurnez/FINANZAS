import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processTransactionText } from "@/lib/transactions";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { texto } = await req.json();

        const result = await processTransactionText(session.user.id, texto);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result.data }, { status: 201 });
    } catch (error: any) {
        console.error("Error al procesar movimiento:", error);
        return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
    }
}
