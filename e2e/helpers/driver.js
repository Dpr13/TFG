'use strict';

const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const HEADLESS = process.env.HEADLESS !== 'false';

/**
 * Crea un WebDriver de Chrome configurado.
 * @returns {Promise<WebDriver>}
 */
async function buildDriver() {
  const options = new chrome.Options();
  if (HEADLESS) {
    options.addArguments('--headless=new');
  }
  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1280,900'
  );

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: 5000 });
  return driver;
}

module.exports = { buildDriver, BASE_URL };
