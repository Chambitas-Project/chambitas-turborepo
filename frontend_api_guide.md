# 📋 Guía de API — Frontend Chambitas

**Base URL:** `http://localhost:3000/api/v1`  
**Autenticación:** Cookie HttpOnly `access_token` (se setea/limpia automáticamente por el servidor)  
**Content-Type:** `application/json` en todos los requests con body

---

## 🔐 AUTENTICACIÓN

### 1. Register — Estudiante

```
POST /auth/register
```

**Body:**
```json
{
  "email": "u202212338@upc.edu.pe",
  "password": "MiPassword123!",
  "role": "student",
  "university_id": "59a91332-e18f-4e68-8061-fe83f4c7610f"
}
```

> ⚠️ `university_id` es el UUID de la universidad (obtenido de un endpoint de catálogo).  
> ⚠️ El email DEBE coincidir con el dominio institucional de la universidad seleccionada.

**Response 201:**
```json
{
  "userId": "3400140c-9a39-4a8a-af5d-77595544d9c8",
  "email": "u202212338@upc.edu.pe"
}
```

**Errores comunes:**

| Status | Mensaje | Causa |
|--------|---------|-------|
| `400` | `university_id es requerido para estudiantes` | Falta university_id |
| `400` | `El email no es válido para la universidad seleccionada...` | Email no coincide con el dominio de la uni |
| `409` | `User already registered` | El email ya existe en Supabase |

---

### 2. Register — Employer

```
POST /auth/register
```

**Body:**
```json
{
  "email": "reclutador@empresa.com",
  "password": "MiPassword123!",
  "role": "employer"
}
```

> ✅ No lleva `university_id`.

**Response 201:**
```json
{
  "userId": "a1b2c3d4-...",
  "email": "reclutador@empresa.com"
}
```

---

### 3. Login (ambos roles)

```
POST /auth/login
```

**Body:**
```json
{
  "email": "u202212338@upc.edu.pe",
  "password": "MiPassword123!"
}
```

**Response 200:**
```json
{
  "userId": "3400140c-9a39-4a8a-af5d-77595544d9c8",
  "email": "u202212338@upc.edu.pe",
  "role": "student",
  "isOnboarded": false
}
```

> 🍪 **Cookie seteada automáticamente:** `access_token=<jwt>; HttpOnly; SameSite=Lax; Path=/`  
> El frontend NO necesita hacer nada con la cookie — el browser la envía automáticamente en cada request siguiente.

**Campos importantes de la response:**

| Campo | Tipo | Uso en frontend |
|-------|------|----------------|
| `role` | `"student"` \| `"employer"` | Determina qué flujo de onboarding mostrar |
| `isOnboarded` | `boolean` | Si es `false` → redirigir al flujo de onboarding |

**Errores comunes:**

| Status | Mensaje | Causa |
|--------|---------|-------|
| `401` | `Invalid login credentials` | Email o password incorrecto |
| `401` | `User profile not found` | Usuario registrado en auth pero sin perfil en app |

---

### 4. Logout

```
POST /auth/logout
```

**Body:** ninguno  
**Headers:** ninguno especial (no requiere token — el servidor limpia la cookie)

**Response 200:**
```json
{
  "success": true
}
```

> 🍪 El servidor hace `clearCookie('access_token')` automáticamente.

---

## 👤 ONBOARDING

> Todos los endpoints de onboarding requieren estar autenticado (cookie `access_token` activa).  
> El frontend solo necesita que el browser envíe la cookie — no agregar headers manuales.

### 5. Ver Skills disponibles (antes del onboarding)

```
GET /profile/skills
```

**Response 200:**
```json
{
  "skills": [
    { "id": "61e42cc9-...", "name": "TypeScript", "category": "Tecnología", "type": "hard" },
    { "id": "5b025c3a-...", "name": "NestJS", "category": "Tecnología", "type": "hard" },
    { "id": "b01d2121-...", "name": "PostgreSQL", "category": "Tecnología", "type": "hard" },
    { "id": "...", "name": "Liderazgo", "category": "Blandas", "type": "soft" }
  ]
}
```

> Usar el campo `name` para enviar en el onboarding.  
> Niveles de dominio disponibles: `1`=Básico · `2`=Elemental · `3`=Intermedio · `4`=Avanzado · `5`=Experto

---

### 6. Onboarding — Estudiante

```
POST /profile/onboarding/student
```

**Body:**
```json
{
  "full_name": "Rodrigo López",
  "career": "Ingeniería de Software",
  "academic_cycle": 9,
  "skill_inputs": [
    { "name": "TypeScript", "proficiency_level": 4 },
    { "name": "NestJS", "proficiency_level": 3 },
    { "name": "PostgreSQL", "proficiency_level": 2 }
  ]
}
```

**Reglas de validación:**

| Campo | Regla |
|-------|-------|
| `full_name` | Requerido, no vacío |
| `career` | Requerido, no vacío |
| `academic_cycle` | Entero entre `1` y `12` |
| `skill_inputs` | Mínimo `3`, máximo `10` items |
| `skill_inputs[].name` | Debe existir en el catálogo (`GET /profile/skills`) |
| `skill_inputs[].proficiency_level` | Opcional, entero entre `1` y `5`. Default: `1` |

**Response 200:**
```json
{
  "success": true,
  "is_onboarded": true,
  "message": "Onboarding completado exitosamente"
}
```

**Errores comunes:**

| Status | Mensaje | Causa |
|--------|---------|-------|
| `400` | `Debes seleccionar entre 3 y 10 habilidades` | Menos de 3 o más de 10 skills |
| `400` | `Las siguientes habilidades no existen en el catálogo: X` | Nombre de skill inválido |
| `400` | `El ciclo académico debe estar entre 1 y 12` | academic_cycle fuera de rango |
| `401` | `Missing authentication token` | Cookie expirada / no hay sesión |

---

### 7. Onboarding — Employer

```
POST /profile/onboarding/employer
```

**Body:**
```json
{
  "company_name": "Chambitas S.A.C.",
  "ruc": "20123456789",
  "sector": "Tecnología",
  "description": "Startup enfocada en conectar talento universitario con proyectos reales."
}
```

**Reglas de validación:**

| Campo | Regla |
|-------|-------|
| `company_name` | Requerido |
| `ruc` | Requerido (cualquier string, sin validación de formato) |
| `sector` | Requerido |
| `description` | Requerido |

**Response 200:**
```json
{
  "success": true,
  "is_onboarded": true,
  "message": "Onboarding completado exitosamente"
}
```

---

## 🔄 FLUJO COMPLETO

```
STUDENT                                    EMPLOYER
─────────────────────────────────────────────────────────────

1. POST /auth/register (con university_id)   POST /auth/register (sin university_id)
         ↓                                            ↓
2. POST /auth/login                          POST /auth/login
         ↓                                            ↓
   { isOnboarded: false }              { isOnboarded: false }
         ↓                                            ↓
3. GET /profile/skills                       (no necesita skills)
         ↓
4. POST /profile/onboarding/student          POST /profile/onboarding/employer
         ↓                                            ↓
   { is_onboarded: true }              { is_onboarded: true }
         ↓                                            ↓
5.   → Home / Dashboard                      → Home / Dashboard
```

---

## 🍪 Manejo de Cookies en el Frontend

El frontend **no necesita hacer nada especial** con las cookies si usa `fetch` o `axios` con la configuración correcta:

**Con fetch:**
```
credentials: 'include'   ← requerido en TODOS los requests al backend
```

**Con axios:**
```
withCredentials: true   ← requerido en TODOS los requests al backend
```

> Sin esta configuración, el browser no envía la cookie y todos los endpoints protegidos retornarán `401`.

---

## 📌 Resumen de Endpoints

| Método | URL | Auth | Rol |
|--------|-----|------|-----|
| `POST` | `/auth/register` | ❌ Público | Todos |
| `POST` | `/auth/login` | ❌ Público | Todos |
| `POST` | `/auth/logout` | ❌ Público | Todos |
| `GET` | `/profile/skills` | ✅ Cookie | Todos |
| `POST` | `/profile/onboarding/student` | ✅ Cookie | Student |
| `POST` | `/profile/onboarding/employer` | ✅ Cookie | Employer |
| `GET` | `/profile/me` | ✅ Cookie | Todos |
