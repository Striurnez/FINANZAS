"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ListOrdered, Settings, Zap } from "lucide-react";

export function MobileNavBar() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Histórico", href: "/historico", icon: ListOrdered },
        { name: "Motor", href: "/planeacion", icon: Zap },
        { name: "Ajustes", href: "/ajustes", icon: Settings },
    ];

    const profileColor = "#6366f1"; // Default, ideally from session/props

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t p-4 pb-6 z-50 flex justify-around items-center">
            <style jsx>{`
                .active-link {
                    color: ${profileColor};
                }
            `}</style>
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? "" : "text-muted-foreground hover:text-[hsl(var(--foreground))]"
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
