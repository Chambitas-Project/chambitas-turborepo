# Backend Guidelines & Standards - Chambitas

Este documento es la **Fuente de la Verdad** para el desarrollo backend en el ecosistema distribuido de **Chambitas**. Cualquier PR que viole estas reglas deberá ser corregido antes de mergearse.

---

## 🏗 Arquitectura de Microservicios

Hemos migrado de un monolito a una arquitectura distribuida basada en un **Turborepo**. El sistema se compone de un **API Gateway (BFF)** y múltiples microservicios internos coordinados.

### Convenciones de Naming (Estándar Global)

| Tipo | Convención | Ejemplo |
|:--- |:--- |:--- |
| **Archivos** | `kebab-case` | `auth.controller.ts`, `user-profile.dto.ts` |
| **Clases** | `PascalCase` | `AuthController`, `UserProfileDto` |
| **Métodos/Vars** | `camelCase` | `login`, `accessToken` |
| **Interfaces** | `PascalCase` | `UserPayload`, `JwtSign` |

### Estándares de Comunicación

| Capa | Protocolo | Uso |
| :--- | :--- | :--- |
| **Externo (Client -> API Gateway)** | REST + Cookies HttpOnly | Seguridad y compatibilidad web/móvil. |
| **Interno Síncrono (Microservicios)** | gRPC | Alta eficiencia, tipado fuerte y contratos mediante archivos `.proto`. |
| **Interno Asíncrono (Eventos/Background)** | BullMQ sobre Redis | Resiliencia para notificaciones, procesamiento de imágenes y tareas pesadas. |

**Regla de Oro:** El API Gateway es el **único** punto de entrada público. Los microservicios internos no deben exponer puertos REST al exterior; toda comunicación debe ser vía gRPC.

---

## 📦 Centralización en Packages

Para evitar la fragmentación del código y asegurar la integridad de los datos, los recursos core residen en `packages/`.

### 1. Supabase & Database (Crítico)
Está estrictamente prohibido definir o duplicar tipos de la base de datos localmente en los servicios.
- **Origen único**: Los tipos `Database` y el `SupabaseService` deben consumirse obligatoriamente desde `@chambitas/supabase` (ubicado en `packages/supabase`).
- **Inyección**: Siempre inyectar el servicio compartido; nunca instanciar el cliente de Supabase manualmente.

### 2. Contratos gRPC
Todas las definiciones de servicios y mensajes residen en `packages/proto`. Los microservicios y el Gateway deben usar estos archivos para generar sus clientes/servidores.

---

## 🔒 Estándares de Seguridad (CRÍTICO)

### 1. Manejo de Sesiones (API Gateway)
✅ **Correcto**: Usar Cookies HttpOnly gestionadas por el API Gateway. El token JWT viaja automáticamente en la cookie `access_token`. El frontend no tiene acceso a esta cookie para mitigar XSS.

### 2. Configuración de Cookies
El API Gateway debe implementar la constante centralizada `COOKIE_OPTIONS` para asegurar la persistencia:

```typescript
const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
};
```

### 3. Guardián Global (JwtAuthGuard)
Por defecto, todas las rutas en el API Gateway están protegidas. Se utiliza el `JwtAuthGuard` que valida el token contra Supabase Auth y propaga el `user-id` y `role` hacia los microservicios internos mediante metadatos de gRPC. Para abrir una ruta, se debe usar explícitamente el decorador `@Public()`.

---

## 📖 Documentación de API (OpenAPI / Swagger)

Es **obligatorio** que todos los microservicios y el API Gateway expongan su documentación técnica.

### 1. Inicialización
Cada `main.ts` debe usar la utilidad centralizada de `@chambitas/common`:
```typescript
import { setupSwagger } from '@chambitas/common';

setupSwagger(app, {
  title: 'Nombre del Servicio',
  description: 'Descripción...',
  version: '1.0.0'
});
```

### 2. Decoradores Obligatorios en Endpoints
Para garantizar una documentación útil, cada método de controlador debe incluir:
- `@ApiOperation({ summary: '...' })`: Descripción breve de la acción.
- `@ApiResponse({ status: 200, description: '...' })`: Documentar al menos el caso de éxito y el error más común.
- `@ApiBearerAuth('JWT-auth')`: Si el endpoint requiere autenticación.

### 3. DTOs y Esquemas
Todas las clases DTO deben usar el decorador `@ApiProperty()` para que sus campos aparezcan en los esquemas de Swagger.

---

## 🛠 Buenas Prácticas de Código

### 1. Estructura Interna de Apps
Cada microservicio en `apps/*` debe seguir la estructura modular estándar de NestJS:

```text
src/
├── module-name/
│   ├── dto/                # Data Transfer Objects (Validation)
│   ├── module-name.module.ts
│   ├── module-name.controller.ts
│   └── module-name.service.ts
└── common/                 # Recursos compartidos locales
```

### 2. Uso de Supabase y Tipado Estricto
Es obligatorio usar el tipo `Database` de `@chambitas/supabase` en todas las interacciones.

✅ **Ejemplo de Implementación**:
```typescript
import { Database } from '@chambitas/supabase';

// En el servicio del microservicio
async getProfile(id: string) {
    const { data, error } = await this.supabaseService.getClient<Database>()
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) throw new InternalServerErrorException(error.message);
    return data;
}
```

### 3. Manejo de Errores en Red
1. **Microservicios**: Deben devolver códigos de error gRPC estándar (ej: `NOT_FOUND`, `UNAUTHENTICATED`).
2. **API Gateway**: Debe mapear los errores gRPC a la `HttpException` correspondiente de NestJS antes de responder al cliente.

---

## 🛡️ Resiliencia y Estabilidad

Implementamos patrones de diseño resilientes en la capa de comunicación del Gateway.

### 1. Circuit Breaker (Patrón Disyuntor)
Todas las llamadas gRPC deben estar protegidas por el `GrpcCircuitBreakerInterceptor` de `@chambitas/common`. Si un microservicio falla repetidamente, el circuito se abre para evitar el agotamiento de recursos.
- **Retries**: Se implementa un **Exponential Backoff** de 3 reintentos antes de considerar la petición como fallida.

### 2. Manejo de Timeouts
Límite estricto: Ninguna llamada gRPC debe bloquear el Gateway por más de **3 segundos**.

---

## 📊 Observabilidad y Telemetría

- **Correlation ID**: Cada petición debe incluir un `x-correlation-id` generado en el Gateway y propagado a través de todos los microservicios internos mediante el `CorrelationIdInterceptor`.
- **Logs Estructurados**: Es obligatorio usar el `StructuredLogger` para emitir logs en formato JSON que incluyan el ID de correlación.
- **Reporte de Tesis**: Estos datos alimentan el **Dominio 7** para reportes de rendimiento académicos.

---

## 🚀 Workflow de Microservicios

Para crear o modificar una funcionalidad:

1.  **Definir Contrato**: Actualizar el archivo `.proto` en `packages/proto`.
2.  **Sincronizar DB**: Si hay cambios en el esquema, actualizar tipos en `packages/supabase`.
3.  **Implementar en Microservicio**:
    - Crear estructura con CLI: `nest g module/controller/service name`.
    - Implementar lógica de negocio usando el tipado de `@chambitas/supabase`.
4.  **Exponer en API Gateway**: 
    - Implementar el endpoint REST validando con **DTOs**.
    - Consumir el microservicio vía cliente gRPC con resiliencia.

---

## 📈 Escalabilidad y Service Mesh (Visión a Futuro)

Nuestra arquitectura es **'Service Mesh Ready'**. El diseño permite la implementación futura de herramientas como Istio o Linkerd delegando la seguridad mTLS y el descubrimiento de servicios a la infraestructura sin tocar el código.

---

## 📂 Estructura del Workspace

```text
/
├── apps/
│   ├── api-gateway/          # BFF: Único punto de entrada REST.
│   └── microservices/        # Apps internas (gRPC).
├── packages/
│   ├── supabase/             # Lógica core de DB y Tipos.
│   ├── proto/                # Contratos gRPC compartidos.
│   └── common/               # Decoradores y Guards globales.
```