'use strict';

const { By, until } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const { buildDriver, BASE_URL } = require('../helpers/driver');
const { loginAs } = require('../helpers/auth');

describe('CalendarPage — módulo de Ismael', function () {
  let driver;

  before(async function () {
    driver = await buildDriver();
    await loginAs(driver, this);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  beforeEach(async function () {
    await driver.get(`${BASE_URL}/calendar`);
    await driver.wait(until.urlContains('/calendar'), 5000);
    // Esperar a que el calendario haya salido del estado de carga (el h1 solo aparece fuera del spinner)
    await driver.wait(until.elementLocated(By.css('main h1')), 8000);
  });

  // ─── Estructura básica ────────────────────────────────────────────────────

  it('muestra el título "Calendario de Operaciones" dentro del contenido principal', async function () {
    const h1 = await driver.findElement(By.css('main h1'));
    const text = await h1.getText();
    assert.ok(
      text.includes('Calendario') || text.includes('Calendar'),
      `Se esperaba "Calendario" en el h1 de main, se obtuvo: "${text}"`
    );
  });

  it('muestra los dos tabs: Operaciones manuales y Bots', async function () {
    const manualTab = await driver.wait(
      until.elementLocated(
        By.xpath('//main//button[contains(., "Operaciones manuales") or contains(., "Operations")]')
      ),
      6000
    );
    assert.ok(await manualTab.isDisplayed(), 'El tab de operaciones manuales debe ser visible');

    const botsTab = await driver.wait(
      until.elementLocated(By.xpath('//main//button[normalize-space(text())="Bots"]')),
      3000
    );
    assert.ok(await botsTab.isDisplayed(), 'El tab de Bots debe ser visible');
  });

  it('muestra los encabezados de días de la semana en el grid', async function () {
    // Esperar a que el grid de 7 columnas esté en el DOM y sea visible
    await driver.wait(
      until.elementLocated(By.css('.grid-cols-7')),
      8000,
      'El grid del calendario debe aparecer'
    );
    // El primer hijo del grid-cols-7 es "Lun" / "Mon"
    const firstDayHeader = await driver.wait(
      until.elementIsVisible(
        await driver.findElement(By.css('.grid-cols-7 div'))
      ),
      3000,
      'El primer encabezado de día debe ser visible'
    );
    const text = await firstDayHeader.getText();
    assert.ok(text.length > 0, `El encabezado de día debe tener texto, obtenido: "${text}"`);
  });

  it('muestra los botones de navegación de mes (anterior / siguiente)', async function () {
    // Los botones prev/next tienen clase p-2 y están dentro del div con el h2 del mes
    await driver.wait(
      until.elementLocated(By.css('main h2')),
      8000,
      'El h2 con el nombre del mes debe aparecer'
    );
    const navBtns = await driver.findElements(By.css('button[class~="p-2"]'));
    assert.ok(navBtns.length >= 2, `Se esperaban al menos 2 botones p-2, encontrados: ${navBtns.length}`);
  });

  it('navega al mes siguiente y el título del mes cambia', async function () {
    await driver.wait(until.elementLocated(By.css('main h2')), 8000);
    const h2 = await driver.findElement(By.css('main h2'));
    const textBefore = await h2.getText();

    const navBtns = await driver.findElements(By.css('button[class~="p-2"]'));
    // El último botón p-2 visible es "mes siguiente"
    await navBtns[navBtns.length - 1].click();

    await driver.wait(async () => {
      const current = await driver.findElement(By.css('main h2'));
      return (await current.getText()) !== textBefore;
    }, 3000, 'El mes debería cambiar tras el click');

    const textAfter = await (await driver.findElement(By.css('main h2'))).getText();
    assert.notStrictEqual(textAfter, textBefore, 'El mes debería haber cambiado');
  });

  it('cambia al tab de Bots al hacer click en él', async function () {
    const botsTab = await driver.wait(
      until.elementLocated(By.xpath('//main//button[normalize-space(text())="Bots"]')),
      5000
    );
    await botsTab.click();

    await driver.wait(async () => {
      const cls = await botsTab.getAttribute('class');
      return cls.includes('shadow') || cls.includes('bg-white') || cls.includes('bg-gray-800');
    }, 3000, 'El tab Bots debería quedar activo');

    const cls = await botsTab.getAttribute('class');
    assert.ok(
      cls.includes('shadow') || cls.includes('bg-white') || cls.includes('bg-gray-800'),
      'El tab Bots debería estar activo'
    );
  });
});
