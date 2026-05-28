'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../backend/.env') });

const { By, until } = require('selenium-webdriver');
const { BASE_URL } = require('./driver');

const TEST_EMAIL    = process.env.TEST_EMAIL    || '';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '';

/**
 * Hace login con las credenciales de prueba y espera a abandonar /login.
 * Si no hay credenciales configuradas, llama a this.skip() de Mocha.
 *
 * @param {import('selenium-webdriver').WebDriver} driver
 * @param {Mocha.Context} ctx  — el `this` del test de Mocha
 */
async function loginAs(driver, ctx) {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    ctx.skip('Credenciales de test no configuradas (TEST_EMAIL / TEST_PASSWORD)');
    return;
  }
  await driver.get(`${BASE_URL}/login`);
  await driver.findElement(By.id('email')).sendKeys(TEST_EMAIL);
  await driver.findElement(By.id('password')).sendKeys(TEST_PASSWORD);
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(until.urlContains('/login'), 8000).catch(() => {});
  // Espera a que desaparezca la URL de login (redirect tras autenticación)
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return !url.includes('/login');
  }, 8000, 'El login debería redirigir fuera de /login');
}

module.exports = { loginAs, TEST_EMAIL, TEST_PASSWORD };
