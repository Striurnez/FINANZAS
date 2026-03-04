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

        const goals = await prisma.savingsGoal.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ success: true, data: goals });
    } catch (error: any) {
        console.error("GET Goals Error:", error);
        return NextResponse.json({ success: false, error: "Error interno", message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { nombre, monto } = await req.json();

        // @ts-ignore
        const goal = await prisma.savingsGoal.create({
            data: {
                userId: session.user.id,
                nombre,
                monto: parseFloat(monto)
            }
        });

        return NextResponse.json({ success: true, data: goal });
    } catch (error: any) {
        console.error("POST Goal Error:", error);
        return NextResponse.json({ success: false, error: "Error interno", message: error.message }, { status: 500 });
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

        if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

        // @ts-ignore
        await prisma.savingsGoal.delete({
            where: { id, userId: session.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE Goal Error:", error);
        return NextResponse.json({ success: false, error: "Error interno", message: error.message }, { status: 500 });
    }
}
