import { expect, type APIRequestContext, type Page } from '@playwright/test';

const API_ORIGIN = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export interface FinanceCredentials {
  email: string;
  password: string;
  name?: string;
}

interface LoginUser {
  id: string;
  email: string;
  name: string;
}

export function financeUserFromEnv(): FinanceCredentials {
  return {
    email: process.env.FINANCE_USER_EMAIL ?? 'finance.integration@example.com',
    password: process.env.FINANCE_USER_PASSWORD ?? 'FinanceTest1!',
    name: 'Finance Integration User',
  };
}

export function otherFinanceUserFromEnv(): FinanceCredentials {
  return {
    email: process.env.FINANCE_OTHER_USER_EMAIL ?? 'finance.other@example.com',
    password: process.env.FINANCE_OTHER_USER_PASSWORD ?? 'FinanceOtherTest1!',
    name: 'Finance Other Integration User',
  };
}

export async function resolveRuntimeUser(
  request: APIRequestContext,
  credentials: FinanceCredentials,
): Promise<{ accessToken: string; user: LoginUser & { role: string } }> {
  const loginResponse = await request.post(`${API_ORIGIN}/api/v1/auth/login`, {
    data: { email: credentials.email, password: credentials.password },
  });
  expect(loginResponse.ok(), 'login must succeed with the fixture password').toBeTruthy();
  const loginBody = (await loginResponse.json()) as {
    accessToken: string;
    refreshToken: string;
    user: LoginUser;
  };
  expect(loginBody.user).toMatchObject({ email: credentials.email });
  expect(loginBody.user).not.toHaveProperty('role');
  expect(loginBody).not.toHaveProperty('user.role');

  const meResponse = await request.get(`${API_ORIGIN}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${loginBody.accessToken}` },
  });
  expect(meResponse.ok()).toBeTruthy();
  const meBody = (await meResponse.json()) as { user: LoginUser & { role: string } };
  expect(meBody.user.id).toBe(loginBody.user.id);
  expect(meBody.user.email).toBe(credentials.email);
  expect(meBody.user.name).toBe(loginBody.user.name);
  expect(meBody.user.role).toBe('READ_ONLY');

  return { accessToken: loginBody.accessToken, user: meBody.user };
}

export async function loginViaUi(page: Page, credentials: FinanceCredentials): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Correo').fill(credentials.email);
  await page.getByLabel('Contraseña').fill(credentials.password);
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page.getByRole('navigation', { name: /principal/i })).toBeVisible();
}
