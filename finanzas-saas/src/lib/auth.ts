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
                console.log(`Authorize attempt for phone: ${credentials?.phone}`);
                try {
                    if (!credentials?.phone || !credentials?.password) {
                        return null;
                    }

                    // Forzar búsqueda con string exacto
                    const phoneStr = String(credentials.phone).trim();

                    // @ts-ignore
                    let user = await prisma.user.findUnique({
                        where: { phone: phoneStr },
                    });

                    logAuth(`User found in DB: ${user ? "Yes (ID: " + user.id + ")" : "No"}`);

                    // Auto-register for simplified UX
                    if (!user) {
                        logAuth(`Creating new user with phone: ${phoneStr}`);
                        // @ts-ignore
                        user = await prisma.user.create({
                            data: {
                                phone: phoneStr,
                                password: credentials.password,
                            }
                        });
                        logAuth(`User created successfully. ID: ${user.id}`);
                    } else {
                        if (user.password !== credentials.password) {
                            logAuth("Error: Password mismatch");
                            return null;
                        }
                    }

                    logAuth("Authorize SUCCESS");
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
                    console.error("CRITICAL AUTH ERROR:", error);
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
