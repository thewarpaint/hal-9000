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
  acceptLogoutLink: '#aceptar_logout',
  cardNumberInput: '#tempCuenta',
  homeFrameA: 'frame',
  homeFrameB: '#tdcDetails',
  loginBtn: '#loginButton',
  loginIframe: '.access__iframe',
  logoutBtn: '#signOff',
  // index is 0-based, we convert to 1-based tabindex transparently
  otpInput: (index) => `.inputToken[tabindex="${index+1}"]`,
  passwordInput: '#password',
  productCards: '#app__products cells-widget-product-card',
  productCardAmount: '.sr-amount.style-scope.cells-atom-amount',
  productCardTitle: '.card-title.style-scope.cells-widget-product-card',
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
  await page.waitForSelector(selectors.homeFrameA, { visible: true });
}

// Session needs to be closed, otherwise you won't be able to log in again for ~15 mins
async function logout(page, homeContentFrameA) {
  await homeContentFrameA.click(selectors.logoutBtn);

  // TODO: Fix selector
  await page.waitForSelector(selectors.acceptLogoutLink, { visible: true });
}

async function getSummary(homeContentFrameA) {
  await homeContentFrameA.waitForSelector(selectors.homeFrameB, { visible: true });

  const $homeFrameB = await homeContentFrameA.$(selectors.homeFrameB);
  const homeContentFrameB = await $homeFrameB.contentFrame();

  await homeContentFrameB.waitForSelector(selectors.productCards, { visible: true });

  const $productCards = await homeContentFrameB.$$(selectors.productCards);

  const productStatuses = await Promise.all($productCards.map(async ($productCard) => {
    const $productCardTitle = await $productCard.$(selectors.productCardTitle);
    const productCardTitleText = await homeContentFrameB.evaluate(element => element.textContent, $productCardTitle);

    if (productCardTitleText.trim() === '') {
      return null;
    }

    const $productCardAmount = await $productCard.$(selectors.productCardAmount);
    const productCardAmountText = await homeContentFrameB.evaluate(element => element.textContent, $productCardAmount);

    return {
      title: productCardTitleText,
      amount: productCardAmountText,
    };
  }));

  return productStatuses.filter((productStatus) => productStatus !== null);
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

  // Set a wide viewport so that all product cards are visible and interaction is simpler
  await page.setViewport({ width: 1280, height: 800 });

  await login(page, BBVA_CARD_NUMBER, BBVA_PASSWORD, BBVA_OTP);

  // The BBVA homepage has an iframe inside a frame for whatever reason...
  const $homeFrameA = await page.$(selectors.homeFrameA);
  const homeContentFrameA = await $homeFrameA.contentFrame();

  const summary = await getSummary(homeContentFrameA);

  console.log('BBVA summary:', summary);

  await logout(page, homeContentFrameA);
}

(async () => {
  await main();
})();