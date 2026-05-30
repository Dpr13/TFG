'use strict';

const { until } = require('selenium-webdriver');
const assert = require('node:assert/strict');
const { buildDriver, BASE_URL } = require('../helpers/driver');

describe('Rutas protegidas — módulos de Ismael', function () {
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('redirige a /login al acceder a /calendar sin autenticación', async function () {
    await driver.get(`${BASE_URL}/calendar`);
    await driver.wait(until.urlContains('/login'), 5000, 'Debería redirigir a /login');
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('/login'), `Se esperaba /login pero se obtuvo: ${url}`);
  });

  it('redirige a /login al acceder a /bots sin autenticación', async function () {
    await driver.get(`${BASE_URL}/bots`);
    await driver.wait(until.urlContains('/login'), 5000, 'Debería redirigir a /login');
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('/login'), `Se esperaba /login pero se obtuvo: ${url}`);
  });

  it('redirige a /login al acceder a /strategies sin autenticación', async function () {
    await driver.get(`${BASE_URL}/strategies`);
    await driver.wait(until.urlContains('/login'), 5000, 'Debería redirigir a /login');
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('/login'), `Se esperaba /login pero se obtuvo: ${url}`);
  });
});
