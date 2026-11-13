import 'dotenv/config';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.MIGRATION_DATABASE_URL });
try {
  for (const [role, variable] of [['reviravolta_app', 'APP_DB_PASSWORD'], ['reviravolta_reader', 'READER_DB_PASSWORD']]) {
    const password = process.env[variable];
    if (!password || !/^[a-f0-9]{64}$/.test(password)) throw new Error(`${variable} deve ter 32 bytes hexadecimais.`);
    // Identificadores fixos e palavra-passe estritamente hexadecimal, sem entrada de pedidos.
    const found = await pool.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [role]);
    await pool.query(`${found.rowCount ? 'ALTER' : 'CREATE'} ROLE ${role} LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE`);
  }
  await pool.query('REVOKE ALL ON TABLE enchimentos FROM PUBLIC, reviravolta_app, reviravolta_reader; REVOKE ALL ON TABLE admin_login_throttle FROM PUBLIC, reviravolta_app, reviravolta_reader; REVOKE CREATE ON SCHEMA public FROM PUBLIC; GRANT USAGE ON SCHEMA public TO reviravolta_app, reviravolta_reader; GRANT SELECT, INSERT, DELETE ON enchimentos TO reviravolta_app; GRANT SELECT ON enchimentos TO reviravolta_reader; GRANT SELECT, UPDATE ON admin_login_throttle TO reviravolta_app; ALTER ROLE reviravolta_reader SET default_transaction_read_only = on');
  console.log('Papéis criados: aplicação SELECT/INSERT/DELETE nos enchimentos e SELECT/UPDATE no limite técnico de login; docente apenas SELECT nos enchimentos. Sem DDL.');
} catch {
  console.error('Não foi possível configurar os papéis. Verifique a migração, as credenciais e a ligação.'); process.exitCode = 1;
} finally { await pool.end(); }
