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

        // @ts-ignore
        const rules = await prisma.financialRule.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ success: true, data: rules });
    } catch (error: any) {
        console.error("GET Rules Error:", error);
        return NextResponse.json({ success: false, error: "Error interno", message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { triggerType, condition, action } = await req.json();

        // @ts-ignore
        const rule = await prisma.financialRule.create({
            data: {
                userId: session.user.id,
                triggerType,
                condition: typeof condition === 'string' ? condition : JSON.stringify(condition),
                action,
                isActive: true
            }
        });

        return NextResponse.json({ success: true, data: rule });
    } catch (error: any) {
        console.error("POST Rule Error:", error);
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
        await prisma.financialRule.delete({
            where: { id, userId: session.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE Rule Error:", error);
        return NextResponse.json({ success: false, error: "Error interno", message: error.message }, { status: 500 });
    }
}
