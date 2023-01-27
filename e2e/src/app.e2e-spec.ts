import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

// eslint-disable-next-line max-lines-per-function
describe('workspace-project App', () => {
  let page: AppPage;

  const appTitle = 'Life Map';

  beforeEach(() => {
    page = new AppPage();
  });

  it('should have as title "Life Map"', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual(appTitle);
  });

  it('should display welcome message', async () => {
    await page.navigateTo();
    expect(await page.getParagraphText()).toEqual(`You are browsing the ${appTitle} service. 🗿`);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
