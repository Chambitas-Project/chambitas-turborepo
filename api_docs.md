# 📘 Guía Maestra de Endpoints (API Docs) - Chambitas

Esta guía técnica detalla los endpoints y los **flujos de uso** del ecosistema de Chambitas. El sistema opera bajo una arquitectura de microservicios coordinados mediante **gRPC** y persistencia en **Supabase**.

---

## 🔐 Seguridad y Estándares

### Autenticación
- **Mecanismo:** Bearer Token (JWT).
- **Transporte:** Header `Authorization: Bearer <token>` y Cookie `access_token` (`HttpOnly`).
- **Roles:** `student`, `employer`.

### Formato de Datos
- **Frontend/Gateway:** `camelCase` (JSON).
- **Base de Datos/Supabase:** `snake_case`.

---

## 🚀 Flujos de Uso Principales

### 👨‍🎓 Flujo del Estudiante (Student Journey)
1.  **Registro:** El estudiante se registra en `/auth/register` usando su **correo institucional**. Debe proporcionar el `university_id`.
2.  **Login:** Inicia sesión en `/auth/login` para obtener su token.
3.  **Onboarding:** Completa su perfil obligatorio en `/profile/onboarding/student`. Aquí define sus habilidades (mín. 3), promedio (GPA) y bloques de disponibilidad horaria.
4.  **Descubrimiento:** 
    - Usa `/matching/recommendations/me` para ver proyectos que la IA recomienda según su perfil.
    - O busca manualmente en `/marketplace/projects`.
5.  **Postulación:** Envía una nota de interés a un proyecto mediante `/marketplace/applications`.
6.  **Seguimiento:** Revisa el estado de sus postulaciones en `/marketplace/applications/my-applications`.

### 🏢 Flujo del Empleador (Employer Journey)
1.  **Registro y Login:** Se registra como `employer` y accede a la plataforma.
2.  **Onboarding:** Completa los datos de su empresa en `/profile/onboarding/employer`.
3.  **Publicación:** Crea una oportunidad de proyecto en `/marketplace/projects`, definiendo presupuesto, requisitos y habilidades necesarias.
4.  **Gestión de Candidatos:**
    - Lista los postulantes con `/marketplace/applications/project/:projectId`.
    - Cambia el estado de los candidatos (ej: a `reviewing` o `accepted`) en `/marketplace/applications/:id/status`.
5.  **Cierre:** Una vez finalizado el trabajo, marca el proyecto como completado en `/marketplace/projects/:id/complete`.

---

## 1. Módulo: Auth & Universities
Gestiona la identidad y los catálogos institucionales.

### `POST /auth/register`
**Descripción:** Registro de nuevos usuarios.
- **Seguridad:** Público.

| Campo | Tipo | Req. | Descripción |
| :--- | :--- | :--- | :--- |
| `email` | string | Sí | Institucional para students. |
| `password` | string | Sí | - |
| `role` | enum | Sí | `student` o `employer`. |
| `university_id` | UUID | Cond. | Obligatorio si `role=student`. |

---

### `POST /auth/login`
**Descripción:** Inicio de sesión.
- **Response:** Retorna `userId`, `role` e `isOnboarded`. Establece cookie de sesión.

---

### `GET /auth/universities`
**Descripción:** Lista de universidades activas.

---

## 2. Módulo: Profiles & Skills
Gestión de identidad profesional.

### `POST /profile/onboarding/student`
**Descripción:** Perfil profesional del estudiante.
**Request Body:**
```json
{
  "full_name": "Nombre Real",
  "career_id": "uuid",
  "academic_cycle": 5,
  "skill_inputs": [
    { "name": "React", "proficiency_level": 3 }
  ],
  "availability_blocks": { "mon": "11110000..." }
}
```

---

### `POST /profile/onboarding/employer`
**Descripción:** Perfil corporativo.
**Request Body:** `company_name`, `name` (comercial), `description`.

---

### `GET /profile/me`
**Descripción:** Retorna el perfil completo (Mapeado a camelCase).

---

### `GET /profile/skills`
**Descripción:** Catálogo maestro para el selector de habilidades.

---

## 3. Módulo: Marketplace
Publicaciones y postulaciones.

### `POST /marketplace/projects`
**Descripción:** (Solo Employer) Publicar proyecto.
**Campos:** `title`, `description`, `budget`, `requirements`, `service_category`, `skills`.

---

### `POST /marketplace/applications`
**Descripción:** (Solo Student) Postular a proyecto.
**Request:** `project_id`, `cover_note` (Max 500).

---

### `PATCH /marketplace/applications/:id/status`
**Descripción:** (Solo Employer) Gestionar estado de postulación.
**Estados:** `pending`, `reviewing`, `accepted`, `rejected`.

---

## 4. Módulo: Matching
Recomendaciones inteligentes.

### `GET /matching/recommendations/me`
**Descripción:** Proyectos sugeridos para el estudiante logueado.

---

### `PATCH /matching/matches/:id/status`
**Descripción:** Feedback del estudiante (viewed, accepted, rejected).

---

## 5. Módulo: Media & Assets
Archivos binarios.

### `POST /media/upload`
**Descripción:** Carga de archivos (JPG, PNG, MP4). Max 5MB.
**Folders:** `assets`, `evidence`, `projects`, `profiles`.

---

## 6. Módulo: Notifications
### `POST /notifications/send-email`
**Descripción:** Envío manual de correos (to, subject, body).

---

## 📊 Tabla de Errores Comunes

| HTTP | Causa |
| :--- | :--- |
| **400** | Datos inválidos (ej: GPA fuera de rango 0-20). |
| **401** | Sesión expirada o sin token. |
| **403** | Acceso denegado (ej: Estudiante intentando crear proyecto). |
| **404** | ID de proyecto o perfil no encontrado. |
