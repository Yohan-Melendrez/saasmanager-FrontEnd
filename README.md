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

La URL base de la API vive en `src/environments/`, con reemplazo automático de archivo según la configuración de build (`fileReplacements` en `angular.json`):

| Archivo | Usado por | `apiUrl` |
|---|---|---|
| `src/environments/environment.development.ts` | `ng serve` / `npm start` (configuración `development`, la default de `serve`) | `http://localhost:8081/api/v1` |
| `src/environments/environment.ts` | `ng build` (configuración `production`, la default de `build`) | `https://saasmanager-backend.onrender.com/api/v1` |

Los 5 servicios HTTP (`services/auth/auth.ts`, `services/api/usuarios.ts`, `services/api/proveedores.ts`, `services/api/licencias.ts`, `services/api/asignaciones.ts`) arman su `apiUrl` a partir de `environment.apiUrl` — no hay hosts hardcodeados en el código de los servicios. Para apuntar a otro backend, editá el `apiUrl` del archivo de entorno correspondiente.

No hay `.env` ni variables de entorno de sistema que este proyecto lea en tiempo de build o runtime — todo pasa por estos dos archivos de TypeScript.

## Cómo correr la app en local (contra el backend local)

1. Levantá el backend primero (ver README de `saasmanager-BackEnd`) — debe quedar escuchando en `http://localhost:8081`.
2. En este repo, instalá dependencias si no lo hiciste (`npm install`).
3. Corré `npm start`. Angular usa automáticamente `environment.development.ts` (apunta a `localhost:8081`) porque `ng serve` usa la configuración `development` por defecto — no hace falta tocar nada.
4. Abrí `http://localhost:4200/`.
5. El backend solo permite CORS desde `http://localhost:4200` (hardcodeado en `SecurityConfig.java`) — si servís el frontend en otro puerto, hay que actualizar eso del lado del backend.
6. Registrate desde `/register` o usá un usuario existente en la base para loguearte desde `/login`.

Si en cambio corrés `npm run build` (o `ng build` sin flags), se usa la configuración `production` por defecto, que apunta al backend desplegado en Render — no al local. Para forzar un build "de producción" que pegue a tu backend local, hay que compilar explícitamente con la configuración development: `ng build --configuration development`.

## Comandos

### Servidor de desarrollo

```bash
npm start
# equivalente a: ng serve
```

Disponible en `http://localhost:4200/`. Recarga automática al guardar cambios. Usa `environment.development.ts` (backend local).

### Build de producción

```bash
npm run build
```

Artefactos generados en `dist/saasmanager-FrontEnd/browser/`. Usa `environment.ts` (backend en Render).

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
