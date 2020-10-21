import { sanitize } from './helpers.js';

const homeUrl = 'https://micuenta.infonavit.org.mx/wps/portal/mci2/login/';

const selectors = {
  loginBtn: '.GMBGLVCDCK',
  mySavingsRow: '.fv_panel_datos tr',
  mySavingsRowAmountText: 'td:nth-child(3)',
  mySavingsRowTypeText: 'td:nth-child(1)',
  mySavingsMenuLink: '.layoutColumn > tbody > tr:nth-child(3) .has-sub a',
  mySavingsTotalLink: '.layoutColumn > tbody > tr:nth-child(3) .has-sub li a',
  passwordInput: 'input[type="password"]',
  usernameInput: 'input[name="usuario"]',
};

async function login(page, username, password) {
  await page.goto(homeUrl);

  await page.waitForSelector(selectors.usernameInput, { visible: true });
  await page.type(selectors.usernameInput, username);
  await page.type(selectors.passwordInput, password);
  await page.click(selectors.loginBtn);

  await page.waitForSelector(selectors.mySavingsMenuLink, { visible: true });
}

async function goToMySavings(page) {
  await page.click(selectors.mySavingsMenuLink);
  await page.waitForSelector(selectors.mySavingsTotalLink, { visible: true });

  // TODO: Investigate why `await page.click(selectors.mySavingsTotalLink);` doesn't work
  const $mySavingsTotalLink = await page.$(selectors.mySavingsTotalLink);

  // This looks like a dynamic URL, that's why we get it from the link instead of hardcoding it
  const mySavingsUrl = await page.evaluate(element => element.href, $mySavingsTotalLink);

  await page.goto(mySavingsUrl);
  await page.waitForSelector(selectors.mySavingsRow, { visible: true });
}

async function getMySavingsSummary(page) {
  const $mySavingsRows = await page.$$(selectors.mySavingsRow);

  let $mySavingsRow;
  let $mySavingsRowType;
  let $mySavingsRowAmount;
  let mySavingsRowTypeText;
  let mySavingsRowAmountText;

  const mySavingsDetail = [];

  // We skip the first two rows (loading indicator and header) and the last row (empty for some reason)
  for (let i = 2; i < $mySavingsRows.length - 1; i++) {
    $mySavingsRow = $mySavingsRows[i];

    $mySavingsRowType = await $mySavingsRow.$(selectors.mySavingsRowTypeText);
    mySavingsRowTypeText = await page.evaluate(element => element.textContent, $mySavingsRowType);

    $mySavingsRowAmount = await $mySavingsRow.$(selectors.mySavingsRowAmountText);
    mySavingsRowAmountText = await page.evaluate(element => element.textContent, $mySavingsRowAmount);

    mySavingsDetail.push({
      type: mySavingsRowTypeText,
      amount: sanitize(mySavingsRowAmountText),
    });
  }

  return {
    savings: mySavingsDetail,
  };
}

export {
  login,
  getMySavingsSummary,
  goToMySavings,
};
