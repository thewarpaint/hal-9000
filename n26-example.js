import puppeteer from 'puppeteer';

import {
  login,
  logout,
  getSummary,
} from './n26.js';

const {
  N26_EMAIL,
  N26_PASSWORD,
  PUPPETEER_HEADLESS = 'true',
} = process.env;

async function main() {
  if (!N26_EMAIL) {
    console.error(`N26_EMAIL was not set!`);
    process.exit(1);
  }

  if (!N26_PASSWORD) {
    console.error(`N26_PASSWORD was not set!`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: PUPPETEER_HEADLESS === 'true',
  });
  const page = await browser.newPage();

  await login(page, N26_EMAIL, N26_PASSWORD);

  const summary = await getSummary(page);

  console.log('N26 summary:', summary);

  await logout(page);
  await browser.close();
};

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
  }
})();
