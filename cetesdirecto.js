import puppeteer from 'puppeteer';

import { sanitize } from './helpers.js';

const {
  CETESDIRECTO_PASSWORD,
  CETESDIRECTO_USERNAME,
  PUPPETEER_HEADLESS = 'true',
} = process.env;

const selectors = {
  checkUsernameBtn: '#continuarBtn',
  loginBtn: '#accederBtn',
  logoutLink: '#btnsUserWeb [data-name="cerrarSesion"]:nth-child(4)',
  passwordInput: '#pwdId',
  portfolioLink: '#portafolioMenu',
  instrumentNameText: '.nombreInstrumento .txtInstrumento',
  instrumentValueText: '.valorInstrumento .totalInstrumento',
  instruments: '.instrumento',
  instrumentsTotalText: '.totalInstrumentos .totalInstrumentosNumeros .txtInstrumento',
  usernameInput: '#userId',
};

const urls = {
  login: 'https://www.cetesdirecto.com/SSOSVD_wls/',
  portfolio: 'https://www.cetesdirecto.com/web/loadPortafolio',
};

async function login(page) {
  await page.goto(urls.login);

  await page.waitForSelector(selectors.usernameInput, { visible: true });
  await page.type(selectors.usernameInput, CETESDIRECTO_USERNAME);
  await page.click(selectors.checkUsernameBtn);

  await page.waitForSelector(selectors.passwordInput, { visible: true });
  await page.type(selectors.passwordInput, CETESDIRECTO_PASSWORD);
  await page.click(selectors.loginBtn);
}

// Session needs to be closed, otherwise you won't be able to log in again for ~15 mins
async function logout(page) {
  await page.click(selectors.logoutLink);
  await page.waitForSelector(selectors.usernameInput, { visible: true });
}

async function getPortfolioSummary(page) {
  await page.waitForSelector(selectors.portfolioLink, { visible: true });
  await page.goto(urls.portfolio);

  await page.waitForSelector(selectors.instrumentsTotalText, { visible: true });

  const $instrumentsTotal = await page.$(selectors.instrumentsTotalText);
  const instrumentsTotalText = await page.evaluate(element => element.textContent, $instrumentsTotal);

  const $instruments = await page.$$(selectors.instruments);
  const instrumentsDetail = await Promise.all($instruments.map(async ($instrument) => {
    const $instrumentName = await $instrument.$(selectors.instrumentNameText);
    const instrumentNameText = await page.evaluate(element => element.textContent, $instrumentName);

    const $instrumentValue = await $instrument.$(selectors.instrumentValueText);
    const instrumentValueText = await page.evaluate(element => element.textContent, $instrumentValue);

    return {
      name: instrumentNameText,
      value: sanitize(instrumentValueText),
    };
  }));

  return {
    instruments: instrumentsDetail,
    instrumentsTotal: sanitize(instrumentsTotalText),
  };
}

async function main() {
  if (!CETESDIRECTO_USERNAME) {
    console.error(`CETESDIRECTO_USERNAME was not set!`);
    process.exit(1);
  }

  if (!CETESDIRECTO_PASSWORD) {
    console.error(`CETESDIRECTO_PASSWORD was not set!`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: PUPPETEER_HEADLESS === 'true',
  });
  const page = await browser.newPage();

  await login(page);

  const portfolioSummary = await getPortfolioSummary(page);

  console.log('Portfolio summary:', portfolioSummary);

  await logout(page);
  await browser.close();
}

(async () => {
  await main();
})();
