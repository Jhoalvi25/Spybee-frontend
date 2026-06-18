# Spybee Frontend Challenge

Aplicacion web para gestion de incidencias en obras de construccion. Desarrollada como prueba tecnica para el puesto de Desarrollador Frontend.

Permite visualizar incidencias en un mapa interactivo, crearlas, consultar su detalle, y acceder a metricas agregadas en un dashboard.

## Caracteristicas

- Dashboard de incidencias con graficos y metricas
- Mapa interactivo con Mapbox GL
- Creacion de incidencias con formulario validado
- Detalle de incidencias con edicion en linea
- Filtros combinados y busqueda por texto
- Persistencia local de incidencias creadas por el usuario
- Autenticacion simulada (login/logout)
- Diseno responsive (desktop y mobile)
- Tema claro y oscuro
- Pruebas unitarias con Vitest

## Tecnologias

| Tecnologia            | Uso                                 |
| --------------------- | ----------------------------------- |
| Next.js 15            | Framework de React con App Router   |
| React 19              | Libreria de interfaz de usuario     |
| TypeScript            | Tipado estatico                     |
| Zustand 5             | Estado global liviano               |
| Mapbox GL 3           | Visualizacion geografica            |
| SCSS Modules          | Estilos encapsulados por componente |
| Recharts              | Graficos y metricas del dashboard   |
| React Hook Form + Zod | Formularios y validacion            |
| Vitest                | Pruebas unitarias                   |

## Arquitectura del proyecto

```
src/
├── app/             # Paginas y layouts de Next.js App Router
├── components/      # Componentes de UI agrupados por feature
│   ├── dashboard/   # Graficos y metricas
│   ├── incident/    # Formularios, detalle, listado de incidencias
│   ├── layout/      # Header, sidebar, tema
│   ├── map/         # Mapa, marcadores, controles
│   └── ui/          # Componentes base (Toast, etc.)
├── domain/          # Logica de negocio y estado
│   ├── auth/        # Autenticacion simulada
│   ├── incident/    # Store, tipos, selectores, datos mock
│   ├── project/     # Tipos de proyecto
│   └── ui/          # Store de UI (tema, toasts)
├── hooks/           # Hooks personalizados (dashboard)
├── lib/             # Utilidades, constantes, formato
├── services/        # Capa de servicios (API mock)
└── styles/          # Variables, tokens, tema global
```

## Instalacion

```bash
git clone <repo-url>
cd spybee-frontend
npm install
```

Crear archivo `.env.local` con el token de Mapbox:

```
NEXT_PUBLIC_MAPBOX_TOKEN=tu_token_aqui
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Comando              | Descripcion                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Inicia el servidor de desarrollo       |
| `npm run build`      | Compila la aplicacion para produccion  |
| `npm run typecheck`  | Ejecuta TypeScript sin emitir archivos |
| `npm run test`       | Ejecuta las pruebas unitarias una vez  |
| `npm run test:watch` | Ejecuta pruebas en modo observador     |

## Decisiones tecnicas

**Zustand** para estado global. Es liviano, sin boilerplate, y suficiente para una aplicacion de este tamano. Se evita Redux por ser excesivo para el alcance del proyecto. El store de incidencias usa `persist` para mantener datos del usuario entre sesiones.

**React Hook Form** con Zod para formularios. RHF maneja el estado del formulario de manera eficiente y evita re-renderizados innecesarios. Zod proporciona validacion declarativa con inferencia de tipos.

**Mapbox GL** para el mapa interactivo. Permite marcadores personalizados, popups, y control de camara. Los datos mock usan coordenadas en Santiago de Chile.

**SCSS Modules** para estilos. Encapsulacion por componente sin colisiones de nombres. Variables globales y tema (claro/oscuro) definidos en `src/styles/`.

**Recharts** para graficos del dashboard. Componentes declarativos que se integran bien con React. Se usa para barras, donuts y lineas de tendencia.

**Persistencia local.** Incidencias creadas por el usuario se guardan en localStorage via Zustand `persist`. Los datos mock iniciales siempre se cargan desde el archivo JSON y las incidencias del usuario se fusionan al iniciar.

## Funcionalidades implementadas

- [x] Dashboard de incidencias (total, abiertas, cerradas, vencidas, distribucion por estado/prioridad/categoria, tendencia mensual)
- [x] Mapa interactivo con marcadores por estado
- [x] Creacion de incidencias con formulario y coordenadas desde el mapa
- [x] Detalle de incidencias con edicion de campos
- [x] Filtros por estado, prioridad, categoria, proyecto y busqueda de texto
- [x] Persistencia de datos en localStorage
- [x] Autenticacion simulada (login con credenciales mock)
- [x] Diseno responsive (adaptacion a mobile con menu colapsable)
- [x] Tema claro/oscuro con persistencia de preferencia
- [x] Pruebas unitarias (53 tests en store, selectores, dashboard, formato de fechas)

## Posibles mejoras

- Integracion con API real para CRUD de incidencias
- Carga y visualizacion de archivos multimedia (imagenes, planos)
- Clustering de marcadores en el mapa para alto volumen de datos
- Notificaciones en tiempo real ante cambios de estado
- Gestion de permisos y roles por proyecto

## Autor

**Jhoalvi Pereira**

- GitHub: [Jhoalvi25](https://github.com/Jhoalvi25)
- LinkedIn: [Jhoalvi Pereira](https://www.linkedin.com/in/jhoalvi-pereira-laguna-477468242/)
