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
  loginIframe: '.access__iframe',
  // index is 0-based, we convert to 1-based tabindex transparently
  otpInput: (index) => `.inputToken[tabindex="${index+1}"]`,
  passwordInput: '#password',
  showLoginFormBtn: '.header__actions__ulist .header__actions__list:nth-child(2) .header__actions__item__link',
  validateTokenBtn: '#envioToken',
};

// TODO: Improve signature
// otp means "one time password"
async function login(page, cardNumber, password, otp) {
  if (otp.length !== 8) {
    console.error(`otp length is ${otp.length}, expected 8 characters!`);
    process.exit(1);
  }

  await page.goto(urls.home);

  await page.waitForSelector(selectors.showLoginFormBtn, { visible: true });
  await page.click(selectors.showLoginFormBtn);
  await page.waitForSelector(selectors.loginIframe, { visible: true });

  // The first login step happens inside an iframe
  const $loginIframe = await page.$(selectors.loginIframe);
  const loginContentFrame = await $loginIframe.contentFrame();

  await loginContentFrame.waitForSelector(selectors.cardNumberInput, { visible: true });
  await loginContentFrame.type(selectors.cardNumberInput, cardNumber);
  await loginContentFrame.click(selectors.loginBtn);

  await page.waitForSelector(selectors.passwordInput, { visible: true });
  await page.type(selectors.passwordInput, password);
  // TODO: Double check if this is really necessary
  await page.waitForTimeout(1000);
  await page.click(selectors.loginBtn);

  // Wait for the first OTP input to be visible
  await page.waitForSelector(selectors.otpInput(0), { visible: true });

  const otpChars = otp.split('');

  for (let i = 0; i < otpChars.length; i++) {
    await page.waitForTimeout(100);
    await page.type(selectors.otpInput(i), otpChars[i]);
  }

  await page.click(selectors.validateTokenBtn);

  // TODO: Wait for an element to confirm login
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

  // TODO: Remove
  await page.waitForTimeout(10000);
}

(async () => {
  await main();
})();