# Contexto de Proyecto: SaaSManager Full-Stack

## 1. Identidad del Proyecto

- **Nombre:** SaaSManager
- **Descripción:** Plataforma de gestión de activos, licencias y proveedores en la nube.
- **Arquitectura:** Decoupled. Frontend (Angular 17+), Backend (Spring Boot 3+).

## 2. Stack Tecnológico (FrontEnd - Angular)

- **Lenguaje:** TypeScript (Strict Mode).
- **Arquitectura:** Standalone Components, Signals for State Management.
- **Estilos:** Tailwind CSS (Paleta personalizada: turing-navy, turing-dark-green, turing-teal, turing-light-green).
- **Formularios:** Reactive Forms (FormBuilder).
- **HTTP:** HttpClient con Auth Interceptor (JWT).
- **Control de Flujo:** Sintaxis moderna (`@for`, `@if`).

## 3. Reglas de Codificación y Estilo

- **Formato:** Siempre seguir la estructura de "Imports" explícitos (No usar auto-import sin verificar rutas).
- **Naming:** Clases siempre con sufijo `Component` (ej: `NavbarComponent`).
- **Seguridad:** Toda petición debe enviar el header `Authorization: Bearer <token>`.
- **UI/UX:** Priorizar el diseño basado en wireframes corporativos (Grid Layout, botones con hover transitions).
- **Calidad:** Evitar el uso de `any`. Definir siempre interfaces (`.interface.ts`).

## 4. Contexto de Estado

- Backend endpoint base: `http://localhost:8081/api/v1/`
- El backend ya maneja CORS (origen `http://localhost:4200`) y seguridad JWT.
- Componentes existentes: `Navbar`, `Dashboard`, `ProveedorCard`.

## 5. Instrucciones para el Agente (Antigravity)

- Cuando genere código, asumir que Angular es 17+.
- No añadir comentarios innecesarios, ser directo y formal.
- Si se solicita un componente, incluirlo con sus tests (`.spec.ts`) si es posible.
- Mantener siempre la paleta de colores de Turing-IA.
