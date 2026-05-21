import { test as setup } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
	await page.goto('/');
	await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL ?? 'e2e@pars.test');
	await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD ?? 'E2ePass123!');
	await page.getByRole('button', { name: /sign in/i }).click();
	await page.waitForURL('**/feed');
	await page.context().storageState({ path: authFile });
});
