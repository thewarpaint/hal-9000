import puppeteer from 'puppeteer';

import {
  login,
  getMySavingsSummary,
  goToMySavings,
} from './infonavit.js';

const {
  INFONAVIT_EMAIL,
  INFONAVIT_PASSWORD,
  PUPPETEER_HEADLESS = 'true',
} = process.env;

async function main() {
  if (!INFONAVIT_EMAIL) {
    console.error(`INFONAVIT_EMAIL was not set!`);
    process.exit(1);
  }

  if (!INFONAVIT_PASSWORD) {
    console.error(`INFONAVIT_PASSWORD was not set!`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: PUPPETEER_HEADLESS === 'true',
  });
  const page = await browser.newPage();

  await login(page, INFONAVIT_EMAIL, INFONAVIT_PASSWORD);
  await goToMySavings(page);

  const summary = await getMySavingsSummary(page);

  console.log('Infonavit summary:', summary);

  // TODO: Remove and add logout automation
  await page.waitForTimeout(10000);

  await browser.close();
}

(async () => {
  await main();
})();
