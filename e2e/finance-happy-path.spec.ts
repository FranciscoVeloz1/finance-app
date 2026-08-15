import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import {
  financeUserFromEnv,
  loginViaUi,
  otherFinanceUserFromEnv,
  resolveRuntimeUser,
} from './helpers/login';

const janFeb = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures/jan-feb-summary.snapshot.json'), 'utf8'),
) as {
  january: { periodId: string; expectedSavings: string };
  february: { periodId: string; expectedSavings: string };
};

const API_ORIGIN = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const MARCH = '4bc02a91-6ad8-4627-8ab9-01c3ee0a1003';
const APRIL = '4bc02a91-6ad8-4627-8ab9-01c3ee0a1004';

test.describe('finance happy path', () => {
  test.describe.configure({ mode: 'serial' });

test('login shows the March savings hero', async ({ page, request }) => {
  const credentials = financeUserFromEnv();
  const runtime = await resolveRuntimeUser(request, credentials);
  expect(runtime.user.email).toBe(credentials.email);
  await loginViaUi(page, credentials);
  await expect(page.getByText(/29,650\.00/).first()).toBeVisible();
});

test('editing March extras confirms propagation to $28,150.00', async ({ page, request }) => {
  const credentials = financeUserFromEnv();
  await resolveRuntimeUser(request, credentials);
  await loginViaUi(page, credentials);
  await page.getByRole('link', { name: /detalle de mes/i }).first().click();
  await page.getByRole('button', { name: /editar extra marzo/i }).click();
  const realAmount = page.getByLabel('Monto real');
  await realAmount.fill('2000');
  await page.getByRole('button', { name: /guardar/i }).click();
  await expect(page.getByRole('heading', { name: /impacto en meses futuros/i })).toBeVisible();
  await page.getByRole('button', { name: /confirmar propagación/i }).click();
  await expect(page.getByText(/28,150\.00/).first()).toBeVisible();

  const session = await resolveRuntimeUser(request, credentials);
  const january = await request.get(
    `${API_ORIGIN}/api/v1/finance/periods/${janFeb.january.periodId}/summary`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } },
  );
  const february = await request.get(
    `${API_ORIGIN}/api/v1/finance/periods/${janFeb.february.periodId}/summary`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } },
  );
  expect((await january.json()).summary.totals.expectedSavings).toBe(janFeb.january.expectedSavings);
  expect((await february.json()).summary.totals.expectedSavings).toBe(janFeb.february.expectedSavings);
});

test('April credit payment does not add $3,500.00 of actual expense', async ({ page, request }) => {
  const credentials = financeUserFromEnv();
  await resolveRuntimeUser(request, credentials);
  await loginViaUi(page, credentials);
  await page.goto(`/?periodo=${APRIL}`);
  const gasto = page.getByRole('region', { name: /gasto del periodo/i });
  await expect(gasto.getByText('Real')).toBeVisible();
  await expect(gasto.getByText(/3[,.]500/)).toHaveCount(0);
});

test('logout returns to login and blocks the dashboard', async ({ page, request }) => {
  const credentials = financeUserFromEnv();
  await resolveRuntimeUser(request, credentials);
  await loginViaUi(page, credentials);
  await page.getByRole('button', { name: /menú de usuario/i }).click();
  await page.getByRole('menuitem', { name: /cerrar sesión/i }).click();
  await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();

  const other = otherFinanceUserFromEnv();
  const otherSession = await resolveRuntimeUser(request, other);
  const foreign = await request.get(`${API_ORIGIN}/api/v1/finance/periods/${MARCH}/summary`, {
    headers: { Authorization: `Bearer ${otherSession.accessToken}` },
  });
  expect(foreign.status()).toBe(404);
});
});
