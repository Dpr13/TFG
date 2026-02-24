# Frontend - Plataforma de Análisis de Riesgo Financiero

Aplicación frontend desarrollada con React + TypeScript + Vite para el análisis y visualización de riesgos financieros.

## 🚀 Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework CSS
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos

## 📂 Estructura del Proyecto

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   └── layout/      # Componentes de layout (Header, Sidebar, etc.)
│   ├── pages/           # Páginas de la aplicación
│   │   ├── HomePage.tsx
│   │   ├── AssetsPage.tsx
│   │   └── RiskAnalysisPage.tsx
│   ├── services/        # Servicios API
│   │   ├── api.ts       # Cliente Axios configurado
│   │   └── index.ts     # Servicios de assets, prices, risk
│   ├── hooks/           # Custom hooks
│   │   └── useFetch.ts
│   ├── types/           # Definiciones TypeScript
│   │   └── index.ts
│   ├── utils/           # Utilidades
│   │   └── format.ts    # Funciones de formateo
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Proxy API

El servidor de desarrollo está configurado para hacer proxy de las peticiones `/api` al backend en `http://localhost:3001`.

## 🎨 Características

### Páginas Principales

1. **Home** (`/`)
   - Dashboard con estadísticas generales
   - Resumen de activos y análisis

2. **Activos** (`/assets`)
   - Lista de activos disponibles
   - Búsqueda y filtrado por tipo
   - Visualización de stocks, crypto y forex

3. **Análisis de Riesgo** (`/risk`)
   - Análisis de métricas de riesgo por activo
   - Volatilidad, Sharpe Ratio, Max Drawdown
   - Beta, VaR (Value at Risk)

### Servicios API

```typescript
// Obtener activos
await assetService.getAssets();

// Buscar activos
await assetService.searchAssets('AAPL', 'stock');

// Obtener precio actual
await priceService.getCurrentPrice('AAPL');

// Calcular riesgo
await riskService.calculateRisk('AAPL');
```

### Custom Hooks

```typescript
// Hook para fetch de datos
const { data, loading, error, refetch } = useFetch(
  () => assetService.getAssets(),
  []
);
```

## 🎯 Próximos Pasos

- [ ] Implementar gráficos con Recharts
- [ ] Añadir modo oscuro persistente
- [ ] Sistema de favoritos
- [ ] Comparación de múltiples activos
- [ ] Exportación de reportes
- [ ] Configuración de alertas

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Inicia servidor dev en puerto 3000

# Build
npm run build        # Compila para producción
npm run preview      # Preview del build

# Linting
npm run lint         # Ejecuta ESLint
```

## 🔗 Integración con Backend

El frontend está diseñado para consumir la API del backend en `http://localhost:3001`. 

Endpoints principales:
- `GET /assets` - Lista de activos
- `GET /prices/:symbol/current` - Precio actual
- `GET /risk/:symbol` - Métricas de riesgo

## 📄 Licencia

Proyecto de TFG - 2026
