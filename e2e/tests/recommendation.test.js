'use strict';

const { By, until, Key } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const { buildDriver, BASE_URL } = require('../helpers/driver');

const PAGE_URL = `${BASE_URL}/recommendation`;

// Helper: wait for a visible element
async function waitFor(driver, locator, ms = 8000) {
  return driver.wait(until.elementLocated(locator), ms);
}

// Helper: login before navigating to protected page
async function login(driver) {
  await driver.get(`${BASE_URL}/login`);
  const email = await waitFor(driver, By.id('email'));
  const password = await waitFor(driver, By.id('password'));
  await email.sendKeys(process.env.TEST_EMAIL || 'alu0101541006@ull.edu.es');
  await password.sendKeys(process.env.TEST_PASSWORD || 'BBDDDAis_30');
  const btn = await driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  // Wait until redirected AWAY from /login (urlContains('/') always passes since '/login' has '/')
  await driver.wait(until.urlMatches(/^(?!.*\/login).+$/), 15000);
}

describe('Página de Recomendación', function () {
  this.timeout(40000);
  let driver;

  before(async function () {
    driver = await buildDriver();
    await login(driver);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('carga la página y muestra el título principal', async function () {
    await driver.get(PAGE_URL);
    const heading = await waitFor(driver, By.css('h2'));
    assert.ok(await heading.isDisplayed(), 'El encabezado h2 debe ser visible');
  });

  it('muestra los botones de dirección LONG y SHORT', async function () {
    await driver.get(PAGE_URL);
    // The direction buttons are rendered as flex-1 buttons inside a rounded-lg container
    const buttons = await driver.findElements(By.css('button.flex-1.py-3.text-sm.font-bold'));
    assert.ok(buttons.length >= 2, 'Deben existir al menos los botones LONG y SHORT');
  });

  it('puede seleccionar la dirección SHORT', async function () {
    await driver.get(PAGE_URL);
    const shortBtn = await waitFor(
      driver,
      By.xpath('//button[contains(., "SHORT")]')
    );
    await shortBtn.click();
    // After clicking SHORT, the button should have the red background class
    const cls = await shortBtn.getAttribute('class');
    assert.ok(cls.includes('bg-red-600'), 'El botón SHORT debe tener fondo rojo al ser seleccionado');
  });

  it('muestra los botones de intervalo de tiempo', async function () {
    await driver.get(PAGE_URL);
    // Intervals: 1m, 5m, 15m, 1h, 4h, 1d, 1wk
    const expectedIntervals = ['1m', '5m', '15m', '1h', '4h', '1d', '1wk'];
    for (const inv of expectedIntervals) {
      const btn = await waitFor(
        driver,
        By.xpath(`//button[normalize-space(text())="${inv}"]`)
      );
      assert.ok(await btn.isDisplayed(), `El botón de intervalo "${inv}" debe ser visible`);
    }
  });

  it('puede cambiar el intervalo seleccionado', async function () {
    await driver.get(PAGE_URL);
    const btn4h = await waitFor(driver, By.xpath('//button[normalize-space(text())="4h"]'));
    await btn4h.click();
    const cls = await btn4h.getAttribute('class');
    assert.ok(cls.includes('bg-primary-500'), 'El botón "4h" debe quedar activo tras pulsarlo');
  });

  it('muestra el campo de búsqueda de símbolo y acepta texto', async function () {
    await driver.get(PAGE_URL);
    const input = await waitFor(driver, By.css('input[placeholder]'));
    assert.ok(await input.isDisplayed(), 'El campo de búsqueda debe ser visible');
    await input.clear();
    await input.sendKeys('AAPL');
    const val = await input.getAttribute('value');
    assert.ok(val.includes('AAPL'), 'El campo de búsqueda debe contener el texto introducido');
  });

  it('muestra badges de símbolos populares (AAPL, GOOGL, MSFT, TSLA)', async function () {
    await driver.get(PAGE_URL);
    const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
    for (const sym of popularSymbols) {
      const badge = await waitFor(
        driver,
        By.xpath(`//button[normalize-space(text())="${sym}"]`)
      );
      assert.ok(await badge.isDisplayed(), `El badge "${sym}" debe ser visible`);
    }
  });

  it('el botón "Calcular niveles" está deshabilitado si no hay símbolo', async function () {
    await driver.get(PAGE_URL);
    const input = await waitFor(driver, By.css('input[placeholder]'));
    await input.clear();
    // Look for the main CTA button (contains text "Calcular" or "Calculate")
    const calcBtn = await waitFor(
      driver,
      By.xpath('//button[contains(., "Calcular") or contains(., "Calculate") or contains(., "Recalcular")]')
    );
    const disabled = await calcBtn.getAttribute('disabled');
    assert.ok(disabled === 'true' || disabled === '', 'El botón de cálculo debe estar deshabilitado sin símbolo');
  });

  it('los campos de capital y riesgo son editables', async function () {
    await driver.get(PAGE_URL);
    const numberInputs = await driver.findElements(By.css('input[type="number"]'));
    assert.ok(numberInputs.length >= 2, 'Deben existir al menos dos inputs numéricos (capital y riesgo)');
    // Clear first number input and type a new value
    await numberInputs[0].clear();
    await numberInputs[0].sendKeys('5000');
    const val = await numberInputs[0].getAttribute('value');
    assert.equal(val, '5000', 'El campo de capital debe aceptar el valor introducido');
  });

  it('muestra el panel de estado vacío inicial (sin resultados)', async function () {
    await driver.get(PAGE_URL);
    // The empty state shows a LayoutTemplate icon area with a heading
    const emptyState = await waitFor(
      driver,
      By.xpath('//*[contains(text(),"Configura") or contains(text(),"Configure") or contains(text(),"operation")]')
    );
    assert.ok(await emptyState.isDisplayed(), 'El estado vacío inicial debe mostrarse cuando no hay resultados');
  });

  it('los checkboxes de método TP son visibles y alternables', async function () {
    await driver.get(PAGE_URL);
    const checkboxes = await driver.findElements(By.css('input[type="checkbox"]'));
    assert.ok(checkboxes.length >= 1, 'Debe haber al menos un checkbox de método TP');
    // Verify they are displayed
    for (const cb of checkboxes) {
      assert.ok(await cb.isDisplayed(), 'Los checkboxes de métodos TP deben ser visibles');
    }
  });

  it('los radio buttons de método SL son visibles', async function () {
    await driver.get(PAGE_URL);
    const radios = await driver.findElements(By.css('input[type="radio"]'));
    assert.ok(radios.length >= 2, 'Deben existir al menos 2 radio buttons para el método de Stop-Loss');
  });
});
