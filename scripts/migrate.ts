import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Client } = pg;

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const isLocal =
  connectionString.includes('127.0.0.1') || connectionString.includes('localhost');

async function runMigration() {
  console.log(' Connecting to PostgreSQL at:', isLocal ? connectionString : connectionString.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(' Connected to Postgres database.');

    const sqlPath = path.resolve(process.cwd(), 'supabase', 'schema.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Schema file not found at ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(' Executing schema.sql migration and seeding tables...');
    await client.query(sql);
    console.log(' Migration & seeding completed successfully!');

    // Test row counts
    const resUsers = await client.query('SELECT count(*) FROM csmp_users');
    const resRequests = await client.query('SELECT count(*) FROM csmp_requests');
    const resPermissions = await client.query('SELECT count(*) FROM csmp_role_permissions');
    const resAudit = await client.query('SELECT count(*) FROM csmp_audit_logs');
    const resNotifs = await client.query('SELECT count(*) FROM csmp_notifications');

    console.log('\n Database Summary:');
    console.log(`  - Users: ${resUsers.rows[0].count}`);
    console.log(`  - Requests: ${resRequests.rows[0].count}`);
    console.log(`  - Role Permissions: ${resPermissions.rows[0].count}`);
    console.log(`  - Audit Logs: ${resAudit.rows[0].count}`);
    console.log(`  - Notifications: ${resNotifs.rows[0].count}`);
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED' && isLocal) {
      console.error('\n Migration Error: Local PostgreSQL is not running on 127.0.0.1:54322.');
      console.log('\n How to proceed:');
      console.log('  Option 1 (Fastest for Supabase Cloud - Recommended):');
      console.log('    1. Open your Supabase Cloud Dashboard (https://supabase.com/dashboard)');
      console.log('    2. Go to the "SQL Editor" tab.');
      console.log('    3. Paste the contents of "supabase/schema.sql" and click "Run".\n');
      console.log('  Option 2 (Via CLI):');
      console.log('    1. In your Supabase Dashboard, go to Project Settings > Database.');
      console.log('    2. Copy the "URI" connection string (under Connection Pooling, Port 6543 or 5432).');
      console.log('    3. In your .env.local file, set:');
      console.log('       DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"');
      console.log('    4. Run "npm run db:migrate" again.\n');
    } else {
      console.error('\n Migration failed:', err.message || err);
    }
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

runMigration();
