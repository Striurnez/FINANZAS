"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNavBar } from "@/components/MobileNavBar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (status === "authenticated" && !pathname.includes("/historico") && !pathname.includes("/ajustes")) {
        // Ensure standard Next.js Layout rendering for Dashboard subpaths (since Historico and Ajustes have their own raw page)
        // Wait, Historico and Ajustes do NOT use this layout because they are top-level routes outside /dashboard.
        // I need to add MobileNavBar to them individually, OR add it to RootLayout.
    }

    if (status === "authenticated") {
        return (
            <div className="flex min-h-screen bg-black text-white selection:bg-indigo-500/30 pb-20 md:pb-0">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
                <MobileNavBar />
            </div>
        );
    }

    return null;
}
