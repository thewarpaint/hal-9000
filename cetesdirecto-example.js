import puppeteer from 'puppeteer';

import {
  login,
  logout,
  getPortfolioSummary,
} from './cetesdirecto.js';

const {
  CETESDIRECTO_PASSWORD,
  CETESDIRECTO_USERNAME,
  PUPPETEER_HEADLESS = 'true',
} = process.env;

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

  await login(page, CETESDIRECTO_USERNAME, CETESDIRECTO_PASSWORD);

  const portfolioSummary = await getPortfolioSummary(page);

  console.log('Portfolio summary:', portfolioSummary);

  await logout(page);
  await browser.close();
}

(async () => {
  await main();
})();
