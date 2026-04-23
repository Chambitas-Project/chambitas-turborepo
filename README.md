# Chambitas

**Plataforma Web con microservicios y Machine Learning para la reducción del desempleo juvenil en Perú.**

---

## Tabla de Contenidos
- [Contexto del Proyecto](#-contexto-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Monorepo](#-estructura-del-monorepo)
- [Guía de Instalación](#-guía-de-instalación)

---

## Contexto del Proyecto

**Chambitas** es una plataforma orientada a estudiantes universitarios en Perú, diseñada con el objetivo de reducir el impacto del desempleo juvenil. La plataforma hace uso de un **motor de recomendación híbrido** basado en Inteligencia Artificial (Machine Learning) para conectar el talento joven con oportunidades laborales que se ajustan idealmente a su perfil y habilidades.

Todo el sistema está construido sobre una moderna **arquitectura de microservicios**, asegurando resiliencia, alta disponibilidad y un despliegue altamente escalable.

---

## Stack Tecnológico

El proyecto se sustenta en tecnologías líderes de la industria y la comunidad:

- **Frontend:** React + Vite + TypeScript *(Arquitectura basada en Atomic Design y Feature-Driven Architecture)*.
- **Backend:** NestJS *(Arquitectura guiada por Microservicios y Feature-Driven Architecture)*.
- **ML Engine:** Python + FastAPI + Scikit-learn.
- **Base de Datos:** Supabase *(PostgreSQL con soporte pgvector para búsquedas e indexación semántica)*.
- **Infraestructura:** Turborepo, Docker, Railway, Vercel.

---

## Estructura del Monorepo

Este proyecto consolida sus bases de código en un ecosistema robusto mantenido por [Turborepo](https://turbo.build/repo), optimizando el flujo de trabajo, caching y concurrencia.

La distribución de espacios de trabajo (`apps`) se organiza de la siguiente manera:

- `apps/web-frontend`: Interfaz de usuario donde interactúan los estudiantes.
- `apps/api-gateway`: Punto de entrada único que enruta las solicitudes a los microservicios correspondientes.
- `apps/auth-service`: Responsable de la autenticación, autorización multitenant, y control de accesos (RBAC).
- `apps/marketplace-service`: Gestión de ofertas laborales y empresas.
- `apps/notification-service`: Gestión de notificaciones.
- `apps/profile-service`: Gestión del portafolio, currículum vitae (CV) e información laboral de los usuarios.
- `apps/matching-service`: Orquestador principal de la lógica transaccional de cruces (Empresas - Talento).
- `apps/ml-engine`: Motor analítico de Inteligencia Artificial desarrollado en Python.
- `apps/analytics-audit-service`: Servicio dedicado a la recolección y análisis de logs para auditoría y métricas de la plataforma.

---

## Guía de Instalación

Por favor sigue estos pasos con precaución para arrancar el ecosistema en un entorno local (Desarrollo):

### 1. Gestión de Paquetes (Obligatorio)

Este proyecto está configurado para manejar su resolución de dependencias estrictamente bajo `pnpm`. Si no lo tienes, debes instalarlo de manera global:

```bash
npm install -g pnpm
```

### 2. Inicializar Proyecto

En la raíz del proyecto, instala todos los módulos y dependencias cruzadas ejecutando:

```bash
pnpm install
```

### 3. Configurar Compilación Nativa (NestJS)

Al disponer de un monorepo, NestJS requiere compiladores de alto rendimiento como `@swc/core`. Es crítico **aprobar su empaquetado nativo** corriendo el siguiente comando:

```bash
pnpm approve-builds
```

### 4. Lanzamiento de Entornos

Para levantar toda la maquinaria de aplicaciones Frontend y Microservicios conjuntamente, ejecuta:

```bash
pnpm dev
```

Este comando lanzará las configuraciones de desarrollo y mantendrá el *hot-reload* sobre todo el ecosistema de Chambitas.
