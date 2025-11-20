# 🎮 DMO Seal Master

Guía completa y calculadora del sistema de Seals de **Digimon Masters Online**.

![Astro](https://img.shields.io/badge/Astro-5.x-purple)
![React](https://img.shields.io/badge/React-19-blue)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-green)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-cyan)

## ✨ Features

- 📊 **Explorador de Seals** - Todas las seals organizadas por categoría
- 🧮 **Calculadora** - Calcula tus buffs totales (guardado en localStorage)
- 🎨 **SealFrames** - Visualización con marcos según el rango (Normal, Bronce, Plata, Oro, Platino, Master)
- 📱 **Modal de detalle** - Info completa de cada seal con View Transitions
- ⚡ **Panel de Admin** - Actualiza los datos con un click desde DMO Wiki
- 🚀 **Deploy ready** - Configurado para Vercel/Netlify

## 🛠️ Stack Tecnológico

- **Framework**: Astro 5 con React
- **Base de datos**: Neon (PostgreSQL serverless)
- **Estilos**: Tailwind CSS
- **Scraping**: Cheerio
- **Icons**: Lucide React

## 📦 Instalación

### 1. Clonar y configurar

```bash
git clone <tu-repo>
cd dmo-seals
npm install
```

### 2. Crear base de datos en Neon

1. Ir a [console.neon.tech](https://console.neon.tech)
2. Crear un proyecto nuevo: `dmo-seals`
3. Copiar el **Connection String** (usar la versión "pooled")

### 3. Configurar variables de entorno

Crear archivo `.env`:

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Contraseña para el panel de admin
ADMIN_PASSWORD=tu-password-seguro

# Entorno
NODE_ENV=development
```

### 4. Inicializar base de datos

```bash
npm run setup
```

### 5. Cargar datos desde DMO Wiki

```bash
npm run scrape
```

### 6. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:4321](http://localhost:4321)

## 📋 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run start` | Iniciar en producción |
| `npm run setup` | Crear tablas en Neon |
| `npm run scrape` | Cargar datos desde DMO Wiki |

## 🔐 Panel de Admin

1. Ir a `/login`
2. Ingresar la contraseña definida en `ADMIN_PASSWORD`
3. En `/admin` podés:
   - Ver estadísticas de la base de datos
   - Ejecutar scraping con un click
   - Ver historial de actualizaciones

## 🚀 Deploy

### Vercel

1. Importar proyecto en Vercel
2. Agregar variables de entorno:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
3. Deploy automático

### Netlify

1. Conectar repositorio
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Agregar variables de entorno

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── seals/
│   │   ├── SealCard.tsx        # Card de cada seal
│   │   ├── SealFrame.tsx       # Frame visual por rango
│   │   ├── SealDetailModal.tsx # Modal con info completa
│   │   ├── CategorySection.tsx # Sección por categoría
│   │   └── SealFilters.tsx     # Filtros de búsqueda
│   ├── calculator/
│   │   └── BuffSummary.tsx     # Resumen de buffs
│   ├── ui/
│   │   └── ...                 # Componentes UI
│   └── DMOSealsApp.tsx         # App principal
├── lib/
│   ├── neon.ts                 # Conexión y queries a Neon
│   ├── scraper-neon.ts         # Scraper de DMO Wiki
│   ├── dataLoader.ts           # Carga de datos
│   └── auth.ts                 # Auth simple para admin
├── pages/
│   ├── index.astro             # Página principal
│   ├── login.astro             # Login de admin
│   ├── admin.astro             # Panel de admin
│   └── api/                    # API endpoints
└── ...
```

## 🎨 Sistema de rangos

Los SealFrames muestran diferentes colores según el rango:

| Rango | Color | Cantidad (3000 max) |
|-------|-------|---------------------|
| Normal | 🔵 Azul | 0 - 99 |
| Bronce | 🟤 Marrón | 100 - 299 |
| Plata | ⚪ Gris | 300 - 499 |
| Oro | 🟡 Dorado | 500 - 999 |
| Platino | 🔷 Turquesa | 1000 - 2999 |
| Master | 🟣 Púrpura | 3000 |

## 🧮 Calculadora

La calculadora permite:
- Seleccionar seals y asignar cantidades
- Ver el nivel actual de cada seal
- Calcular buffs totales por categoría
- Exportar/importar configuración
- **Los datos se guardan en localStorage**

## 📊 Categorías de Seals

| ID | Nombre | Bonus Master |
|----|--------|--------------|
| AT | Attack Damage | +100 |
| CT | Critical Rate | +1% |
| HT | Hit Rate | +100 |
| HP | Health Points | +150 |
| DS | Digi-Soul | +100 |
| DE | Defense | +80 |
| BL | Block Rate | +1% |
| EV | Evade Rate | +1% |

## 🔄 Actualizar datos

### Desde el panel de admin

1. Ir a `/admin`
2. Click en "Ejecutar Scraping"
3. Esperar a que termine

### Desde la terminal

```bash
npm run scrape
```

## 📝 Fuente de datos

Los datos se obtienen de [DMO Wiki - Seal Master](https://dmowiki.com/Seal_Master).

## ⚠️ Disclaimer

Este proyecto no está afiliado con Bandai Namco ni con los creadores de Digimon Masters Online. Es una herramienta creada por fans para fans.

## 📄 Licencia

MIT
