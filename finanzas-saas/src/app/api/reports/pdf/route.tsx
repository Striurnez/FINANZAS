import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReactPDF, { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1"
});

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica' },
    header: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#111827' },
    section: { margin: 10, padding: 10, borderBottom: '1 solid #E5E7EB' },
    title: { fontSize: 16, marginBottom: 10, color: '#374151', fontWeight: 'bold' },
    text: { fontSize: 12, marginBottom: 5, color: '#4B5563' },
    alert: { fontSize: 12, color: '#DC2626', marginBottom: 5 },
    success: { fontSize: 12, color: '#059669', marginBottom: 5 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 5 },
    tableCell: { fontSize: 12, width: '50%' },
});

// Helper for currency formatting
const formatCOP = (val: number) => `$${val.toLocaleString('es-CO')}`;

// PDF Component Definition
const ReportDocument = ({ data, iaRecommendation }: any) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.header}>Reporte Financiero Mensual - {data.mes}/{data.anio}</Text>

            <View style={styles.section}>
                <Text style={styles.title}>Resumen</Text>
                <Text style={styles.text}>Ingresos Totales: {formatCOP(data.ingresos)}</Text>
                <Text style={styles.text}>Gastos Totales: {formatCOP(data.gastos)}</Text>
                <Text style={styles.text}>Balance Neto: {formatCOP(data.ingresos - data.gastos)}</Text>
                <Text style={styles.text}>Ahorro: {data.ahorroPorcentaje.toFixed(1)}%</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Gastos por Categoría</Text>
                {Object.entries(data.gastosPorCategoria).map(([cat, total]: any) => (
                    <View key={cat} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{cat}</Text>
                        <Text style={styles.tableCell}>{formatCOP(total)}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Alertas Inteligentes</Text>
                {data.alertas.length === 0 ? <Text style={styles.success}>Todo se ve excelente. No hay alertas.</Text> : null}
                {data.alertas.map((alerta: string, i: number) => (
                    <Text key={i} style={styles.alert}>• {alerta}</Text>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Recomendaciones de IA</Text>
                <Text style={styles.text}>{iaRecommendation}</Text>
            </View>
        </Page>
    </Document>
);

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const date = new Date();

        // Corregido: Default al mes actual
        let qMes = searchParams.get("mes") ? parseInt(searchParams.get("mes") as string) : date.getMonth() + 1;
        let qAnio = searchParams.get("anio") ? parseInt(searchParams.get("anio") as string) : date.getFullYear();

        const movimientos = await prisma.movimiento.findMany({
            where: { userId: session.user.id, mes: qMes, anio: qAnio },
        });

        const ingresos = movimientos.filter(m => m.tipo === "ingreso").reduce((a, b) => a + b.monto, 0);
        const gastos = movimientos.filter(m => m.tipo === "gasto").reduce((a, b) => a + b.monto, 0);
        const ahorroPorcentaje = ingresos > 0 ? ((ingresos - gastos) / ingresos) * 100 : 0;

        const gastosPorCategoria = movimientos.filter(m => m.tipo === "gasto").reduce((acc: any, m) => {
            acc[m.categoria] = (acc[m.categoria] || 0) + m.monto;
            return acc;
        }, {});

        const alertas = [];
        if (gastos > ingresos && ingresos > 0) alertas.push("Tus gastos han superado tus ingresos.");
        if (ahorroPorcentaje < 10 && ingresos > 0) alertas.push("Tu nivel de ahorro es bajo (<10%).");

        // OpenAI Recommendation con configuración NVIDIA
        let iaRecommendation = "Manejo financiero estándar. Sigue monitoreando tus gastos.";
        try {
            if (process.env.OPENAI_API_KEY) {
                const prompt = `Actúa como asesor financiero experto para este reporte mensual de finanzas personales. 
                Datos del mes: Ingresos $${ingresos}, Gastos $${gastos}. 
                Gastos por categoría: ${JSON.stringify(gastosPorCategoria)}. 
                Genera 2 recomendaciones breves y prácticas para mejorar. 
                Responde en español, máximo 2 oraciones, texto plano.`;

                const response = await openai.chat.completions.create({
                    model: "openai/gpt-oss-120b",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.2, // Más determinístico
                    max_tokens: 1024
                });
                iaRecommendation = response.choices[0]?.message?.content || iaRecommendation;
            }
        } catch (e) {
            console.error("OpenAI error en recomendación (NVIDIA NIM):", e);
        }

        const reportData = {
            mes: qMes, anio: qAnio, ingresos, gastos, ahorroPorcentaje, gastosPorCategoria, alertas
        };

        // Generar PDF Buffer
        const stream = await ReactPDF.renderToStream(<ReportDocument data={reportData} iaRecommendation={iaRecommendation} />);

        // Transformar NodeJS ReadableStream a Uint8Array => Web Response
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="reporte-${qMes}-${qAnio}.pdf"`,
            },
        });

    } catch (error) {
        console.error("Error al generar PDF:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
