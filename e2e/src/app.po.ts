import { browser, by, element } from 'protractor';

export class AppPage {
  public async navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl);
  }

  public async getTitleText(): Promise<string> {
    return element.all(by.css('app-root h1')).first().getText();
  }

  public async getParagraphText(): Promise<string> {
    return element.all(by.css('app-root p')).first().getText();
  }
}
