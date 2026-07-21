import { test, expect } from '@playwright/test';
import { AppPage } from './app.po';

test.describe('workspace-project App', () => {
  const appTitle = 'Life Map';
  const welcomeMessage = `You are browsing the ${appTitle} service. 🗿`;

  let page: AppPage;

  test.beforeEach(({ page: p }) => {
    page = new AppPage(p);
  });

  test('should have as title "Life Map"', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual(appTitle);
  });

  test('should display welcome message', async () => {
    await page.navigateTo();
    expect(await page.getParagraphText()).toEqual(welcomeMessage);
  });

  test('should have no severe browser errors', async () => {
    await page.navigateTo();
    expect(page.getBrowserErrors()).toHaveLength(0);
  });
});
