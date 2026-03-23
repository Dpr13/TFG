'use strict';

const { By, until } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const { buildDriver, BASE_URL } = require('../helpers/driver');

const LOGIN_URL = `${BASE_URL}/login`;

describe('Login page', function () {
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('carga la página y muestra los campos de email y contraseña', async function () {
    await driver.get(LOGIN_URL);

    const emailInput = await driver.findElement(By.id('email'));
    const passwordInput = await driver.findElement(By.id('password'));
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));

    assert.ok(await emailInput.isDisplayed(), 'El campo email debe ser visible');
    assert.ok(await passwordInput.isDisplayed(), 'El campo contraseña debe ser visible');
    assert.ok(await submitButton.isDisplayed(), 'El botón de envío debe ser visible');
  });

  it('muestra error de validación cuando la contraseña tiene menos de 6 caracteres', async function () {
    await driver.get(LOGIN_URL);

    // Rellenar email y contraseña corta
    const emailInput = await driver.findElement(By.id('email'));
    const passwordInput = await driver.findElement(By.id('password'));

    await emailInput.sendKeys('usuario@ejemplo.com');
    await passwordInput.sendKeys('123'); // Menos de 6 caracteres

    // Hacer click en submit
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();

    // Esperar que aparezca el mensaje de error
    const errorDiv = await driver.wait(
      until.elementLocated(By.xpath('//*[contains(text(), "al menos 6 caracteres")]')),
      5000,
      'El mensaje de error de contraseña corta debería aparecer'
    );

    assert.ok(await errorDiv.isDisplayed(), 'El error de validación debe ser visible');
  });
});
