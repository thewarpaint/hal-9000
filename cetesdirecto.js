import puppeteer from 'puppeteer';

const {
  CETESDIRECTO_PASSWORD,
  CETESDIRECTO_USERNAME,
} = process.env;

const selectors = {
  checkUsernameBtn: '#continuarBtn',
  loginBtn: '#accederBtn',
  logoutLink: '#btnsUserWeb [data-name="cerrarSesion"]:nth-child(4)',
  passwordInput: '#pwdId',
  portfolioLink: '#portafolioMenu',
  totalInstrumentsText: '.totalInstrumentos .totalInstrumentosNumeros .txtInstrumento',
  usernameInput: '#userId',
};

const urls = {
  login: 'https://www.cetesdirecto.com/SSOSVD_wls/',
  portfolio: 'https://www.cetesdirecto.com/web/loadPortafolio',
};

if (!CETESDIRECTO_USERNAME) {
  console.error(`CETESDIRECTO_USERNAME was not set!`);
  process.exit(1);
}

if (!CETESDIRECTO_PASSWORD) {
  console.error(`CETESDIRECTO_PASSWORD was not set!`);
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();

  await page.goto(urls.login);

  await page.waitForSelector(selectors.usernameInput, { visible: true });
  await page.type(selectors.usernameInput, CETESDIRECTO_USERNAME);
  await page.click(selectors.checkUsernameBtn);

  await page.waitForSelector(selectors.passwordInput, { visible: true });
  await page.type(selectors.passwordInput, CETESDIRECTO_PASSWORD);
  await page.click(selectors.loginBtn);

  await page.waitForSelector(selectors.portfolioLink, { visible: true });
  await page.goto(urls.portfolio);

  await page.waitForSelector(selectors.totalInstrumentsText, { visible: true });

  const $totalInstruments = await page.$(selectors.totalInstrumentsText);
  const totalInstrumentsText = await page.evaluate(element => element.textContent, $totalInstruments);

  console.log(totalInstrumentsText);

  await page.click(selectors.logoutLink);

  // TODO: Tweak
  await page.waitForTimeout(10000);

  await browser.close();
})();
