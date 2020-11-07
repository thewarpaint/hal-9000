import puppeteer from 'puppeteer';

import {
  login,
  logout,
  getSummary,
} from './allianz.js';

const {
  ALLIANZ_USERNAME,
  ALLIANZ_PASSWORD,
  ALLIANZ_SECURITY_IMAGE_SUBSTR,
  PUPPETEER_HEADLESS = 'true',
} = process.env;

async function main() {
  if (!ALLIANZ_USERNAME) {
    console.error(`ALLIANZ_USERNAME was not set!`);
    process.exit(1);
  }

  if (!ALLIANZ_PASSWORD) {
    console.error(`ALLIANZ_PASSWORD was not set!`);
    process.exit(1);
  }

  if (!ALLIANZ_SECURITY_IMAGE_SUBSTR) {
    console.error(`ALLIANZ_SECURITY_IMAGE_SUBSTR was not set!`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: PUPPETEER_HEADLESS === 'true',
  });
  const page = await browser.newPage();

  await login(page, ALLIANZ_USERNAME, ALLIANZ_PASSWORD, ALLIANZ_SECURITY_IMAGE_SUBSTR);

  const summary = await getSummary(page);

  console.log('Allianz summary:', summary);

  await logout(page);
  await browser.close();
}

(async () => {
  await main();
})();
