const { Client } = require('pg');

const connectionString = "postgresql://postgres.hcxyfougmvkadqrenxzl:Tarazona.0410@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

async function verifyConnection() {
    const client = new Client({
        connectionString: connectionString,
        connectionTimeoutMillis: 10000,
    });

    try {
        console.log('Verificando conexión con el link del usuario...');
        await client.connect();
        console.log('CONEXIÓN EXITOSA ✅');
        const res = await client.query('SELECT count(*) FROM "User";');
        console.log('Usuarios en la tabla:', res.rows[0].count);
        await client.end();
    } catch (err) {
        console.error('ERROR DE VERIFICACIÓN ❌:', err.message);
    }
}

verifyConnection();
