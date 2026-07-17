# SaaSManager — Frontend

Panel interno para la gestión de proveedores cloud, licencias de software y asignaciones a empleados. Cliente Angular que consume la API REST de [saasmanager-BackEnd](../saasmanager-BackEnd).

## Stack

- Angular 21 (Standalone Components, Signals para estado)
- TypeScript (Strict Mode)
- Tailwind CSS
- Reactive Forms
- Vitest (test runner de `ng test`)

## Requisitos previos

- **Node.js**: `^20.19.0 || ^22.12.0 || >=24.0.0` (requerido por `@angular/cli`)
- **npm**: `>= 8`
- Backend en ejecución en `http://localhost:8081` (ver README del backend)

## Instalación

```bash
git clone <url-del-repositorio>
cd saasmanager-FrontEnd
npm install
```

## Variables de entorno / configuración

Este proyecto **no usa** `src/environments/*.ts`. La URL base de la API está *hardcodeada* en cada servicio HTTP:

| Archivo | Constante | Valor actual |
|---|---|---|
| `src/app/services/auth/auth.ts` | `apiUrl` | `http://localhost:8081/api/v1/auth` |
| `src/app/services/api/usuarios.ts` | `apiUrl` | `http://localhost:8081/api/v1/users` |
| `src/app/services/api/proveedores.ts` | `apiUrl` | `http://localhost:8081/api/v1/proveedores` |
| `src/app/services/api/licencias.ts` | `apiUrl` | `http://localhost:8081/api/v1/licencias` |
| `src/app/services/api/asignaciones.ts` | `apiUrl` | `http://localhost:8081/api/v1/asignaciones` |

Si el backend corre en otro host/puerto, hay que editar la constante `apiUrl` en cada uno de esos archivos (o extraerla a un `environment.ts` propio). El backend, a su vez, solo permite CORS desde `http://localhost:4200` (hardcodeado en `SecurityConfig.java` del backend) — si cambiás el puerto del frontend, hay que actualizar eso también del lado del backend.

No hay `.env` ni variables de entorno de sistema que este proyecto lea en tiempo de build o runtime.

## Comandos

### Servidor de desarrollo

```bash
npm start
# equivalente a: ng serve
```

Disponible en `http://localhost:4200/`. Recarga automática al guardar cambios.

### Build de producción

```bash
npm run build
```

Artefactos generados en `dist/saasmanager-FrontEnd/`.

### Build en modo watch (desarrollo)

```bash
npm run watch
```

### Tests unitarios

```bash
npm test
# equivalente a: ng test
```

Usa Vitest. Nota: algunos `*.spec.ts` heredados de refactors previos (`dashboard.spec.ts`, `licencias.spec.ts`, `proveedores.spec.ts`, `asignaciones.spec.ts`) están rotos por referencias a nombres de clase antiguos — no relacionado con este README, pendiente de limpieza aparte.

## Autenticación y roles

- El login (`POST /api/v1/auth/login`) devuelve un JWT que se guarda en `localStorage` bajo la key `token`.
- `AuthService` (`src/app/services/auth/auth.ts`) expone `login()`, `register()`, `logout()`, `esAdmin()`, `getToken()`.
- Un `HttpInterceptorFn` (`src/app/core/interceptors/auth-interceptor.ts`) agrega automáticamente `Authorization: Bearer <token>` a cada petición.
- Roles soportados: `ROLE_ADMIN`, `ROLE_USER`.
- `authGuard` (`src/app/core/guards/auth-guard.ts`) protege cualquier ruta que requiera sesión iniciada.
- `adminGuard` (`src/app/core/guards/admin-guard.ts`) protege rutas exclusivas de administrador.

## Rutas

| Ruta | Componente | Acceso |
|---|---|---|
| `/login` | `LoginComponent` | Público |
| `/register` | `RegisterComponent` | Público |
| `/` | `DashboardComponent` | Autenticado |
| `/proveedores` | `ProveedoresComponent` | Solo ADMIN |
| `/licencias` | `LicenciasComponent` | Solo ADMIN |
| `/asignaciones` | `AsignacionesComponent` | Autenticado (empleado ve solo lo propio) |
| `/perfil` | `PerfilComponent` | Autenticado |

## Estructura del proyecto

```
src/app
 ├── core/            # Guards e interceptor HTTP
 │    ├── guards/
 │    └── interceptors/
 ├── services/
 │    ├── auth/        # AuthService (login/register/perfil/roles)
 │    └── api/         # Servicios REST por recurso
 ├── models/           # Interfaces TypeScript (.interface.ts)
 ├── components/       # Componentes reutilizables (layout, ui)
 └── pages/            # Componentes de página, uno por ruta
```
