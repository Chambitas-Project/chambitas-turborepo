# DESIGN_SYSTEM_CONTEXT.md
# Chambitas — Source of Truth para Maquetación por IA

> **Propósito:** Este archivo es la referencia canónica que debe leer una IA antes de generar cualquier interfaz en el proyecto Chambitas. Aplica los principios de *Refactoring UI* sobre el sistema OKLCH real de `@chambitas/ui`.
>
> **Stack:** Tailwind CSS v4 · CSS-first (`@theme`) · Dark Mode Hardcoded · OKLCH · Inter + JetBrains Mono

---

## 0. Reglas de Oro (Leer Primero)

| # | Regla | Violación Prohibida |
|---|-------|---------------------|
| 1 | Usa siempre tokens del sistema. Nunca valores arbitrarios de color. | `text-[#22c55e]` ❌ → `text-primary-500` ✅ |
| 2 | El espaciado solo en la escala 4/8pt. | `p-[13px]` ❌ → `p-3` ✅ |
| 3 | Nunca negro puro ni blanco puro. | `text-black` ❌ / `bg-white` ❌ |
| 4 | La jerarquía se crea con **contraste + peso**, no solo tamaño. | Dos textos idénticos en color para primary y secondary ❌ |
| 5 | El foreground siempre tiene el mismo matiz (hue 163–165) que el fondo. | `text-gray-400` ❌ → `text-slate-400` ✅ (tinted grey) |

---

## 1. Paleta de Colores — Tokens Disponibles

### 1.1 Primary (Verde Institucional · hue 163)

```
primary-50   oklch(0.96 0.030 163)   ← Texto sobre fondo dark primary
primary-100  oklch(0.92 0.050 163)
primary-200  oklch(0.84 0.070 163)
primary-300  oklch(0.73 0.100 163)   ← Texto secundario, iconos activos
primary-400  oklch(0.63 0.120 163)   ← Links
primary-500  oklch(0.52 0.140 163)   ← Base de marca #247A4D
primary-600  oklch(0.44 0.160 163)   ← Hover (+ chroma intencionado)
primary-700  oklch(0.37 0.170 163)   ← Active / pressed
primary-800  oklch(0.30 0.160 163)
primary-900  oklch(0.22 0.140 163)
primary-950  oklch(0.16 0.100 163)
```

### 1.2 Slate Tintado (Grises de la UI · hue 165)

> **Regla clave:** Nunca uses `gray-*`, `zinc-*`, `neutral-*`. Usa siempre `slate-*` porque tienen chroma ≤ 0.018 con el mismo matiz que la marca. Esto da **profundidad perceptual coherente**.

```
slate-50    oklch(0.97 0.006 165)   ← Fondos muy claros (no disponible en dark)
slate-100   oklch(0.93 0.008 165)   ← Foreground principal
slate-200   oklch(0.87 0.010 165)   ← Foreground secundario
slate-300   oklch(0.77 0.012 165)
slate-400   oklch(0.63 0.014 165)   ← Muted foreground / placeholders
slate-500   oklch(0.50 0.015 165)
slate-600   oklch(0.40 0.016 165)
slate-700   oklch(0.31 0.016 165)   ← Bordes (--color-border)
slate-800   oklch(0.23 0.015 165)   ← Card surface / input bg
slate-900   oklch(0.17 0.012 165)   ← Card bg
slate-950   oklch(0.13 0.010 165)   ← Background global
```

### 1.3 Semánticos

| Token Tailwind | Uso |
|----------------|-----|
| `destructive-500` | Errores, eliminar, peligro |
| `destructive-400` | Texto destructivo sobre fondo dark |
| `success-500` | Confirmaciones, éxito |
| `warning-500` | Alertas no críticas |
| `info-500` | Información, tooltips |

### 1.4 Variables Semánticas (Shadcn / CSS vars)

Úsalas cuando el contexto es genérico (un componente reutilizable no sabe en qué surface estará):

| Variable CSS | Clase Tailwind | Uso |
|---|---|---|
| `--color-background` | `bg-background` | Fondo de página |
| `--color-foreground` | `text-foreground` | Texto principal |
| `--color-card` | `bg-card` | Surface de cards |
| `--color-card-foreground` | `text-card-foreground` | Texto en card |
| `--color-muted` | `bg-muted` | Surface de elementos secundarios |
| `--color-muted-foreground` | `text-muted-foreground` | Texto desenfatizado |
| `--color-border` | `border-border` | Bordes de todos los elementos |
| `--color-input` | `bg-input` | Fondo de inputs |
| `--color-ring` | `ring-ring` | Focus ring |
| `--color-primary` | `bg-primary` | CTA primario |
| `--color-primary-foreground` | `text-primary-foreground` | Texto sobre CTA |

---

## 2. Jerarquía Visual — Primary / Secondary / Tertiary

> **Principio Refactoring UI:** La jerarquía se construye con contraste de color y peso tipográfico. Nunca solo con tamaño. Un texto de igual tamaño puede ser primario o terciario dependiendo de su color.

### 2.1 Jerarquía de Texto

| Nivel | Propósito | Color Tailwind | Peso |
|-------|-----------|----------------|------|
| **Primary** | Títulos, acción principal, nombre del elemento | `text-foreground` (`slate-100`) | `font-semibold` / `font-bold` |
| **Secondary** | Subtítulos, descripción, metadatos importantes | `text-slate-300` | `font-medium` / `font-normal` |
| **Tertiary** | Timestamps, etiquetas, ayuda contextual | `text-muted-foreground` (`slate-400`) | `font-normal` |
| **Disabled / Ghost** | Placeholders, estados inactivos | `text-slate-600` | `font-normal` |
| **Accent** | Links, valores destacados | `text-primary-400` | `font-medium` |

**Checklist de jerarquía:**
- [ ] ¿Hay al menos 2 niveles de contraste distintos en la pantalla?
- [ ] ¿El elemento más importante es el de mayor contraste perceptual?
- [ ] ¿Ningún elemento secundario compite visualmente con el primario?

### 2.2 Jerarquía de Botones

```
Primary CTA   → bg-primary text-primary-foreground        (solo 1 por vista)
Secondary     → bg-secondary text-secondary-foreground border border-border
Ghost         → bg-transparent text-slate-300 hover:bg-muted
Destructive   → bg-destructive-500 text-white
Link          → text-primary-400 underline-offset-4 hover:underline
```

**Always vs Never — Botones:**

| Always ✅ | Never ❌ |
|-----------|---------|
| Un solo botón Primary por sección | Dos botones `bg-primary` lado a lado |
| Ghost button para acciones terciarias | Botón primary para "Cancelar" |
| Padding consistente en la escala 8pt | `px-[11px]` valores arbitrarios |
| Texto de botón en sentence case | TODO MAYÚSCULAS |

---

## 3. Sistema de Espaciado — 8pt Grid

### 3.1 Escala Permitida (Tailwind)

> **Regla absoluta:** Solo valores de la escala estándar de Tailwind. Prohibido cualquier valor arbitrario de spacing.

```
0  → 0px
1  → 4px    ← Mínimo para separadores internos
2  → 8px    ← Gap entre icono y texto
3  → 12px
4  → 16px   ← Padding base de componentes
5  → 20px
6  → 24px   ← Padding de cards
8  → 32px   ← Gap entre secciones
10 → 40px
12 → 48px   ← Padding de sections
16 → 64px
20 → 80px
24 → 96px   ← Padding de heroes
```

### 3.2 Reglas de Aplicación

| Contexto | Valor Recomendado | Clase Tailwind |
|----------|-------------------|----------------|
| Gap entre icono y etiqueta | 8px | `gap-2` |
| Padding de badge/pill | 4px 12px | `py-1 px-3` |
| Padding de botón estándar | 8px 16px | `py-2 px-4` |
| Padding de botón grande | 12px 24px | `py-3 px-6` |
| Padding interno de card | 24px | `p-6` |
| Padding interno de card small | 16px | `p-4` |
| Gap entre items de lista | 8px | `gap-2` |
| Gap entre cards en grid | 16px o 24px | `gap-4` o `gap-6` |
| Margin entre secciones | 48px–64px | `mb-12` o `mb-16` |

**Always vs Never — Espaciado:**

| Always ✅ | Never ❌ |
|-----------|---------|
| `p-4`, `p-6`, `p-8` | `p-[13px]`, `p-[18px]` |
| `gap-2`, `gap-4`, `gap-6` | `gap-[7px]` |
| `mt-8`, `mb-12` | `mt-[35px]` |

---

## 4. Tipografía

### 4.1 Fuentes del Sistema

```
Sans: Inter (--font-sans)         → Toda la UI
Mono: JetBrains Mono (--font-mono) → Código, montos, IDs
```

### 4.2 Escala Tipográfica

| Nivel | Clase Tailwind | `line-height` | Uso |
|-------|----------------|---------------|-----|
| Display | `text-5xl` / `text-6xl` | `leading-tight` (1.2) | Heroes, landing |
| H1 | `text-3xl` / `text-4xl` | `leading-tight` | Título de página |
| H2 | `text-2xl` | `leading-snug` | Título de sección |
| H3 | `text-xl` | `leading-snug` | Subtítulo / card title |
| Body Large | `text-lg` | `leading-relaxed` | Descripción principal |
| Body Base | `text-base` | `leading-relaxed` (1.5) | Cuerpo de texto |
| Body Small | `text-sm` | `leading-normal` | Metadatos, ayuda |
| Caption | `text-xs` | `leading-normal` | Badges, timestamps |

**Regla de line-height:** El interlineado debe **aumentar** a medida que el texto **decrece**. Textos pequeños necesitan más aire. Textos grandes (display) colapsan mejor.

```
text-5xl+  → leading-tight   (1.2)
text-2xl   → leading-snug    (1.375)
text-base  → leading-relaxed (1.625)
text-sm    → leading-relaxed (1.625)
text-xs    → leading-normal  (1.5)
```

### 4.3 Peso Tipográfico

```
font-normal    (400) → Cuerpo, descripciones largas
font-medium    (500) → Labels, navegación, texto secundario importante
font-semibold  (600) → Headings H2-H4, nombres de entidades
font-bold      (700) → H1, Display, cifras destacadas
```

### 4.4 Tracking (letter-spacing)

```
Headings (h1-h6):     tracking-tight  (-0.02em)   ← Más legible a tamaños grandes
Body text:            tracking-normal (0.01em)     ← Por defecto en body
Uppercase labels:     tracking-wider  (0.05em)     ← SOLO si el texto está en uppercase
```

---

## 5. Bordes y Radio

### 5.1 Sistema de Radios

| Token | Valor | Clase Tailwind | Uso |
|-------|-------|----------------|-----|
| `radius-xs` | 2px | `rounded-[--radius-xs]` | Indicadores tiny |
| `radius-sm` | 4px | `rounded` | Checkboxes, tags inline |
| `radius-md` | 8px | `rounded-md` | Inputs, botones estándar |
| `radius-lg` | 12px | `rounded-lg` | Cards, dropdowns |
| `radius-xl` | 16px | `rounded-xl` | Cards prominentes |
| `radius-2xl` | 24px | `rounded-2xl` | Modals, panels grandes |
| `radius-full` | 9999px | `rounded-full` | Badges, avatars, pills |

**Regla de consistencia:** Todos los elementos de una misma familia usan el mismo radio. No mezcles `rounded-md` en un botón dentro de una card `rounded-lg`.

### 5.2 Bordes

```css
/* Borde estándar: siempre slate-700 */
border border-border          → oklch(0.31 0.016 165)

/* Borde con opacidad para layers sobre capas (glassmorphism) */
border border-border/50       → oklch(0.31 0.016 165 / 0.5)

/* Inner border (efecto premium) — usar box-shadow en lugar de border */
box-shadow: inset 0 1px 0 oklch(0.40 0.016 165 / 0.5)
```

**Inner Border con Tailwind:**
```html
<div class="shadow-[inset_0_1px_0_oklch(0.40_0.016_165/0.5)]">
```

---

## 6. Sombras y Elevación

### 6.1 Sistema de Sombras (Brand-tinted)

> Las sombras tienen tinte verde (`hue 165`) para ser coherentes con el sistema OKLCH. Nunca `shadow-black`.

| Token | Clase | Uso |
|-------|-------|-----|
| `shadow-sm` | `shadow-sm` | Botones, inputs en reposo |
| `shadow-md` | `shadow-md` | Cards, dropdowns |
| `shadow-lg` | `shadow-lg` | Modals, drawers |
| `shadow-xl` | `shadow-xl` | Toasts, elementos flotantes |
| `shadow-glow-primary` | `glow-primary` | CTAs primarios, estados activos |

### 6.2 Reglas de Elevación

| Nivel | Z-index | Sombra | Uso |
|-------|---------|--------|-----|
| Superficie base | 0 | — | Página / layout |
| Elevado | 1 | `shadow-sm` | Cards |
| Flotante | 2 | `shadow-md` | Dropdowns, tooltips |
| Modal | 3 | `shadow-xl` | Modals, sidebars |
| Toast | 4 | `shadow-xl` | Notificaciones |

**Always vs Never — Sombras:**

| Always ✅ | Never ❌ |
|-----------|---------|
| Sombras múltiples (al menos 2 layers) | `shadow: 0 4px 4px rgba(0,0,0,0.5)` único layer |
| Sombras con opacidad baja (0.3–0.5) | Sombras opacas que oscurecen el contenido |
| Glow para indicar interactividad primary | Glow en elementos secundarios |

---

## 7. Componentes Especiales del Sistema

### 7.1 Glassmorphism (`.glass`)

Disponible como utilidad en el sistema:

```html
<!-- Usando la clase utility registrada en @layer utilities -->
<div class="glass rounded-xl p-6">
  <!-- bg: oklch(0.17 0.012 165 / 0.75) + blur(16px) + saturate(180%) -->
  <!-- border: 1px solid oklch(0.31 0.016 165 / 0.5) -->
</div>
```

**Cuándo usar glass:**
- [ ] Cards que se superponen a gradientes o imágenes
- [ ] Paneles flotantes (sidebars de contexto, HUD)
- [ ] Sobre fondos con `gradient-brand`

**No usar glass:**
- [ ] Como fondo de página
- [ ] En tablas o listados densos de datos

### 7.2 Gradient de Marca (`.gradient-brand`)

```html
<div class="gradient-brand">
  <!-- linear-gradient(135deg, primary-500, info-500) -->
  <!-- oklch(0.52 0.140 163) → oklch(0.57 0.170 230) -->
</div>
```

### 7.3 Texto con Gradiente (`.text-gradient-brand`)

```html
<h1 class="text-gradient-brand font-bold">
  Texto con gradiente verde → violeta
</h1>
```

### 7.4 Glow (`.glow-primary`)

```html
<button class="bg-primary glow-primary hover:bg-accent transition-colors">
  CTA Principal
</button>
```

### 7.5 Badges / Pills

```html
<!-- Badge de estado activo -->
<span class="
  inline-flex items-center gap-1.5
  px-3 py-1
  rounded-full
  text-xs font-medium
  bg-primary-500/10
  text-primary-300
  border border-primary-500/40
">
  <span class="size-1.5 rounded-full bg-primary-400 pulse-primary" />
  Activo
</span>

<!-- Badge neutral -->
<span class="
  px-2 py-0.5 rounded-full text-xs
  bg-slate-800 text-slate-300
  border border-slate-700
">
  Etiqueta
</span>
```

---

## 8. Formularios y Acciones

### 8.1 Inputs

```html
<!-- Input estándar -->
<input class="
  w-full
  px-4 py-2.5
  bg-input              /* slate-800 */
  border border-border   /* slate-700 */
  rounded-md
  text-sm text-foreground
  placeholder:text-muted-foreground
  focus:border-ring focus:ring-2 focus:ring-ring/25
  transition-colors duration-150
" />
```

**Always vs Never — Inputs:**

| Always ✅ | Never ❌ |
|-----------|---------|
| `bg-input` (slate-800) con borde | Input con `bg-transparent` sin borde |
| Focus ring con `ring-2 ring-ring/25` | Sin feedback de focus |
| `placeholder:text-muted-foreground` | Placeholder en `text-foreground` |
| Padding `py-2.5 px-4` en escala 8pt | `py-[11px] px-[13px]` |

### 8.2 Labels — Cuándo Omitirlos

> **Principio Refactoring UI:** Si el contexto hace la etiqueta obvia, omítela y usa solo `placeholder`.

| Caso | Label | Placeholder |
|------|-------|-------------|
| Formulario de login con 2 campos | ❌ Omitir | ✅ "Correo electrónico" |
| Formulario de registro con 6+ campos | ✅ Requerida | ✅ Complementaria |
| Campo de búsqueda en navbar | ❌ Omitir | ✅ "Buscar servicios..." |
| Filtro dentro de un modal con título | ❌ Omitir | ✅ "Ej: plomería" |
| Campo dentro de tabla editable | ❌ Omitir | — |

### 8.3 Patrones de Validación

```html
<!-- Estado de error -->
<div class="space-y-1.5">
  <input class="border-destructive-500 ring-2 ring-destructive-500/20 ..." />
  <p class="text-xs text-destructive-400 flex items-center gap-1">
    <AlertCircle class="size-3" />
    Mensaje de error específico
  </p>
</div>

<!-- Estado de éxito -->
<input class="border-success-500 ring-2 ring-success-500/20 ..." />
```

---

## 9. Animaciones y Transiciones

### 9.1 Duraciones

| Tipo de Interacción | Duración | Clase |
|---------------------|----------|-------|
| Hover de color/opacidad | 150ms | `duration-150` |
| Hover de transform (scale, translate) | 200ms | `duration-200` |
| Apertura de dropdown/menu | 200ms | `duration-200` |
| Apertura de modal | 300ms | `duration-300` |
| Animación de página / skeleton | 400-600ms | `duration-500` |

### 9.2 Easing

```
Colores / opacidad:   ease-in-out  →  transition-colors ease-in-out
Transform / scale:    ease-out     →  transition-transform ease-out
Entrada de modales:   ease-out     →  (spring si se usa framer)
```

### 9.3 Hover Effects Estándar

```html
<!-- Botón primary -->
<button class="bg-primary hover:bg-accent active:bg-primary-700
               transition-colors duration-150 ...">

<!-- Card interactiva -->
<div class="... hover:border-primary-500/50 hover:shadow-lg
            hover:-translate-y-0.5 transition-all duration-200">

<!-- Link de navegación -->
<a class="text-slate-400 hover:text-foreground transition-colors duration-150">
```

### 9.4 Utilidades de Animación Disponibles

```html
<span class="pulse-primary">  <!-- pulso de opacidad 2s para estados activos -->
```

---

## 10. Patrones de Layout

### 10.1 Contenedores

```html
<!-- Layout de página estándar -->
<main class="min-h-screen bg-background">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- contenido -->
  </div>
</main>

<!-- Sección con padding vertical -->
<section class="py-16 lg:py-24">

<!-- Hero section -->
<section class="min-h-screen flex flex-col items-center justify-center px-6 py-24">
```

### 10.2 Cards

```html
<!-- Card estándar -->
<div class="bg-card border border-border rounded-xl p-6 shadow-md">

<!-- Card glass premium -->
<div class="glass rounded-xl p-6">

<!-- Card interactiva -->
<div class="bg-card border border-border rounded-xl p-6 shadow-md
            hover:border-primary-500/50 hover:shadow-lg
            hover:-translate-y-0.5 transition-all duration-200
            cursor-pointer">
```

### 10.3 Grids Responsivos

```html
<!-- Grid de cards de servicio -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Grid de features/estadísticas -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">

<!-- Layout con sidebar -->
<div class="flex gap-8">
  <aside class="w-64 shrink-0">...</aside>
  <main class="flex-1 min-w-0">...</main>
</div>
```

---

## 11. Íconos

- **Librería:** `lucide-react` y `react-icons` (ya se encuentran instaladas)
- **Tamaños estándar:** `size-3` (12px) · `size-4` (16px) · `size-5` (20px) · `size-6` (24px)
- **Inline con texto:** `size-4` con `inline` o en `flex items-center gap-2`
- **Stroke width:** Usar default (2). No sobreescribir a menos que sea explícito.

```html
<!-- Ícono + texto alineados -->
<span class="flex items-center gap-2 text-sm text-muted-foreground">
  <MapPin class="size-4 text-primary-400" />
  Ciudad de México
</span>
```

---

## 12. Checklist de Revisión antes de Entregar

Antes de generar el TSX/HTML final, verifica:

**Color y Jerarquía**
- [ ] Sin colores arbitrarios (`text-[#xxx]`, `bg-[#xxx]`). Solo tokens del sistema.
- [ ] Al menos 2 niveles de jerarquía de texto visibles (primary + secondary/tertiary).
- [ ] El único CTA primario de la vista usa `bg-primary`.
- [ ] Ningún texto es `text-white` puro → usar `text-foreground` o `text-slate-100`.

**Espaciado**
- [ ] Todo el padding y gap usa valores de la escala 4/8pt.
- [ ] No hay valores arbitrarios de spacing.
- [ ] Secciones separadas por `py-12`, `py-16` o `py-24`.

**Tipografía**
- [ ] Headings grandes usan `leading-tight` o `leading-snug`.
- [ ] Texto body usa `leading-relaxed`.
- [ ] Pesos: `font-semibold` o `font-bold` para lo más importante.

**Interactividad**
- [ ] Todos los elementos clicables tienen `transition-colors duration-150` mínimo.
- [ ] Inputs tienen `focus:border-ring focus:ring-2 focus:ring-ring/25`.
- [ ] Focus visible para accesibilidad (`:focus-visible` está en el reset global).

**Sombras y Elevación**
- [ ] Cards usan `shadow-md`. Modales usan `shadow-xl`.
- [ ] Glow solo en el CTA principal o elementos activos de la marca.
