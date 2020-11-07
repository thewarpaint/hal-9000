import { sanitize } from './helpers.js';

const selectors = {
  checkUsernameBtn: '#continuarBtn',
  loginBtn: '#accederBtn',
  logoutLink: '#btnsUserWeb [data-name="cerrarSesion"]:nth-child(4)',
  passwordInput: '#pwdId',
  portfolioLink: '#portafolioMenu',
  instrumentNameText: '.nombreInstrumento .txtInstrumento',
  instrumentValueText: '.valorInstrumento .totalInstrumento',
  instruments: '.instrumento',
  instrumentsTotalText: '.totalInstrumentos .totalInstrumentosNumeros .txtInstrumento',
  usernameInput: '#userId',
};

const urls = {
  login: 'https://www.cetesdirecto.com/SSOSVD_wls/',
  portfolio: 'https://www.cetesdirecto.com/web/loadPortafolio',
};

async function login(page, username, password) {
  await page.goto(urls.login);

  await page.waitForSelector(selectors.usernameInput, { visible: true });
  await page.type(selectors.usernameInput, username);
  await page.click(selectors.checkUsernameBtn);

  await page.waitForSelector(selectors.passwordInput, { visible: true });
  await page.type(selectors.passwordInput, password);
  await page.click(selectors.loginBtn);
}

// Session needs to be closed, otherwise you won't be able to log in again for ~15 mins
async function logout(page) {
  await page.click(selectors.logoutLink);
  await page.waitForSelector(selectors.usernameInput, { visible: true });
}

async function getPortfolioSummary(page) {
  await page.waitForSelector(selectors.portfolioLink, { visible: true });
  await page.goto(urls.portfolio);

  await page.waitForSelector(selectors.instrumentsTotalText, { visible: true });

  const $instrumentsTotal = await page.$(selectors.instrumentsTotalText);
  const instrumentsTotalText = await page.evaluate(element => element.textContent, $instrumentsTotal);

  const $instruments = await page.$$(selectors.instruments);
  const instrumentsDetail = await Promise.all($instruments.map(async ($instrument) => {
    const $instrumentName = await $instrument.$(selectors.instrumentNameText);
    const instrumentNameText = await page.evaluate(element => element.textContent, $instrumentName);

    const $instrumentValue = await $instrument.$(selectors.instrumentValueText);
    const instrumentValueText = await page.evaluate(element => element.textContent, $instrumentValue);

    return {
      name: instrumentNameText,
      value: sanitize(instrumentValueText),
    };
  }));

  return {
    instruments: instrumentsDetail,
    instrumentsTotal: sanitize(instrumentsTotalText),
  };
}

export {
  login,
  logout,
  getPortfolioSummary,
};
