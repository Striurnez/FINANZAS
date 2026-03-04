import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processTransactionText } from "@/lib/transactions";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const from = formData.get("From") as string; // Ej: "whatsapp:+573001234567"
        const body = formData.get("Body") as string; // Ej: "+50000 Venta"

        if (!from || !body) {
            return new Response("Missing parameters", { status: 400 });
        }

        // Extraer solo los números del remitente para buscar en la DB
        const whatsappPhone = from.replace("whatsapp:", "").replace("+", "").trim();

        // Buscar usuario por teléfono
        // Nota: Intentamos match exacto o parcial dependiendo de cómo se guarden los números
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: whatsappPhone },
                    { phone: `+${whatsappPhone}` }
                ]
            }
        });

        if (!user) {
            console.warn(`Mensaje recibido de número no registrado: ${whatsappPhone}`);
            return generateTwilioResponse("Lo siento, tu número no está registrado en Cashora. Por favor regístrate en la app primero.");
        }

        // Procesar la transacción
        const result = await processTransactionText(user.id, body);

        if (!result.success) {
            return generateTwilioResponse(`❌ Error: ${result.error || "No pudimos procesar tu mensaje. Intenta con: +monto descripción"}`);
        }

        // Respuesta de éxito
        const confirmMsg = `✅ *¡Registro Exitoso!*

💰 *Monto:* $${result.amount?.toLocaleString('es-CO')}
📝 *Descripción:* ${result.description}
🏷️ *Categoría:* ${result.category}

Tu balance ha sido actualizado automáticamente.`;

        return generateTwilioResponse(confirmMsg);

    } catch (error: any) {
        console.error("WhatsApp Webhook Error:", error);
        return generateTwilioResponse("Hubo un error técnico procesando tu mensaje. Por favor intenta más tarde.");
    }
}

/**
 * Genera una respuesta en formato TwiML para Twilio
 */
function generateTwilioResponse(message: string) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${message}</Message>
</Response>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "text/xml",
        },
    });
}
