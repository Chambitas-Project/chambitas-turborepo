# Frontend Guidelines & Standards - Chambitas

Este documento es la **Fuente de la Verdad** para el desarrollo frontend en el ecosistema de **Chambitas**. Al igual que el backend, cualquier PR que viole estas reglas deberá ser corregido antes de mergearse.

---

## 🏗 Arquitectura: Atomic Design + Feature-Driven

El frontend (`apps/web-frontend`) utiliza una arquitectura híbrida que combina **Atomic Design** para componentes UI reutilizables y puramente visuales, y **Feature-Driven Architecture (FSD)** para encapsular la lógica de negocio.

### Estructura del Workspace (`src/`) y Funcionamiento de Carpetas

A continuación, se detalla el propósito estricto de cada directorio para mantener la cohesión del proyecto:

#### 1. `api/`
- **Propósito:** Configuración global de clientes HTTP (Axios o `fetch`).
- **Contenido:** Interceptores de request/response, configuración de credenciales (para cookies HttpOnly), y endpoints globales que no pertenecen a una feature específica.

#### 2. `assets/`
- **Propósito:** Almacenar recursos estáticos.
- **Contenido:** Imágenes, SVGs, fuentes web, e iconos globales. Los recursos específicos de una feature no deben ir aquí si solo se usan en un lugar, pero por convención inicial se centralizan para fácil acceso.

#### 3. `components/` (Capa de Atomic Design)
- **Propósito:** Componentes UI reutilizables y **puramente visuales (Dumb Components)**.
- **Regla Estricta:** NO deben contener lógica de negocio, no deben llamar APIs, ni suscribirse a stores de estado global (excepto UI global como Theme).
- **Subdivisiones:**
  - `atoms/`: Las piezas más pequeñas e indivisibles. Ej: `<Button />`, `<Input />`, `<Typography />`.
  - `molecules/`: Agrupación de dos o más átomos que funcionan juntos. Ej: `<SearchBar />` (Input + Button), `<FormGroup />` (Label + Input).
  - `organisms/`: Secciones complejas de la interfaz que agrupan moléculas y átomos. Ej: `<Header />`, `<Footer />`, `<ProductCard />` (Imagen + Título + Botón).

#### 4. `config/`
- **Propósito:** Centralizar la configuración de la aplicación.
- **Contenido:** Variables de entorno (ej. `import.meta.env`), constantes globales (`MAX_FILE_SIZE`), y flags de características (Feature Flags).

#### 5. `context/`
- **Propósito:** Proveedores de estado global para la UI usando React Context.
- **Contenido:** `ThemeProvider`, `LanguageProvider`. No usar para estado complejo o datos del servidor.

#### 6. `features/` (Capa de Feature-Driven)
- **Propósito:** Encapsular la **lógica de negocio** por dominio.
- **Estructura Interna de una Feature (ej. `features/auth/`):**
  - `api/`: Hooks de llamadas al backend exclusivas del feature (ej. `useLoginMutation`).
  - `model/`: Estado local del dominio (ej. slice de Zustand) o funciones de lógica pura.
  - `ui/`: Componentes que SÍ tienen estado, están conectados a hooks y consumen lógica de negocio. (Smart Components).
- **Regla Estricta:** Tratar cada feature como un micro-frontend. Exponer solo lo necesario a través de un archivo `index.ts`.

#### 7. `hooks/`
- **Propósito:** Custom Hooks globales que no pertenecen a ninguna feature.
- **Contenido:** `useWindowSize`, `useDebounce`, `useLocalStorage`.

#### 8. `layouts/`
- **Propósito:** Definir la estructura visual contenedora de las páginas.
- **Contenido:** `DashboardLayout` (Sidebar + Topbar + Content), `AuthLayout` (Fondo centrado). Se usan en el enrutador para envolver múltiples páginas.

#### 9. `pages/`
- **Propósito:** Representar las rutas de la aplicación (URL).
- **Contenido:** Componentes que unen Layouts, Features y Widgets. **No** deben tener lógica compleja, solo orquestar la vista. Ej: `LoginPage.tsx`, `DashboardPage.tsx`.

#### 10. `services/`
- **Propósito:** Clases o utilidades para interactuar con servicios externos (no REST).
- **Contenido:** Analíticas (Google Analytics), conexiones WebSockets, integraciones con Firebase (si hubiera), etc.

#### 11. `store/`
- **Propósito:** Configuración raíz del manejador de estado global.
- **Contenido:** Archivo principal de Zustand, Redux o el `QueryClient` de TanStack Query. (Nota: los slices de estado deben vivir dentro de sus respectivas `features/`).

#### 12. `types/`
- **Propósito:** Interfaces y tipos de TypeScript de uso global.
- **Contenido:** Tipos compartidos que no provienen directamente de `@chambitas/supabase`. (Recuerda que los tipos de la BD vienen del package central).

#### 13. `widgets/`
- **Propósito:** Bloques de UI independientes que resuelven una necesidad cruzada.
- **Contenido:** Componentes muy grandes que componen múltiples Features. Por ejemplo, un `<CheckoutWidget />` que utiliza `features/cart`, `features/payment` y `features/auth`.

---

## 🧩 Convenciones de Naming

| Tipo | Convención | Ejemplo |
|:--- |:--- |:--- |
| **Componentes (Archivos y Funciones)** | `PascalCase` | `Button.tsx`, `UserProfile.tsx` |
| **Hooks** | `camelCase` con prefijo `use`| `useAuth.ts`, `useFetchUser` |
| **Utilidades/Funciones** | `camelCase` | `formatDate.ts`, `calculateTotal` |
| **Interfaces/Tipos** | `PascalCase` | `UserProps`, `AuthPayload` |
| **Constantes** | `UPPER_SNAKE_CASE`| `MAX_RETRY_COUNT`, `API_URL` |

---

## 📏 Reglas Arquitectónicas (CRÍTICAS)

### 1. Atomic Design Estricto para `components/`
- **Atoms, Molecules y Organisms** **NO** deben contener lógica de negocio (no llamadas a API, no acceso a estados globales de dominio).
- Solo reciben datos mediante `props` (Componentes Tontos / Dumb Components).
- Única excepción: acceso a estados globales de UI (como un ThemeContext).

### 2. Feature-Driven (Encapsulamiento)
- Una Feature (`features/auth`) es una caja negra. 
- Los módulos externos no deben acceder directamente a implementaciones internas de una Feature, solo a lo que la Feature expone en su `index.ts` (Public API).
- **Prohibido**: Importar desde una Feature hacia otra Feature directamente si genera acoplamiento circular. Usar la capa global o `widgets` si interactúan.

### 3. Origen de Datos y Tipado Estricto (Supabase)
- Al igual que en el backend, es **obligatorio** usar los tipos generados de Supabase (`@chambitas/supabase`).
- Todo tipado que refleje una tabla o vista de la base de datos debe venir del package centralizado, no debe reescribirse localmente.

### 4. Comunicación con el API Gateway (Seguridad)
- El frontend **NO** debe gestionar JWT manualmente. El backend maneja sesiones mediante **Cookies HttpOnly**.
- Las llamadas a API deben incluir configuración de credenciales (`withCredentials: true` en Axios/Fetch) para que la cookie sea enviada automáticamente.
- El manejo de errores debe ser estandarizado. Cada error devuelto por el API Gateway (que mapea errores gRPC) debe ser interceptado globalmente para mostrar notificaciones UI (ej. Toasts).

---

## 🔒 Manejo de Estado

| Tipo de Estado | Herramienta | Cuándo usar |
| :--- | :--- | :--- |
| **Local (UI)** | `useState`, `useReducer` | Menús abiertos, tabs activos, inputs de formulario. |
| **Global (UI)** | `Context API` | Tema (Light/Dark), Idiomas (i18n). |
| **Estado Servidor** | `TanStack Query` | Llamadas al API Gateway, caché, revalidación, loading states. |
| **Global (Dominio)** | `Zustand` / `Redux` | Datos complejos que cruzan múltiples features y no dependen directamente del cache del server (ej. Carrito de compras local temporal). |

---

## 🛡️ Buenas Prácticas y Resiliencia UI

1. **Loading y Error Boundaries:** Toda llamada asíncrona a través de TanStack Query debe estar envuelta visualmente (usar Suspense y Error Boundaries en el layout principal o a nivel Widget).
2. **Componentes Accesibles (a11y):** Los átomos críticos (Botones, Inputs) deben cumplir estándares ARIA para lectores de pantalla.
3. **Separación de Responsabilidades:** Mantener archivos pequeños. Si un archivo `.tsx` crece mucho, separar la lógica en custom hooks (`useMiComponente.ts`).

---

## 🚀 Workflow de Creación de Vistas

Para crear una nueva pantalla o funcionalidad:

1. **Atoms/Molecules**: Verificar en `components/` si las piezas visuales existen. Si no, crearlas como componentes tontos (Dumb).
2. **Lógica de Feature**: Crear el dominio en `features/<nombre>` (ej. `features/marketplace`). 
   - Agregar queries/mutations en `api/`.
   - Crear componentes con estado en `ui/`.
3. **Página**: Crear la ruta en `pages/` que importe el componente principal desde la Feature o Widget, integrándolo en el Layout correspondiente.
