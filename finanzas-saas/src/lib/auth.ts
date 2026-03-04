import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                phone: { label: "Teléfono", type: "text", placeholder: "3001234567" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                console.log(`[AUTH] Login attempt for phone: ${credentials?.phone}`);
                try {
                    if (!credentials?.phone || !credentials?.password) {
                        console.log("[AUTH] Error: Missing phone or password");
                        return null;
                    }

                    const phoneStr = String(credentials.phone).trim();
                    console.log(`[AUTH] Searching for user: ${phoneStr}`);

                    // Intentar búsqueda con el formato recibido
                    // @ts-ignore
                    let user = await prisma.user.findUnique({
                        where: { phone: phoneStr },
                    });

                    // Si no se encuentra y el número tiene el prefijo +57, 
                    // intentamos buscarlo sin el prefijo (compatibilidad con usuarios antiguos)
                    if (!user && phoneStr.startsWith("+57")) {
                        const noPrefix = phoneStr.replace("+57", "");
                        console.log(`[AUTH] User not found with prefix. Trying without: ${noPrefix}`);
                        // @ts-ignore
                        user = await prisma.user.findUnique({
                            where: { phone: noPrefix },
                        });

                        // Si lo encontramos sin prefijo, lo actualizamos al nuevo formato automáticamente
                        if (user) {
                            console.log(`[AUTH] User found without prefix. Migrating to: ${phoneStr}`);
                            // @ts-ignore
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { phone: phoneStr }
                            });
                        }
                    }

                    console.log(`[AUTH] DB Result: ${user ? "User found (ID: " + user.id + ")" : "User NOT found"}`);

                    if (!user) {
                        console.log(`[AUTH] Triggering Auto-registration for: ${phoneStr}`);
                        try {
                            // @ts-ignore
                            user = await prisma.user.create({
                                data: {
                                    phone: phoneStr,
                                    password: credentials.password,
                                }
                            });
                            console.log(`[AUTH] Auto-registration SUCCESS (ID: ${user.id})`);

                            // Enviar mensaje de bienvenida por WhatsApp de forma asíncrona
                            const welcomeMsg = `¡Hola! Bienvenido a *Cashora* 🚀\n\nDesde ahora puedes enviarme tus gastos e ingresos por aquí para monitorear tus finanzas más fácil.\n\n*¿Cómo usarme?*\n• Para un gasto: \`20000 café\`\n• Para un ingreso: \`+500000 sueldo\`\n\n¡Espero ayudarte a ahorrar mucho! 😊`;

                            // Importación dinámica fuera del flujo principal
                            import("./twilio").then(m => {
                                m.sendWhatsAppMessage(phoneStr, welcomeMsg);
                            }).catch(err => console.error("[AUTH] Error sending welcome message:", err));

                        } catch (createError: any) {
                            console.error("[AUTH] Auto-registration FAILED:", createError.message || createError);
                            throw new Error(`Auto-registration failed: ${createError.message}`);
                        }
                    } else {
                        if (user.password !== credentials.password) {
                            console.log(`[AUTH] Error: Password mismatch for user ${phoneStr}`);
                            return null;
                        }
                        console.log(`[AUTH] Password matched for user ${phoneStr}`);
                    }

                    console.log("[AUTH] Authorize status: SUCCESS");
                    return {
                        id: user.id,
                        // @ts-ignore
                        phone: user.phone,
                        email: user.email,
                        nickname: user.nickname,
                        profileIcon: user.profileIcon,
                        profileColor: user.profileColor
                    };
                } catch (error: any) {
                    console.error("[AUTH] CRITICAL ERROR during authorize:", error.message || error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.phone = user.phone;
                // @ts-ignore
                token.nickname = user.nickname;
                // @ts-ignore
                token.profileIcon = user.profileIcon;
                // @ts-ignore
                token.profileColor = user.profileColor;
            }

            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // @ts-ignore
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.phone = token.phone as string;
                // @ts-ignore
                session.user.nickname = token.nickname as string;
                // @ts-ignore
                session.user.profileIcon = token.profileIcon as string;
                // @ts-ignore
                session.user.profileColor = token.profileColor as string;
            }
            return session;
        }
    }
};
