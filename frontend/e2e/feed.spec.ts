import { test, expect } from '@playwright/test';

test.describe('Feed page', () => {
	test('loads feed with posts', async ({ page }) => {
		await page.goto('/feed');
		await expect(page).toHaveURL(/feed/);
		// Feed container should be visible
		await expect(page.getByRole('main')).toBeVisible();
	});

	test('navigate to own profile', async ({ page }) => {
		await page.goto('/feed');
		await page.getByRole('link', { name: /profile/i }).first().click();
		await expect(page).toHaveURL(/\/u\//);
	});
});
