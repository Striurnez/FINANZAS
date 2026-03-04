const { OpenAI } = require("openai");

async function run() {
    const openai = new OpenAI({
        apiKey: "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",
        baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const CATEGORIAS_PERMITIDAS = [
        "Alimentación", "Transporte", "Vivienda", "Ocio",
        "Educación", "Salud", "Inversión", "Servicios",
        "Compras", "Otros"
    ];

    const descripcion = "gasolina";

    const prompt = `Clasifica el siguiente movimiento en una sola de estas categorías exactas:
[${CATEGORIAS_PERMITIDAS.join(", ")}]

TEXTO: "${descripcion}"

REGLA ESTRICTA: Devuelve ÚNICAMENTE el nombre de la categoría, sin comillas, sin puntos finales, y sin ninguna otra palabra adicional.`;

    try {
        const response = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b",
            // model: "meta/llama-3.1-8b-instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 1024,
        });

        console.log(JSON.stringify(response, null, 2));
    } catch (e) {
        console.error("API error:", e.message);
    }
}

run();
