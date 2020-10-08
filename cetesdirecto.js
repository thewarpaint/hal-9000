import puppeteer from 'puppeteer';

const {
  CETESDIRECTO_PASSWORD,
  CETESDIRECTO_USERNAME,
} = process.env;

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();

  await page.goto('https://www.cetesdirecto.com/SSOSVD_wls/');

  await page.type('#userId', CETESDIRECTO_USERNAME);
  await page.click('#continuarBtn');

  // TODO: Tweak
  await page.waitForTimeout(2500);

  await page.type('#pwdId', CETESDIRECTO_PASSWORD);
  await page.click('#accederBtn');

  // TODO: Tweak
  await page.waitForTimeout(2500);

  await browser.close();
})();
