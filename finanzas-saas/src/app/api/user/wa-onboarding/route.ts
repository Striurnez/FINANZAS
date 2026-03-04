import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.phone) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
        }

        // @ts-ignore
        await prisma.user.update({
            where: { phone: session.user.phone },
            data: { waOnboardingDone: true }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[WA_ONBOARDING_PATCH]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
