import { prisma } from "./prisma";
import { clasificarMovimiento } from "./openai";

export interface ProcessResult {
    success: boolean;
    data?: any;
    error?: string;
    category?: string;
    amount?: number;
    description?: string;
}

/**
 * Procesa un texto de transacción (ej: "+50000 Venta" o "10000 Almuerzo"),
 * lo clasifica con IA y lo guarda en la base de datos para el usuario especificado.
 */
export async function processTransactionText(userId: string, texto: string): Promise<ProcessResult> {
    try {
        if (!texto) {
            return { success: false, error: "Texto Requerido" };
        }

        // Detectar opcionalmente un signo, un número (que puede tener puntos de miles), y luego texto
        const match = texto.match(/^([+-]?)(\d+(?:[\.,]\d+)*)\s+(.+)$/);

        if (!match) {
            return {
                success: false,
                error: "Formato inválido. Usa: +monto descripción (ej: +200.000 Pago o 25000 Almuerzo)"
            };
        }

        const sign = match[1];
        const montoLimpio = match[2].replace(/\./g, "").replace(/,/g, ".");
        const monto = parseFloat(montoLimpio);
        const descripcion = match[3].trim();

        // Lógica de signo: "+" es ingreso, "-" o nada es gasto
        const tipo = sign === "+" ? "ingreso" : "gasto";

        // Llamada a OpenAI
        const categoria = await clasificarMovimiento(descripcion);

        // Fechas
        const date = new Date();
        const mes = date.getMonth() + 1; // 1-12
        const anio = date.getFullYear();

        // Guardar en DB
        const movimiento = await prisma.movimiento.create({
            data: {
                userId,
                monto,
                tipo,
                descripcion,
                categoria,
                fecha: date,
                mes,
                anio,
            }
        });

        return {
            success: true,
            data: movimiento,
            category: categoria,
            amount: monto,
            description: descripcion
        };
    } catch (error: any) {
        console.error("Error in processTransactionText:", error);
        return { success: false, error: error.message || "Error interno al procesar" };
    }
}
