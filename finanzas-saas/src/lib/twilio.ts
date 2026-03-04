import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"; // Sandbox por defecto

/**
 * Envía un mensaje de WhatsApp a un número específico
 * @param to Número de destino (ej: +573001234567)
 * @param message Contenido del mensaje
 */
export async function sendWhatsAppMessage(to: string, message: string) {
    if (!accountSid || !authToken) {
        console.warn("TWILIO_ACCOUNT_SID o TWILIO_AUTH_TOKEN no configurados. No se enviará mensaje.");
        return null;
    }

    const client = twilio(accountSid, authToken);

    try {
        // Asegurar formato whatsapp:+...
        const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to.startsWith("+") ? to : `+${to}`}`;

        const response = await client.messages.create({
            body: message,
            from: fromWhatsApp,
            to: formattedTo
        });

        console.log(`[TWILIO] Mensaje enviado a ${formattedTo}. SID: ${response.sid}`);
        return response;
    } catch (error: any) {
        console.error("[TWILIO] Error al enviar mensaje:", error.message || error);
        return null;
    }
}
