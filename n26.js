import { sanitize } from './helpers.js';

const loginUrl = 'https://app.n26.com/login';
const logoutUrl = 'https://app.n26.com/logout';

const selectors = {
  currentBalanceSpan: '#main > div:nth-child(2) > p > span',
  emailInput: '#email',
  loginBtn: 'button[type=submit]',
  passwordInput: '#password',
  pageNameP: '#a11y-page-name-paragraph',
};

const confirmLoginText = 'Confirm login on your phone';
const pageNameText = 'Home — N26';

const login = async (page, email, password) => {
  await page.goto(loginUrl);

  await page.waitForSelector(selectors.emailInput, { visible: true });
  await page.type(selectors.emailInput, email);
  await page.type(selectors.passwordInput, password);
  await page.click(selectors.loginBtn);

  // Because of 2FA the user needs to confirm the login on their phone
  await page.waitForFunction(
    (confirmLoginText) => {
      return document.querySelector('h1') && document.querySelector('h1').textContent === confirmLoginText;
    },
    {},
    confirmLoginText
  );

  // ... and then we need to wait until the homepage loads
  await page.waitForFunction(
    ({ selector, pageNameText }) => {
      return document.querySelector(selector) && document.querySelector(selector).textContent === pageNameText;
    },
    {},
    {
      pageNameText,
      selector: selectors.pageNameP,
    },
  );
}

async function logout(page) {
  await page.goto(logoutUrl);
}

async function getSummary(page) {
  const $currentBalanceText = await page.$(selectors.currentBalanceSpan);
  const currentBalanceText = await page.evaluate(element => element.textContent, $currentBalanceText);

  return {
    balance: sanitize(currentBalanceText),
  };
}

export {
  login,
  logout,
  getSummary,
};
