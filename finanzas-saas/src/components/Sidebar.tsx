"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ListOrdered,
    LogOut,
    Wallet,
    Settings,
    User2,
    UserCircle,
} from "lucide-react";

export function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Histórico", href: "/historico", icon: ListOrdered },
        { name: "Ajustes", href: "/ajustes", icon: Settings },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 glass border-r border-white/10 h-screen sticky top-0 bg-black/50 p-6 z-20">
            <div className="flex items-center gap-3 mb-10">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Wallet className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Finanzas<span className="text-indigo-400">AI</span></span>
            </div>

            <div className="flex-1 space-y-2">
                <div className="text-xs font-semibold text-gray-500 mb-4 px-3 tracking-wider uppercase">Menu</div>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                ? "bg-indigo-500/10 text-indigo-400 font-medium"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "group-hover:text-indigo-400 transition-colors"}`} />
                            {link.name}
                        </Link>
                    );
                })}
            </div>

            <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 px-3 mb-4">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0 overflow-hidden border border-white/10"
                        style={{ backgroundColor: session?.user?.profileColor || "#6366f1" }}
                    >
                        {session?.user?.profileIcon === "gender-male" ? <User2 className="w-5 h-5" /> :
                            session?.user?.profileIcon === "gender-female" ? <UserCircle className="w-5 h-5" /> :
                                session?.user?.profileIcon && session?.user?.profileIcon.length === 1 ? session?.user?.profileIcon :
                                    // @ts-ignore
                                    (session?.user?.nickname?.charAt(0) || session?.user?.phone?.charAt(0) || "U").toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-gray-200 truncate">
                            {/* @ts-ignore */}
                            {session?.user?.nickname || session?.user?.phone}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate">Sesión Activa</span>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}
