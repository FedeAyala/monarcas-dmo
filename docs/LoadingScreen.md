# LoadingScreen Component

Componente de pantalla de carga completamente independiente y reutilizable con animaciones estilo PlayStation.

## Ubicación

```
src/components/ui/LoadingScreen.tsx
```

## Características

- ✅ **Completamente independiente**: No depende de ningún estado global
- ✅ **Totalmente customizable**: Acepta props para mensaje y tip
- ✅ **Animaciones fluidas**: Anillos giratorios y barra de progreso
- ✅ **Responsive**: Se adapta a todos los tamaños de pantalla
- ✅ **Estilo PlayStation**: Diseño moderno inspirado en consolas

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `message` | `string` | `"Cargando datos"` | Mensaje principal que se muestra |
| `tip` | `string` | `"Esto puede demorar unos momentos..."` | Texto de ayuda debajo del mensaje |
| `appName` | `string` | `undefined` | Nombre de la aplicación para mostrar en el footer |
| `subtitle` | `string` | `undefined` | Subtítulo adicional en el footer |

## Uso

### Ejemplo básico

```tsx
import { LoadingScreen } from '../components/ui';

function MyPage() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <div>Contenido de la página</div>;
}
```

### Con mensajes personalizados y footer

```tsx
<LoadingScreen
  message="Cargando items"
  tip="Obteniendo información de los items del juego..."
  appName="DMO Items Database"
  subtitle="Cargando catálogo..."
/>
```

### En diferentes páginas

#### Página de Seals (Ejemplo completo)
```tsx
<LoadingScreen
  message="Cargando datos de Seals"
  tip="Esto puede demorar unos momentos. Estamos cargando toda la información de los Digimon..."
  appName="DMO Seal Master"
  subtitle="Cargando recursos del sistema..."
/>
```

#### Página de Items
```tsx
<LoadingScreen
  message="Cargando catálogo de items"
  tip="Estamos cargando todos los items disponibles..."
  appName="DMO Items Database"
  subtitle="Inicializando inventario..."
/>
```

#### Página de Guías
```tsx
<LoadingScreen
  message="Cargando guías"
  tip="Preparando las guías de juego..."
  appName="DMO Guides"
  subtitle="Cargando contenido..."
/>
```

#### Página de Mapas (Sin footer)
```tsx
<LoadingScreen
  message="Cargando mapas"
  tip="Cargando información de las zonas del juego..."
/>
```

## Integración con Astro

Para usar en una página de Astro con carga del lado del cliente:

```astro
---
import Layout from '../layouts/Layout.astro';
import { MyComponent } from '../components/MyComponent';
---

<Layout title="Mi Página">
  <MyComponent
    client:load
    initialData={[]}
  />
</Layout>
```

Y en `MyComponent.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { LoadingScreen } from './ui';

export function MyComponent({ initialData }) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/my-data');
        const result = await response.json();
        setData(result);
      } finally {
        setIsLoading(false);
      }
    }

    if (initialData.length === 0) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen
        message="Cargando datos"
        tip="Esto puede demorar unos momentos..."
      />
    );
  }

  return (
    <div>
      {/* Tu contenido aquí */}
    </div>
  );
}
```

## Diseño Visual

El componente incluye:

1. **Anillos giratorios concéntricos**:
   - Anillo exterior: azul (girando)
   - Anillo interior: púrpura (girando en sentido contrario)
   - Centro: emoji de videojuego con pulse

2. **Mensaje principal**:
   - Título en grande con puntos animados (...)
   - Subtítulo con información adicional

3. **Barra de progreso**:
   - Barra indeterminada con gradiente azul
   - Efecto de brillo (glow)
   - Animación de ida y vuelta

4. **Footer**:
   - Nombre de la aplicación
   - Texto de estado del sistema

## Notas Técnicas

- El componente ocupa toda la pantalla (`fixed inset-0`)
- Tiene z-index de 50 para estar por encima de otros elementos
- Las animaciones están definidas inline para evitar problemas de CSS
- Los puntos animados se actualizan cada 500ms
- La limpieza del intervalo se hace automáticamente al desmontar

## Personalización Futura

Si necesitas personalizar más el componente, puedes agregar props adicionales:

```tsx
interface LoadingScreenProps {
  message?: string;
  tip?: string;
  icon?: React.ReactNode;  // Personalizar el icono central
  color?: string;           // Cambiar el color del tema
  showProgress?: boolean;   // Mostrar/ocultar barra de progreso
}
```

## Exportación

El componente se exporta desde el barrel file de UI:

```tsx
export { LoadingScreen } from './LoadingScreen';
```

Importar desde:

```tsx
import { LoadingScreen } from '../components/ui';
// o
import { LoadingScreen } from './ui';
```
