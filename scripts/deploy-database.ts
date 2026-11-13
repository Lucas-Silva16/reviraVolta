import type { Pool } from 'pg';

export async function checkDatabase(pool: Pool, app: boolean): Promise<string> {
    const { rows: [p] } = await pool.query(`SELECT current_database() AS database,
      (rolsuper OR rolcreatedb OR rolcreaterole) AS elevated,
      has_schema_privilege(current_user, 'public', 'CREATE') AS create_schema,
      has_table_privilege(current_user, 'enchimentos', 'SELECT') AS read,
      has_table_privilege(current_user, 'enchimentos', 'INSERT') AS insert,
      has_table_privilege(current_user, 'enchimentos', 'DELETE') AS delete,
      has_table_privilege(current_user, 'enchimentos', 'UPDATE') AS update,
      has_table_privilege(current_user, 'enchimentos', 'TRUNCATE') AS truncate,
      has_table_privilege(current_user, 'admin_login_throttle', 'SELECT') AS throttle_read,
      has_table_privilege(current_user, 'admin_login_throttle', 'UPDATE') AS throttle_update,
      has_table_privilege(current_user, 'admin_login_throttle', 'INSERT') AS throttle_insert,
      has_table_privilege(current_user, 'admin_login_throttle', 'DELETE') AS throttle_delete,
      has_table_privilege(current_user, 'admin_login_throttle', 'TRUNCATE') AS throttle_truncate
      FROM pg_roles WHERE rolname = current_user`);
    if (!p || p.elevated || p.create_schema || !p.read || p.update || p.truncate || p.insert !== app || p.delete !== app || p.throttle_read !== app || p.throttle_update !== app || p.throttle_insert || p.throttle_delete || p.throttle_truncate) throw new Error();
    // Confirma o esquema sem ler registos de participantes nem consumir uma tentativa de login.
    await pool.query('SELECT id, token_hash, curso, quantidade_litros, created_at FROM enchimentos LIMIT 0');
    if (app) {
      const { rowCount } = await pool.query('SELECT id FROM admin_login_throttle WHERE id = 1');
      if (rowCount !== 1) throw new Error();
    }
    return p.database;
}
