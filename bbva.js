import puppeteer from 'puppeteer';

const {
  BBVA_CARD_NUMBER,
  BBVA_PASSWORD,
  BBVA_OTP,
  PUPPETEER_HEADLESS = 'true',
} = process.env;

const urls = {
  home: 'https://www.bbva.mx/',
};

const selectors = {
  cardNumberInput: '#tempCuenta',
  loginBtn: '#loginButton',
  optInput: (index) => `.inputToken[tabindex="${index+1}"]`,
  showLoginFormBtn: '.header__actions__ulist .header__actions__list:nth-child(2) .header__actions__item__link',
};

// TODO: Improve signature
async function login(page, cardNumber, password, otp) {
  if (otp.length !== 8) {
    console.error(`opt length is ${otp.length}, expected 8 characters!`);
    process.exit(1);
  }

  await page.goto(urls.home);

  await page.waitForSelector(selectors.showLoginFormBtn, { visible: true });
  await page.click(selectors.showLoginFormBtn);

  await page.waitForSelector(selectors.cardNumberInput, { visible: true });
  await page.type(selectors.cardNumberInput, cardNumber);
  await page.click(selectors.loginBtn);

  await page.waitForSelector(selectors.password, { visible: true });
  await page.type(selectors.password, password);
  await page.click(selectors.loginBtn);

  // Wait for the first OTP input to be visible
  await page.waitForSelector(selectors.optInput(0), { visible: true });

  await Promise.all(otp.split('').map(async (otpChar, i) => {
    await page.type(selectors.optInput(i), otpChar);
  }));

  // TODO: Use correct selector
  await page.click(selectors.loginBtn);
}

// Session needs to be closed, otherwise you won't be able to log in again for ~15 mins
async function logout() {
  // TODO: Implement
}

async function getSummary() {
  // TODO: Implement
}

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

  await login(page, BBVA_CARD_NUMBER, BBVA_PASSWORD, BBVA_OTP);
}

(async () => {
  await main();
})();