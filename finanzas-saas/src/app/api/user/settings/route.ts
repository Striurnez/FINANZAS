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

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                nickname: true,
                profileIcon: true,
                profileColor: true,
                notificationsOn: true,
                monthlySpendAlert: true,
                pdfReportEmail: true,
                savingsReminder: true,
            }
        });

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error("Settings GET error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();

        // Allowed fields for update
        const {
            nickname,
            profileIcon,
            profileColor,
            notificationsOn,
            monthlySpendAlert,
            pdfReportEmail,
            savingsReminder
        } = body;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                nickname,
                profileIcon,
                profileColor,
                notificationsOn,
                monthlySpendAlert,
                pdfReportEmail,
                savingsReminder,
            }
        });

        return NextResponse.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error("Settings PATCH error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
