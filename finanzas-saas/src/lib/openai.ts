import OpenAI from "openai";


export const CATEGORIAS_PERMITIDAS = [
    "Alimentación",
    "Transporte",
    "Vivienda",
    "Ocio",
    "Educación",
    "Salud",
    "Inversión",
    "Servicios",
    "Compras",
    "Otros",
];

export async function clasificarMovimiento(descripcion: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
        console.warn("OPENAI_API_KEY no configurada. Usando categoría 'Otros' por defecto.");
        return "Otros";
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const prompt = `
Clasifica el siguiente movimiento en una sola de estas categorías exactas:
[${CATEGORIAS_PERMITIDAS.join(", ")}]

TEXTO: "${descripcion}"

REGLA ESTRICTA: Devuelve ÚNICAMENTE el nombre de la categoría, sin comillas, sin puntos finales, y sin ninguna otra palabra adicional.`;

    try {
        console.log("=== ENVIANDO A NVIDIA AI ===");
        console.log("Descripción:", descripcion);
        console.log("Key Configurada:", !!process.env.OPENAI_API_KEY);

        const response = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 1024,
        });

        console.log("=== RESPUESTA OPENAI ===", response.choices[0]?.message?.content);

        let cat = response.choices[0]?.message?.content?.trim() || "Otros";

        // Limpiar posible puntuación (como un punto al final o comillas)
        cat = cat.replace(/[."']/g, "").trim();

        // Validar que la categoría devuelta esté en la lista (case-insensitive para mayor seguridad)
        const categoriaEncontrada = CATEGORIAS_PERMITIDAS.find(c => c.toLowerCase() === cat.toLowerCase());

        if (categoriaEncontrada) {
            cat = categoriaEncontrada;
        } else {
            console.warn(`Categoría no reconocida devuelta por IA: "${cat}". Cayendo a "Otros".`);
            cat = "Otros";
        }

        return cat;
    } catch (error: any) {
        console.error("=== ERROR AL CLASIFICAR CON OPENAI ===");
        console.error(error.message || error);
        throw new Error(`OpenAI Error: ${error.message || "Unknown error"}`);
    }
}
