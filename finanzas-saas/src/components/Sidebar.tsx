import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
    LayoutDashboard,
    ListOrdered,
    LogOut,
    Wallet,
    Settings,
    User2,
    UserCircle,
    Zap,
    Sun,
    Moon,
} from "lucide-react";

export function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Histórico", href: "/historico", icon: ListOrdered },
        { name: "Motor", href: "/planeacion", icon: Zap },
        { name: "Ajustes", href: "/ajustes", icon: Settings },
    ];

    const profileColor = session?.user?.profileColor || "#6366f1";

    return (
        <div className="hidden md:flex flex-col w-64 glass border-r h-screen sticky top-0 p-6 z-20 transition-colors duration-300">
            <style jsx global>{`
                :root {
                    --primary: ${profileColor.startsWith('#') ? hexToHsl(profileColor) : "243.4 75.4% 58.6%"};
                }
            `}</style>

            <div className="flex items-center justify-between mb-10 text-foreground">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary" style={{ color: profileColor }}>
                        <Wallet className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Finanzas<span style={{ color: profileColor }}>AI</span></span>
                </div>
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex-1 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground mb-4 px-3 tracking-wider uppercase">Menu</div>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                ? "bg-primary/10 font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            style={isActive ? { color: profileColor, backgroundColor: `${profileColor}15` } : {}}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "" : "group-hover:text-primary transition-colors"}`} style={isActive ? { color: profileColor } : {}} />
                            {link.name}
                        </Link>
                    );
                })}
            </div>

            <div className="pt-6 border-t">
                <div className="flex items-center gap-3 px-3 mb-4">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shrink-0 overflow-hidden border border-white/10"
                        style={{ backgroundColor: profileColor }}
                    >
                        {session?.user?.profileIcon === "gender-male" ? <User2 className="w-5 h-5" /> :
                            session?.user?.profileIcon === "gender-female" ? <UserCircle className="w-5 h-5" /> :
                                session?.user?.profileIcon && session?.user?.profileIcon.length === 1 ? session?.user?.profileIcon :
                                    // @ts-ignore
                                    (session?.user?.nickname?.charAt(0) || session?.user?.phone?.charAt(0) || "U").toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold truncate">
                            {/* @ts-ignore */}
                            {session?.user?.nickname || session?.user?.phone}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">Sesión Activa</span>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}

// Helper to convert HEX to HSL format for CSS variables
function hexToHsl(hex: string): string {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
        }
        h /= 6;
    }

    return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}
