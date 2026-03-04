const { Client } = require('pg');

const connectionString = "postgresql://postgres:Tarazona.0410@db.hcxyfougmvkadqrenxzl.supabase.co:5432/postgres";

async function testConnection() {
    const client = new Client({
        connectionString: connectionString,
        connectionTimeoutMillis: 5000,
    });

    try {
        console.log('Intentando conectar...');
        await client.connect();
        console.log('CONEXIÓN EXITOSA ✅');
        const res = await client.query('SELECT current_database(), current_user, version();');
        console.log('INFO DB:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('ERROR DE CONEXIÓN ❌:', err.message);
    }
}

testConnection();
