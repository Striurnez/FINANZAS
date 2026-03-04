import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
        }
        const sessionUser = session.user as any;
        if (!sessionUser?.phone) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
        }

        await (prisma.user as any).update({
            where: { phone: sessionUser.phone },
            data: { waOnboardingDone: true }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[WA_ONBOARDING_PATCH]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
