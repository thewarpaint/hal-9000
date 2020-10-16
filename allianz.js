import puppeteer from 'puppeteer';

const {
  ALLIANZ_USERNAME,
  ALLIANZ_PASSWORD,
  ALLIANZ_SECURITY_IMAGE_SUBSTR,
  PUPPETEER_HEADLESS = 'true',
} = process.env;

const urls = {
  home: 'https://clientes.allianz.com.mx/',
};

const selectors = {
  loginBtn: '#btnLogin',
  logoutBtn: '.forzarSalida a',
  passwordInput: 'input.field[placeholder="CONTRASEÑA"]',
  policyAmount: '#PLUS-body0 .cantidad-dinero',
  usernameInput: 'input.field[placeholder="USUARIO"]',
  securityImg: (srcSubstr) => `.imgSeleccionar[src*="${srcSubstr}"]`,
  validateCredentialsBtn: '.btn-modal',
};

async function login(page, username, password, securityImageSubstr) {
  await page.goto(urls.home);

  await page.waitForSelector(selectors.usernameInput, { visible: true });

  await page.type(selectors.usernameInput, username);
  await page.type(selectors.passwordInput, password);
  await page.click(selectors.validateCredentialsBtn);

  const securityImgSelector = selectors.securityImg(securityImageSubstr);

  await page.waitForSelector(securityImgSelector, { visible: true });
  await page.click(securityImgSelector);
  await page.click(selectors.loginBtn);

  await page.waitForSelector(selectors.policyAmount, { visible: true });
}

async function logout(page) {
  await page.click(selectors.logoutBtn);
  await page.waitForSelector(selectors.usernameInput, { visible: true });
}

async function getSummary(page) {
  const $policyAmount = await page.$(selectors.policyAmount);
  const policyAmountText = await page.evaluate(element => element.textContent, $policyAmount);

  return {
    policyAmount: policyAmountText,
  };
}

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
