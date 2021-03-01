import puppeteer from 'puppeteer';

import {
  login,
  logout,
  getSummary,
} from './bbva.js';

const {
  BBVA_CARD_NUMBER,
  BBVA_PASSWORD,
  BBVA_OTP,
  PUPPETEER_HEADLESS = 'true',
} = process.env;

async function main() {
  if (!BBVA_CARD_NUMBER) {
    console.error(`BBVA_CARD_NUMBER was not set!`);
    process.exit(1);
  }

  if (!BBVA_PASSWORD) {
    console.error(`BBVA_PASSWORD was not set!`);
    process.exit(1);
  }

  if (!BBVA_OTP) {
    console.error(`BBVA_OTP was not set!`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: PUPPETEER_HEADLESS === 'true',
  });
  const page = await browser.newPage();

  // Set a wide viewport so that all product cards are visible and interaction is simpler
  await page.setViewport({ width: 1280, height: 800 });

  await login(page, BBVA_CARD_NUMBER, BBVA_PASSWORD, BBVA_OTP);

  const summary = await getSummary(page);

  console.log('BBVA summary:', summary);

  await logout(page);
  await browser.close();
}

(async () => {
  await main();
})();
