/**
 * Migration: add extended columns to orders table.
 * Run: node src/run_migration.js
 *
 * Uses the Supabase service role to call a stored procedure for raw SQL.
 * If the exec_sql RPC doesn't exist, prints the SQL to run manually in
 * Supabase Dashboard → SQL Editor.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const https = require('https');

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

if (!supabaseUrl || !serviceKey) {
  console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

// ─── The SQL migration ────────────────────────────────────────────────────
const MIGRATION_SQL = [
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount numeric DEFAULT 0",
  "ALTER TABLE orders ADD COLUMN IF NOT EXISTS timeline jsonb DEFAULT '[]'::jsonb"
].join(';\n') + ';';

// ─── Try via Supabase REST RPC ────────────────────────────────────────────
function callSupabaseRpc(funcName, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(params);
    const options = {
      hostname: projectRef + '.supabase.co',
      path: '/rest/v1/rpc/' + funcName,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + serviceKey,
        'apikey': serviceKey,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Try pg direct connection ─────────────────────────────────────────────
async function tryPgDirect() {
  const { Pool } = require('pg');

  const hosts = [
    'db.' + projectRef + '.supabase.co',
    projectRef + '.supabase.co',
    'aws-0-ap-south-1.pooler.supabase.com'
  ];
  const users = [
    'postgres',
    'postgres.' + projectRef
  ];

  for (const host of hosts) {
    for (const user of users) {
      try {
        const pool = new Pool({
          host, port: 5432, database: 'postgres',
          user, password: serviceKey,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000
        });
        const client = await pool.connect();
        const sqls = MIGRATION_SQL.split(';').map(s => s.trim()).filter(Boolean);
        for (const sql of sqls) {
          await client.query(sql);
          console.log('✅ Applied:', sql.slice(0, 70));
        }
        client.release();
        pool.end();
        return true;
      } catch (e) {
        // try next
      }
    }
  }
  return false;
}

async function main() {
  console.log('niharikartist — Orders Table Migration');
  console.log('======================================\n');

  // Try pg direct first
  console.log('Attempting direct PostgreSQL connection...');
  const pgOk = await tryPgDirect();
  if (pgOk) {
    console.log('\n✅ Migration completed via direct PostgreSQL connection.');
    return;
  }

  // Try Supabase RPC
  console.log('Direct PG not reachable. Trying Supabase RPC...');
  try {
    const result = await callSupabaseRpc('exec_sql', { query: MIGRATION_SQL });
    if (result.status === 200 || result.status === 204) {
      console.log('✅ Migration completed via Supabase RPC.');
      return;
    }
    console.log('RPC returned:', result.status, result.body);
  } catch (e) {
    console.log('RPC attempt failed:', e.message);
  }

  // Print manual instructions
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('⚠️  Automated migration could not run.');
  console.log('Please run the following SQL manually in Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('\n── COPY THIS SQL ─────────────────────────────────────────\n');
  console.log(MIGRATION_SQL);
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('\nNOTE: Orders will still save correctly without this migration.');
  console.log('The migration only adds tracking_number, subtotal, shipping_fee,');
  console.log('discount, and timeline columns for richer order data.\n');
}

main().catch(e => {
  console.error('Unexpected error:', e.message);
  process.exit(1);
});
