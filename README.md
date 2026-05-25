# Mi TFG

## Pruebas

Las **pruebas unitarias** se implementan mediante **Vitest**, permitiendo validar de forma aislada la
lógica de negocio y detectar errores de manera temprana durante el desarrollo.

Para las **pruebas de integración completas** y **simulaciones de interacción real del usuario** se
utiliza **Selenium WebDriver** junto con **Mocha**. Este enfoque permite verificar el comportamiento
del sistema en escenarios cercanos a producción y garantizar el correcto funcionamiento de la
aplicación desde la interfaz de usuario hasta el backend.

### Cómo ejecutar

#### Unit tests (Vitest)

- Backend:
	- `cd backend && npm install && npm test`
- Frontend:
	- `cd frontend && npm install && npm test`

#### E2E / Integración (Selenium WebDriver + Mocha)

1) Arranca el frontend:
	 - `cd frontend && npm install && npm run dev`
2) En otra terminal, ejecuta E2E:
	 - `cd e2e && npm install && npm test`

Opcionales:
- `HEADLESS=false npm run test:headed` (ver el navegador)
- `BASE_URL=http://localhost:3000 npm test` (cambiar URL objetivo)
- `TEST_EMAIL=... TEST_PASSWORD=... npm test` (credenciales para login)