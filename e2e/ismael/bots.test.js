'use strict';

const { By, until } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const { buildDriver, BASE_URL } = require('../helpers/driver');
const { loginAs } = require('../helpers/auth');

describe('BotsPage — módulo de Ismael', function () {
  let driver;

  before(async function () {
    driver = await buildDriver();
    await loginAs(driver, this);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  beforeEach(async function () {
    await driver.get(`${BASE_URL}/bots`);
    await driver.wait(until.urlContains('/bots'), 5000);
    await driver.wait(until.elementLocated(By.css('main h1')), 6000);
  });

  // ─── Estructura básica ────────────────────────────────────────────────────

  it('muestra el título de la página ("Paper Trading") en el contenido principal', async function () {
    const h1 = await driver.findElement(By.css('main h1'));
    const text = await h1.getText();
    assert.ok(
      text.includes('Paper Trading') || text.includes('Trading'),
      `Se esperaba "Paper Trading" en el h1 de main, se obtuvo: "${text}"`
    );
  });

  it('muestra el botón "Nuevo Bot"', async function () {
    const btn = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );
    assert.ok(await btn.isDisplayed(), 'El botón "Nuevo Bot" debe ser visible');
  });

  // ─── Modal de creación ────────────────────────────────────────────────────

  it('abre el modal al pulsar "Nuevo Bot"', async function () {
    const btn = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );
    await btn.click();

    const modalTitle = await driver.wait(
      until.elementLocated(By.xpath('//h2[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );
    assert.ok(await modalTitle.isDisplayed(), 'El modal de creación de bot debe ser visible');
  });

  it('cierra el modal al pulsar el botón X', async function () {
    const btn = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );
    await btn.click();
    await driver.wait(
      until.elementLocated(By.xpath('//h2[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );

    // Buscamos el botón p-1.5 DENTRO del overlay del modal (no el del Sidebar)
    const closeBtn = await driver.wait(
      until.elementLocated(By.css('.fixed.inset-0 button[class~="p-1.5"]')),
      3000,
      'Debe existir el botón de cierre dentro del modal'
    );
    await closeBtn.click();

    await driver.wait(async () => {
      const titles = await driver.findElements(
        By.xpath('//h2[contains(., "Nuevo Bot") or contains(., "New Bot")]')
      );
      if (titles.length === 0) return true;
      return !(await titles[0].isDisplayed().catch(() => false));
    }, 3000, 'El modal debería cerrarse');
  });

  // ─── Validaciones del formulario ──────────────────────────────────────────

  it('muestra error cuando se intenta crear sin nombre', async function () {
    const btn = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );
    await btn.click();
    await driver.wait(
      until.elementLocated(By.xpath('//h2[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    const errorMsg = await driver.wait(
      until.elementLocated(
        By.xpath('//*[contains(text(), "nombre es obligatorio") or contains(text(), "name is required")]')
      ),
      3000
    );
    assert.ok(await errorMsg.isDisplayed(), 'El error de nombre obligatorio debe ser visible');
  });

  it('muestra error cuando se intenta crear sin símbolo', async function () {
    const btn = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );
    await btn.click();
    await driver.wait(
      until.elementLocated(By.xpath('//h2[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );

    const nameInput = await driver.wait(
      until.elementLocated(By.css('input[type="text"]')),
      3000
    );
    await nameInput.sendKeys('Bot de prueba');

    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    const errorMsg = await driver.wait(
      until.elementLocated(
        By.xpath('//*[contains(text(), "Selecciona un s") or contains(text(), "Select a valid")]')
      ),
      3000
    );
    assert.ok(await errorMsg.isDisplayed(), 'El error de símbolo obligatorio debe ser visible');
  });

  it('el campo de nombre del bot acepta texto', async function () {
    const btn = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );
    await btn.click();
    await driver.wait(
      until.elementLocated(By.xpath('//h2[contains(., "Nuevo Bot") or contains(., "New Bot")]')),
      5000
    );

    const nameInput = await driver.wait(
      until.elementLocated(By.css('input[type="text"]')),
      3000
    );
    await nameInput.sendKeys('Mi Bot Test');
    const value = await nameInput.getAttribute('value');
    assert.strictEqual(value, 'Mi Bot Test');
  });
});
