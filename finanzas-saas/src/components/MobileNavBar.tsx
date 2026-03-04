"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ListOrdered, Settings, Zap } from "lucide-react";
import { useSession } from "next-auth/react";

export function MobileNavBar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Histórico", href: "/historico", icon: ListOrdered },
        { name: "Motor", href: "/planeacion", icon: Zap },
        { name: "Ajustes", href: "/ajustes", icon: Settings },
    ];

    const profileColor = session?.user?.profileColor || "#6366f1";

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border p-4 pb-6 z-50 flex justify-around items-center bg-background/80 backdrop-blur-lg">
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? "" : "text-muted-foreground hover:text-foreground"
                            }`}
                        style={isActive ? { color: profileColor } : {}}
                    >
                        <Icon className={`w-6 h-6`} />
                        <span className="text-[10px] font-medium">{link.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
