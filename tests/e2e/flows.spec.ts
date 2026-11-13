import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHmac, randomBytes } from 'node:crypto';
async function assign(page: import('@playwright/test').Page, variant: 'A' | 'B') {
  let token: string, h: string;
  do { token = randomBytes(32).toString('hex'); h = createHmac('sha256', Buffer.from(process.env.TOKEN_HMAC_SECRET!, 'hex')).update(token).digest('hex'); } while ((parseInt(h.slice(0, 2), 16) % 2 === 0 ? 'A' : 'B') !== variant);
  await page.context().addCookies([{ name: 'rv-participant', value: token, url: process.env.TEST_BASE_URL!, httpOnly: true, sameSite: 'Strict' }]);
}
test('percurso móvel: registo, persistência, meta voluntária e eliminação', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await assign(page, 'A');
  await page.goto('/'); await page.getByLabel('Curso ou ligação à UMa').selectOption('Engenharia Informática');
  await page.getByRole('button', { name: 'Registar enchimento', exact: true }).click();
  await expect(page.getByText('0,5 L registados.')).toBeVisible(); await page.getByRole('link', { name: 'Ver o meu impacto' }).click();
  await expect(page.getByText('1 enchimento registado', { exact: true })).toBeVisible(); await expect(page.getByTestId('collective-module')).toHaveCount(0);
  await page.getByRole('button', { name: 'Definir meta' }).click(); await expect(page.getByRole('progressbar', { name: 'Progresso para a tua meta pessoal' })).toHaveAttribute('value', '0.5');
  await page.reload(); await expect(page.getByRole('button', { name: 'Retirar meta' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/privacidade'); await page.getByRole('button', { name: 'Eliminar o meu histórico' }).click(); await expect(page.getByRole('button', { name: 'Confirmar eliminação' })).toBeDisabled();
  await page.getByLabel('Compreendo que todos os meus registos serão eliminados.').check(); await page.getByRole('button', { name: 'Confirmar eliminação' }).click(); await expect(page.getByRole('status')).toContainText('1 registo eliminado');
  await page.goto('/impacto'); await expect(page.getByText('0 enchimentos registados', { exact: true })).toBeVisible();
});
test('versão B acrescenta apenas o módulo coletivo protegido', async ({ page }) => {
  await assign(page, 'B'); await page.goto('/impacto'); await expect(page.getByTestId('collective-module')).toBeVisible(); await expect(page.getByText(/O progresso só é mostrado/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Uma meta tua. Uma escolha tua.' })).toBeVisible();
});
test('docente consulta painel real, descarrega CSV e imprime QR', async ({ page }) => {
  await page.goto('/admin'); await page.getByLabel('Utilizador', { exact: true }).fill('docente'); await page.getByLabel('Palavra-passe', { exact: true }).fill(process.env.TEST_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar no painel' }).click(); await expect(page.getByRole('heading', { name: 'O projeto, em dados.' })).toBeVisible(); await expect(page.getByRole('heading', { name: 'Experiência A/B' })).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('link', { name: 'Exportar CSV' }).click(); expect((await download).suggestedFilename()).toContain('development');
  await page.getByRole('link', { name: 'Imprimir QR' }).click(); await expect(page.getByRole('img', { name: /QR code para/ })).toBeVisible(); await expect(page.getByRole('button', { name: 'Imprimir cartaz' })).toBeVisible();
  await page.emulateMedia({ media: 'print' }); await expect(page.locator('.site-header')).toBeHidden();
});
test('acessibilidade automática, navegação por teclado e layout sem overflow', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('button', { name: 'Registar enchimento', exact: true })).toBeEnabled();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze(); expect(results.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  await page.screenshot({ path: '.local/qa-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 }); await page.screenshot({ path: '.local/qa-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/'); await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Saltar para o conteúdo' })).toBeFocused();
  for (const route of ['/impacto', '/sobre', '/privacidade']) {
    await page.goto(route);
    if (route === '/impacto') await expect(page.getByRole('heading', { name: 'Uma meta tua. Uma escolha tua.' })).toBeVisible();
    const check = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(check.violations.map(v => ({ route, id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
