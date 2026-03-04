const { Client } = require('pg');

// Formato Pooler con opciones de tenant
const connectionString = "postgresql://postgres:Tarazona.0410@aws-0-us-east-1.pooler.supabase.com:6543/postgres?options=project%3Dhcxyfougmvkadqrenxzl";

async function testPooler() {
    const client = new Client({
        connectionString: connectionString,
        connectionTimeoutMillis: 10000,
    });

    try {
        console.log('Intentando conectar al POOLER...');
        await client.connect();
        console.log('CONEXIÓN EXITOSA AL POOLER ✅');
        const res = await client.query('SELECT current_database(), current_user, version();');
        console.log('INFO DB:', res.rows[0]);

        // Check if User table exists
        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
        console.log('Tablas encontradas:', tables.rows.map(t => t.table_name));

        await client.end();
    } catch (err) {
        console.error('ERROR POOLER ❌:', err.message);
    }
}

testPooler();
