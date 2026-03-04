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
        const payments = await prisma.recurringPayment.findMany({
            where: { userId: session.user.id },
            orderBy: { nextDueDate: "asc" }
        });

        return NextResponse.json({ success: true, data: payments });
    } catch (error: any) {
        console.error("GET Recurring Payments Error:", error);
        return NextResponse.json({ success: false, error: "Error interno", message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { name, amount, frequency, dayOfMonth, nextDueDate, autoRegister, notify } = await req.json();

        // @ts-ignore
        const payment = await prisma.recurringPayment.create({
            data: {
                userId: session.user.id,
                name,
                amount: parseFloat(amount),
                frequency,
                dayOfMonth: parseInt(dayOfMonth),
                nextDueDate: new Date(nextDueDate),
                autoRegister: !!autoRegister,
                notify: !!notify
            }
        });

        return NextResponse.json({ success: true, data: payment });
    } catch (error: any) {
        console.error("POST Recurring Payment Error:", error);
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
        await prisma.recurringPayment.delete({
            where: { id, userId: session.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE Recurring Payment Error:", error);
        return NextResponse.json({ success: false, error: "Error interno", message: error.message }, { status: 500 });
    }
}
