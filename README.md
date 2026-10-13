# Laundry Pickup Mobile

Aplicación web progresiva (PWA) construida con Angular para la gestión móvil de guías de recolección (*pickup guides*) de un servicio de lavandería. Permite a los empleados de campo crear, consultar y editar guías de recolección, capturar fotos y firmas del cliente, y hacer seguimiento del estado de cada guía desde el celular.

## Tabla de contenidos

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración de entornos](#configuración-de-entornos)
- [Servidor de desarrollo](#servidor-de-desarrollo)
- [Build de producción](#build-de-producción)
- [Pruebas](#pruebas)
- [Autenticación y permisos](#autenticación-y-permisos)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [PWA / Service Worker](#pwa--service-worker)
- [Convenciones de código](#convenciones-de-código)
- [Control de versiones](#control-de-versiones)

## Características

- **Dashboard** con resumen de guías del día, borradores y totales.
- **Gestión de guías de recolección (Pickup Guides)**: listado, creación, edición y detalle.
- **Captura de evidencia**: fotos (`photo-capture`) y firma digital del cliente (`signature-pad`).
- **Historial de revisiones** por guía (cambios de cantidades, motivo y empleado responsable).
- **Catálogos de apoyo**: clientes, vehículos, empleados y artículos de servicio (lookups).
- **Autenticación JWT** con refresh token y manejo de sesión en almacenamiento local/sesión.
- **Control de acceso por permisos y roles** (guards de ruta).
- **Perfil de usuario**.
- **Instalable como PWA**, con soporte offline básico vía Angular Service Worker.

## Stack tecnológico

| Tecnología | Versión |
|---|---|
| Angular | 20.3.x (standalone components) |
| Angular Material / CDK | 20.2.x |
| RxJS | 7.8.x |
| TypeScript | 5.9.x |
| Angular Service Worker (PWA) | 20.3.x |
| Node.js | 22.x recomendado |
| Karma + Jasmine | Pruebas unitarias |

El proyecto usa **componentes standalone** (sin `NgModule`), **lazy loading** por ruta (`loadComponent`) e **interceptores HTTP funcionales**.

## Estructura del proyecto

```
src/
├── app/
│   ├── auth/                  # Login y pantalla de acceso denegado
│   │   ├── login/
│   │   └── access-denied/
│   ├── core/
│   │   ├── guards/             # authGuard, pickupMobileAccessGuard
│   │   ├── interceptors/       # auth, envelope (unwrap de respuesta API), loading
│   │   ├── models/             # Modelos/DTOs de auth y de pickup guides
│   │   ├── services/           # Servicios HTTP: auth, customers, employees,
│   │   │                       # vehicles, service-items, pickup-guides,
│   │   │                       # attachments, dashboard, notifications, loading
│   │   ├── utils/               # Utilidades: JWT, archivos, errores
│   │   └── global-error-handler.ts
│   ├── dashboard/              # Página de inicio con resumen
│   ├── layout/
│   │   └── main-layout/        # Shell principal (nav, toolbar) tras login
│   ├── pickup-guides/
│   │   ├── list/                # Listado de guías
│   │   ├── new/                  # Alta / edición de guía
│   │   └── detail/                # Detalle de guía
│   ├── profile/                 # Perfil del usuario autenticado
│   ├── shared/
│   │   └── components/          # empty-state, error-state, loading-overlay,
│   │                             # photo-capture, signature-pad, status-chip
│   ├── app.config.ts            # Configuración de la app (providers)
│   ├── app.routes.ts            # Definición de rutas
│   └── app.ts                   # Componente raíz
├── environments/                # environment.ts / environment.prod.ts
└── main.ts
```

## Requisitos previos

- [Node.js](https://nodejs.org/) 22.x o superior
- npm 10.x o superior (incluido con Node)
- [Angular CLI](https://angular.dev/tools/cli) 20.x (`npm install -g @angular/cli`, opcional si se usa `npx`)
- Una API backend compatible disponible (ver [Configuración de entornos](#configuración-de-entornos))

## Instalación

```bash
git clone https://github.com/pacoyx/Laundry.PickupMobile.git
cd Laundry.PickupMobile
npm install
```

## Configuración de entornos

El proyecto define dos archivos de entorno en `src/environments/`:

- `environment.ts` (desarrollo): apunta por defecto a `http://localhost:5239/api`.
- `environment.prod.ts` (producción): usa una ruta relativa `/api`, asumiendo que la app y la API se sirven detrás del mismo host/reverse proxy.

Ambos exponen:

```ts
export const environment = {
  production: boolean,
  appVersion: string,
  apiUrl: string
};
```

Ajusta `apiUrl` según el entorno donde se despliegue la aplicación.

## Servidor de desarrollo

Para iniciar el servidor local de desarrollo:

```bash
npm start
# o
ng serve
```

La aplicación corre en **`http://localhost:4400/`** (puerto configurado en `angular.json`). El navegador recarga automáticamente al modificar los archivos fuente.

## Build de producción

```bash
npm run build
# o
ng build
```

Los artefactos de build se generan en el directorio `dist/`. La configuración de producción:

- Aplica `fileReplacements` para usar `environment.prod.ts`.
- Habilita el **service worker** (`ngsw-config.json`) para soporte PWA.
- Aplica *output hashing* y presupuestos de tamaño de bundle (750 kB advertencia / 1.5 MB error en el bundle inicial).

También existe un modo *watch* para desarrollo:

```bash
npm run watch
```

## Pruebas

Pruebas unitarias con [Karma](https://karma-runner.github.io) y Jasmine:

```bash
npm test
# o
ng test
```

## Autenticación y permisos

- El login (`AuthService`) obtiene un **JWT** (`token`) y un **refresh token**, junto con los `roles` y `permissions` del usuario.
- Los tokens se decodifican con utilidades propias (`jwt.util.ts`) y se persisten mediante `session-storage.service.ts`.
- `auth.interceptor.ts` adjunta el token a las peticiones salientes; `envelope.interceptor.ts` desempaqueta el formato de respuesta del backend; `loading.interceptor.ts` controla el indicador de carga global.
- `authGuard` protege rutas que requieren sesión iniciada.
- `pickupMobileAccessGuard` además exige el permiso `pickup_mobile.access`; si el usuario no lo tiene, es redirigido a `/access-denied`.

## Rutas de la aplicación

| Ruta | Descripción | Protección |
|---|---|---|
| `/login` | Inicio de sesión | Pública |
| `/access-denied` | Acceso denegado | `authGuard` |
| `/dashboard` | Resumen general | `authGuard` + `pickupMobileAccessGuard` |
| `/pickup-guides` | Listado de guías de recolección | `authGuard` + `pickupMobileAccessGuard` |
| `/pickup-guides/new` | Nueva guía de recolección | `authGuard` + `pickupMobileAccessGuard` |
| `/pickup-guides/:id` | Detalle de una guía | `authGuard` + `pickupMobileAccessGuard` |
| `/pickup-guides/:id/edit` | Edición de una guía | `authGuard` + `pickupMobileAccessGuard` |
| `/profile` | Perfil del usuario | `authGuard` + `pickupMobileAccessGuard` |
| `**` | Cualquier otra ruta | Redirige a `/dashboard` |

### Estados de una guía de recolección

| Estado | Valor |
|---|---|
| Borrador (`Draft`) | 1 |
| Recolectada (`Collected`) | 2 |
| Procesada (`Processed`) | 3 |
| Facturada (`Invoiced`) | 4 |
| Anulada (`Cancelled`) | 5 |

## PWA / Service Worker

La aplicación está configurada como **Progressive Web App**:

- `public/manifest.webmanifest` e íconos en `public/icons` para instalación en dispositivos móviles.
- `provideServiceWorker` registra `ngsw-worker.js` (deshabilitado en modo desarrollo, estrategia `registerWhenStable:30000` en producción).
- Comportamiento de caché/actualización definido en `ngsw-config.json`.

## Convenciones de código

- Formateo con **Prettier** (ver configuración en `package.json`): ancho de línea 100, comillas simples, parser `angular` para plantillas HTML.
- Estilos de componentes en **SCSS** (`schematics` en `angular.json`).
- Componentes **standalone**, sin módulos `NgModule`.

## Control de versiones

Repositorio remoto: [github.com/pacoyx/Laundry.PickupMobile](https://github.com/pacoyx/Laundry.PickupMobile)

```bash
git remote -v
git status
git push origin main
```

## Licencia

Software propietario de Lavandería Kyo. Todos los derechos reservados. Ver el archivo [LICENSE](LICENSE) para más detalles.
