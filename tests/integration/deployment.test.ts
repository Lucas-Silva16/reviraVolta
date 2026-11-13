import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { checkDatabase } from '../../scripts/deploy-database';

if (!new URL(process.env.TEST_DATABASE_URL!).pathname.startsWith('/reviravolta_test_')) throw new Error('Base não isolada.');
const app = new Pool({ connectionString: process.env.DATABASE_URL });
const reader = new Pool({ connectionString: process.env.RESEARCH_DATABASE_URL });
const owner = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
afterAll(async () => { await Promise.all([app.end(), reader.end(), owner.end()]); });
describe('verificação da base antes do deploy', () => {
  it('aceita apenas os dois papéis mínimos e confirma a mesma base', async () => {
    const appName = await checkDatabase(app, true);
    expect(await checkDatabase(reader, false)).toBe(appName);
  });
  it('recusa o proprietário como credencial runtime e um leitor usado como aplicação', async () => {
    await expect(checkDatabase(owner, true)).rejects.toThrow();
    await expect(checkDatabase(reader, true)).rejects.toThrow();
  });
});
