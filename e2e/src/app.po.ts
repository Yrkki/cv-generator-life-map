import { Page } from '@playwright/test';

export class AppPage {
  private readonly errors: string[] = [];

  constructor(private readonly page: Page) {
    this.page.on('console', msg => { if (msg.type() === 'error') this.errors.push(msg.text()); });
  }

  public async navigateTo(): Promise<void> {
    await this.page.goto('/');
  }

  public async getTitleText(): Promise<string> {
    return this.page.locator('app-root h1').first().innerText();
  }

  public async getParagraphText(): Promise<string> {
    return this.page.locator('app-root p').first().innerText();
  }

  public getBrowserErrors(): string[] {
    return this.errors;
  }
}
