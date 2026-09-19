const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.xegsdlkpdwwmojdatuwb:iTI6MBFuBxvDZaJ9@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';

async function main() {
  console.log('🚀 Connecting to Supabase PostgreSQL at aws-0-ap-northeast-2.pooler.supabase.com...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to Supabase Database!');

    // Test query
    const res = await client.query('SELECT current_database(), current_user, version();');
    console.log(`📌 Connected to DB: ${res.rows[0].current_database} as User: ${res.rows[0].current_user}`);

    // Files to run in sequence
    const files = [
      { name: '001_initial_schema.sql', path: path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql') },
      { name: '002_functions_and_triggers.sql', path: path.join(__dirname, '..', 'supabase', 'migrations', '002_functions_and_triggers.sql') },
      { name: '003_rls_policies.sql', path: path.join(__dirname, '..', 'supabase', 'migrations', '003_rls_policies.sql') },
      { name: 'seed.sql', path: path.join(__dirname, '..', 'supabase', 'seed.sql') }
    ];

    for (const file of files) {
      console.log(`\n⏳ Executing migration: ${file.name}...`);
      if (!fs.existsSync(file.path)) {
        throw new Error(`File not found: ${file.path}`);
      }
      const sql = fs.readFileSync(file.path, 'utf8');
      await client.query(sql);
      console.log(`✅ Successfully applied: ${file.name}`);
    }

    // Verify database tables and data
    console.log('\n📊 Verifying Supabase Database Tables & Records:');
    const tables = [
      'profiles',
      'categories',
      'subjects',
      'grades',
      'class_locations',
      'commission_rules',
      'platform_settings',
      'audit_logs'
    ];

    for (const table of tables) {
      try {
        const countRes = await client.query(`SELECT count(*) FROM ${table};`);
        console.log(`  ✓ Table '${table}': ${countRes.rows[0].count} records`);
      } catch (err) {
        console.warn(`  ⚠️ Table '${table}' count query issue: ${err.message}`);
      }
    }

    console.log('\n🎉 ALL DATABASE MIGRATIONS, TRIGGERS, RLS POLICIES & SEEDS APPLIED SUCCESSFULLY TO SUPABASE!');
  } catch (err) {
    console.error('❌ Database migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
