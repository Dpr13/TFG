'use strict';

const { By, until } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const { buildDriver, BASE_URL } = require('../helpers/driver');
const { loginAs } = require('../helpers/auth');

describe('StrategiesPage — módulo de Ismael', function () {
  let driver;

  before(async function () {
    driver = await buildDriver();
    await loginAs(driver, this);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  beforeEach(async function () {
    await driver.get(`${BASE_URL}/strategies`);
    await driver.wait(until.urlContains('/strategies'), 5000);
    // Esperar a que la página cargue los tabs (indicador de que el componente montó)
    await driver.wait(
      until.elementLocated(By.xpath('//main//button[contains(., "Manuales") or contains(., "Manual")]')),
      8000,
      'Los tabs deben aparecer para confirmar que la página cargó'
    );
  });

  // ─── Estructura básica ────────────────────────────────────────────────────

  it('carga la página y muestra contenido dentro de main', async function () {
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('/strategies'), `Debe estar en /strategies, url: ${url}`);
    const main = await driver.findElement(By.css('main'));
    assert.ok(await main.isDisplayed(), 'El <main> debe ser visible');
  });

  it('muestra los tabs de estrategias: Manuales y Para Bots', async function () {
    const manualTab = await driver.findElement(
      By.xpath('//main//button[contains(., "Manuales") or contains(., "Manual")]')
    );
    assert.ok(await manualTab.isDisplayed(), 'El tab de estrategias manuales debe ser visible');

    const botsTab = await driver.wait(
      until.elementLocated(
        By.xpath('//main//button[contains(., "Para Bots") or contains(., "For Bots")]')
      ),
      3000
    );
    assert.ok(await botsTab.isDisplayed(), 'El tab de estrategias para bots debe ser visible');
  });

  // ─── Guía de estrategias (StrategyGuide) ─────────────────────────────────

  // La guía sólo aparece en el tab "Para Bots" — helper para activar ese tab
  async function switchToBotsTab(driver) {
    const botsTab = await driver.wait(
      until.elementLocated(
        By.xpath('//main//button[contains(., "Para Bots") or contains(., "For Bots")]')
      ),
      5000
    );
    await botsTab.click();
    // Esperar a que el botón de la guía aparezca (indica que BotStrategiesTab montó)
    await driver.wait(
      until.elementLocated(By.css('button.w-full')),
      5000,
      'El tab de Bots debe renderizar su contenido'
    );
  }

  it('expande una tarjeta de algoritmo al hacer click en ella', async function () {
    await switchToBotsTab(driver);

    const guideBtn = await driver.wait(
      until.elementLocated(By.xpath('//button[.//*[contains(@class, "text-indigo-500")]]')),
      5000
    );
    await guideBtn.click();

    // Esperar a que aparezcan los badges de la guía
    await driver.wait(
      until.elementLocated(By.css('[class~="tracking-widest"]')),
      5000
    );

    // Los botones de las tarjetas son los únicos con clase "text-left" en esta vista
    const firstCardBtn = await driver.findElement(
      By.xpath('(//button[contains(@class, "text-left")])[1]')
    );
    await firstCardBtn.click();

    // El contenido expandido muestra "Qué hace" / "Cuándo usarla"
    const expandedLabel = await driver.wait(
      until.elementLocated(
        By.xpath('//*[contains(text(), "Qué hace") or contains(text(), "What it does") or contains(text(), "Cuándo")]')
      ),
      4000
    );
    assert.ok(await expandedLabel.isDisplayed(), 'El contenido expandido debe ser visible');
  });

  it('colapsa una tarjeta ya expandida al volver a hacer click', async function () {
    await switchToBotsTab(driver);

    const guideBtn = await driver.wait(
      until.elementLocated(By.xpath('//button[.//*[contains(@class, "text-indigo-500")]]')),
      5000
    );
    await guideBtn.click();

    // Esperar a que aparezcan los badges de la guía
    await driver.wait(
      until.elementLocated(By.css('[class~="tracking-widest"]')),
      5000
    );

    const firstCardBtn = await driver.findElement(
      By.xpath('(//button[contains(@class, "text-left")])[1]')
    );

    // Expandir
    await firstCardBtn.click();
    await driver.wait(
      until.elementLocated(
        By.xpath('//*[contains(text(), "Qué hace") or contains(text(), "What it does")]')
      ),
      4000
    );

    // Colapsar
    await firstCardBtn.click();

    await driver.wait(async () => {
      const els = await driver.findElements(
        By.xpath('//*[contains(text(), "Qué hace") or contains(text(), "What it does")]')
      );
      if (els.length === 0) return true;
      return !(await els[0].isDisplayed().catch(() => false));
    }, 4000, 'El contenido debería haberse colapsado');
  });
});
