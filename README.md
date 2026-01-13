# Sistema de Viajes UCAB

Sistema de gestión de viajes desarrollado con Next.js 14 y PostgreSQL. Permite a clientes buscar, reservar y gestionar viajes, mientras que administradores y proveedores gestionan servicios, paquetes, usuarios y reportes.

## Visión General

ViajesUCAB es una plataforma de e-commerce para la gestión de viajes turísticos que conecta clientes con servicios de viaje (vuelos, hoteles, cruceros, traslados). El sistema maneja todo el ciclo de vida de una reserva: desde la búsqueda y selección de servicios hasta el pago, financiamiento, reembolsos y atención postventa.

### Problema que Resuelve

El sistema centraliza la gestión de:
- Catálogo de servicios y paquetes turísticos
- Proceso de compra y pago (incluyendo financiamiento por cuotas)
- Gestión de reembolsos y cancelaciones
- Sistema de reclamos y valoraciones
- Control de acceso basado en roles (cliente, proveedor, administrador)

### Tipo de Sistema

Aplicación web full-stack con arquitectura orientada a base de datos (database-first), donde la lógica de negocio reside principalmente en funciones y stored procedures de PostgreSQL, y la aplicación actúa como capa de presentación y validación.

## Arquitectura

### Estructura de Carpetas

```
Sistema-de-ViajesUCAB-BD/
├── app/                    # Aplicación Next.js (App Router)
│   ├── api/               # Endpoints API REST
│   │   ├── admin/        # APIs de administración
│   │   ├── cliente/      # APIs para clientes
│   │   ├── auth/         # Autenticación
│   │   └── ...
│   ├── admin/            # Páginas de administración
│   ├── carrito/          # Página del carrito
│   ├── mis-viajes/       # Gestión de viajes del cliente
│   ├── paquetes/         # Catálogo de paquetes
│   └── ...
├── components/            # Componentes React reutilizables
│   ├── ui/              # Componentes UI base (shadcn/ui)
│   └── ...
├── lib/                   # Utilidades y configuraciones
│   ├── db.ts            # Conexión a PostgreSQL
│   ├── auth.ts          # Lógica de autenticación
│   └── require-admin.ts # Middleware de permisos
├── scripts/              # Scripts SQL de base de datos
│   ├── CREATE_FINAL.sql # DDL completo (tablas, funciones, SP)
│   ├── DROP_FINAL.sql   # Script de limpieza
│   └── INSERT_FINAL.sql # Datos de prueba
└── styles/              # Estilos globales
```

### Capas del Proyecto

1. **Frontend (Next.js App Router)**
   - Páginas en `app/` usando Server Components y Client Components
   - Componentes reutilizables en `components/`
   - Estilos con Tailwind CSS y shadcn/ui
   - Manejo de estado con React hooks

2. **Backend (API Routes)**
   - Endpoints REST en `app/api/`
   - Validación de permisos con `lib/require-admin.ts`
   - Manejo de errores centralizado
   - Traducción de errores de BD a mensajes de negocio

3. **Base de Datos (PostgreSQL)**
   - Pool de conexiones en `lib/db.ts`
   - Funciones almacenadas (PL/pgSQL) para lógica compleja
   - Stored procedures para operaciones transaccionales
   - Validaciones de negocio en constraints y funciones

### Separación de Responsabilidades

- **Base de Datos:** Lógica de negocio, validaciones, cálculos, transacciones
- **Backend (API):** Validación de entrada, control de acceso, traducción de errores
- **Frontend:** Presentación, interacción con usuario, validaciones de UX

## Base de Datos

### Enfoque Database-First

El sistema está diseñado con un enfoque **database-first**, donde la base de datos es la fuente de verdad para la lógica de negocio. La aplicación invoca funciones y stored procedures, interpreta resultados y presenta información al usuario.

### Uso de Funciones y Stored Procedures

**Funciones almacenadas (PL/pgSQL) se usan para:**
- Operaciones que requieren transacciones atómicas
- Validaciones de negocio que deben ser consistentes
- Cálculos complejos (montos, intereses, reembolsos)
- Operaciones que afectan múltiples tablas
- Reglas de negocio que no deben duplicarse en la aplicación

**Ejemplos de funciones:**
- `inicio_sesion(email, contraseña)` - Autenticación y validación de credenciales
- `iniciar_venta(cliente_id)` - Crear nueva venta pendiente
- `agregar_item_itinerario(venta_id, servicio_id, fecha)` - Agregar servicio a itinerario
- `registrar_pago(venta_id, monto, metodo_pago_id, denominacion)` - Registrar pago y actualizar estado
- `agregar_cuotas(venta_id, tasa_interes, num_cuotas)` - Crear plan de financiamiento
- `pagar_cuota(cuota_id, monto, metodo_pago_id, denominacion)` - Pagar cuota individual
- `realizar_reembolso(venta_id)` - Procesar reembolso completo
- `cliente_cumple_restricciones(cliente_id, paquete_id)` - Validar restricciones de paquete
- `agregar_reclamo(comentario, cliente_id, tipo_reclamo_id, itinerario_id)` - Crear reclamo
- `cambiar_estado_reclamo(reclamo_id, estado_id)` - Cambiar estado de reclamo
- `agregar_resena(itinerario_id, calificacion, comentario)` - Crear reseña (valida venta pagada)

**Consultas directas se usan para:**
- Operaciones simples de lectura (SELECT)
- Listados y reportes
- Consultas específicas de la aplicación que no requieren lógica de negocio

### Configuración de Conexión

La aplicación se conecta a PostgreSQL usando un pool de conexiones configurado en `lib/db.ts`:

```typescript
import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
```

### Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos
```

## Funcionalidades Implementadas

### 1. Carrito e Itinerarios
- **Ruta:** `/carrito`
- **API:** `app/api/cliente/carrito/route.ts`
- **Funcionalidad:** 
  - Agregar servicios al carrito
  - Gestión de múltiples ventas pendientes
  - Cálculo automático de montos con conversión de moneda
  - Detección de cambios en precios y disponibilidad
  - Aplicación de descuentos y promociones

### 2. Pagos y Checkout
- **Ruta:** `/carrito` → Checkout
- **API:** `app/api/cliente/checkout/route.ts`
- **Funcionalidad:**
  - Procesamiento de pagos con múltiples métodos (tarjeta, depósito, billetera digital, cheque, criptomoneda)
  - Registro de transacciones usando `registrar_pago()`
  - Actualización automática de estados de venta
  - Soporte para planes de financiamiento

### 3. Lista de Deseos
- **Ruta:** Integrada en dashboard del cliente
- **API:** `app/api/cliente/deseos/route.ts`
- **Funcionalidad:**
  - Guardar servicios favoritos
  - Agregar servicios desde wishlist al carrito
  - Un solo item por cliente (diseño de BD)

### 4. Restricciones de Paquetes
- **Rutas:** `/paquetes/[id]`, `/admin/dashboard` (gestión)
- **APIs:** `app/api/cliente/paquetes/comprar/route.ts`, `app/api/admin/restricciones/route.ts`
- **Funcionalidad:**
  - Crear restricciones de paquetes (edad, estado civil, etc.)
  - Validación automática al comprar usando `cliente_cumple_restricciones()`
  - Gestión administrativa de restricciones
  - Mensajes claros cuando no se cumplen restricciones

### 5. Reembolsos
- **Ruta:** `/cancelaciones-reembolsos`
- **API:** `app/api/cliente/reembolsos/route.ts`, `app/api/cliente/reembolsos/calcular/route.ts`
- **Funcionalidad:**
  - Solicitud de reembolso para compras pagadas
  - Cálculo de monto a reembolsar (con penalizaciones si aplica)
  - Procesamiento usando `realizar_reembolso()`
  - Visualización de historial de reembolsos
  - Seguimiento de estado

### 6. Financiamiento por Cuotas
- **Rutas:** `/carrito` (selección), `/mis-viajes` (gestión)
- **APIs:** `app/api/cliente/checkout/route.ts`, `app/api/cliente/cuotas/route.ts`, `app/api/cliente/cuotas/pagar/route.ts`
- **Funcionalidad:**
  - Selección de plan de cuotas en checkout (3, 6, 12 cuotas)
  - Creación automática de plan usando `agregar_cuotas()`
  - Cronograma de cuotas con fechas automáticas
  - Pago individual de cuotas usando `pagar_cuota()`
  - Visualización de saldo pendiente y progreso

### 7. Reclamos, Quejas y Valoraciones
- **Rutas:** `/reclamos`, `/mis-viajes`, `/admin/dashboard` (gestión)
- **APIs:** 
  - Cliente: `app/api/cliente/reclamos/route.ts`, `app/api/cliente/resenas/route.ts`
  - Admin: `app/api/admin/reclamos/route.ts`, `app/api/admin/resenas/route.ts`
- **Funcionalidad:**
  - Crear reclamos asociados a servicios comprados
  - Seguimiento de estado de reclamos (En Espera, En Proceso, Resuelto, Cerrado)
  - Crear valoraciones (reseñas) para servicios pagados
  - Validación: una sola reseña por itinerario
  - Gestión administrativa de reclamos y moderación de reseñas

### 8. Roles y Privilegios
- **Rutas:** `/admin/*`, `/proveedor/*`
- **APIs:** `app/api/admin/*`, `app/api/proveedor/*`
- **Funcionalidad:**
  - Sistema RBAC (Role-Based Access Control)
  - Roles: Cliente (1), Proveedor (2), Administrador (3)
  - Permisos: Lectura (1), Escritura (2), Actualización (3), Eliminación (4)
  - Middleware de protección de rutas
  - Gestión de usuarios y permisos

## Flujo General del Sistema

### Flujo del Cliente

1. **Búsqueda y Exploración**
   - Cliente busca servicios o paquetes
   - Ve detalles, precios, disponibilidad
   - Puede agregar a wishlist

2. **Construcción del Itinerario**
   - Agrega servicios al carrito
   - Selecciona fechas para cada servicio
   - Ve total calculado con conversión de moneda

3. **Checkout y Pago**
   - Selecciona método de pago
   - Opcionalmente elige plan de financiamiento
   - Completa el pago
   - Recibe confirmación

4. **Post-Compra**
   - Ve sus compras en "Mis Viajes"
   - Puede solicitar reembolsos
   - Puede pagar cuotas pendientes
   - Puede crear reseñas y reclamos

### Flujo del Administrador

1. **Gestión de Contenido**
   - Crea y edita servicios
   - Crea y edita paquetes
   - Gestiona promociones y descuentos
   - Configura restricciones de paquetes

2. **Gestión de Usuarios**
   - Gestiona clientes y proveedores
   - Asigna roles y permisos
   - Controla acceso al sistema

3. **Atención Postventa**
   - Revisa y gestiona reclamos
   - Cambia estados de reclamos
   - Modera reseñas y valoraciones
   - Gestiona reembolsos

4. **Reportes y Análisis**
   - Ve reportes de ventas
   - Analiza satisfacción del cliente
   - Monitorea métricas del sistema

## Cómo Ejecutar el Proyecto

### Prerrequisitos

- Node.js 18+ y npm/pnpm
- PostgreSQL 12+
- Variables de entorno configuradas

### Instalación

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd Sistema-de-ViajesUCAB-BD
```

2. **Instalar dependencias:**
```bash
npm install
# o
pnpm install
```

3. **Configurar base de datos:**
   - Crear la base de datos en PostgreSQL
   - Ejecutar `scripts/DROP_FINAL.sql` (si hay datos previos que limpiar)
   - Ejecutar `scripts/CREATE_FINAL.sql` para crear el esquema completo (tablas, funciones, stored procedures)
   - (Opcional) Ejecutar `scripts/INSERT_FINAL.sql` para datos de prueba

4. **Configurar variables de entorno:**
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales de PostgreSQL
```

5. **Ejecutar en desarrollo:**
```bash
npm run dev
# o
pnpm dev
```

6. **Abrir en el navegador:**
```
http://localhost:3000
```

### Scripts Disponibles

- `npm run dev` - Servidor de desarrollo con hot-reload
- `npm run build` - Compilar para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Ejecutar linter

## Sistema de Autenticación y Permisos

### Roles

1. **Cliente (rolId: 1)**
   - Acceso a catálogo público
   - Gestión de carrito e itinerarios
   - Mis viajes, wishlist, reclamos y reseñas
   - Solicitud de reembolsos

2. **Proveedor (rolId: 2)**
   - Gestión de servicios propios
   - Visualización de reservas relacionadas
   - Reportes de servicios

3. **Administrador (rolId: 3)**
   - Acceso completo al sistema
   - Gestión de usuarios, roles y permisos
   - Gestión de servicios, paquetes y promociones
   - Atención postventa (reclamos, reseñas, reembolsos)
   - Reportes y análisis

### Permisos

- **1: LECTURA** - Ver recursos
- **2: ESCRITURA** - Crear recursos
- **3: ACTUALIZACIÓN** - Modificar recursos
- **4: ELIMINACIÓN** - Eliminar recursos

### Middleware

El middleware en `middleware.ts` protege rutas según el rol:
- `/admin/*` - Solo administradores
- `/proveedor/*` - Proveedores y administradores
- `/api/admin/*` - Validación de permisos por endpoint
- `/api/cliente/*` - Requiere autenticación de cliente

## Base de Datos

### Tablas Principales

- **cliente** - Datos personales de clientes
- **usuario** - Credenciales y roles
- **servicio** - Servicios de viaje (aéreos, hoteles, cruceros, terrestres)
- **paquete** - Paquetes turísticos compuestos
- **venta** - Transacciones de compra
- **itinerario** - Items de una venta (servicios con fechas)
- **pago** - Registro de pagos
- **reembolso** - Solicitudes de reembolso
- **plan_cuotas** - Planes de financiamiento
- **cuota** - Cuotas individuales de un plan
- **reclamo** - Reclamos de clientes
- **resena** - Reseñas y valoraciones
- **restriccion** - Restricciones de paquetes
- **lista_deseo** - Wishlist de clientes

### Funciones Almacenadas Importantes

- `inicio_sesion(email, contraseña)` - Autenticación
- `iniciar_venta(cliente_id)` - Crear venta pendiente
- `agregar_item_itinerario(venta_id, servicio_id, fecha)` - Agregar servicio
- `registrar_pago(venta_id, monto, metodo_pago_id, denominacion)` - Registrar pago
- `agregar_cuotas(venta_id, tasa_interes, num_cuotas)` - Crear plan de cuotas
- `pagar_cuota(cuota_id, monto, metodo_pago_id, denominacion)` - Pagar cuota
- `realizar_reembolso(venta_id)` - Procesar reembolso
- `cliente_cumple_restricciones(cliente_id, paquete_id)` - Validar restricciones
- `agregar_reclamo(comentario, cliente_id, tipo_reclamo_id, itinerario_id)` - Crear reclamo
- `cambiar_estado_reclamo(reclamo_id, estado_id)` - Cambiar estado
- `agregar_resena(itinerario_id, calificacion, comentario)` - Crear reseña

## Tecnologías Utilizadas

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL
- **Driver:** pg (node-postgres)
- **UI:** Tailwind CSS + shadcn/ui
- **Autenticación:** Cookies HTTP-only
- **Validación:** Zod + React Hook Form
- **Notificaciones:** Sonner (toast)

## Consideraciones Importantes

### Integridad Referencial

- Todas las operaciones respetan las foreign keys de la BD
- Las funciones almacenadas manejan transacciones automáticamente
- Los deletes en cascada están configurados donde corresponde
- No se permiten operaciones que rompan la integridad

### Manejo de Errores

- Los errores de BD se capturan y se muestran mensajes claros al usuario
- Nunca se exponen detalles técnicos de errores SQL
- Las validaciones se hacen tanto en frontend como en backend
- Los mensajes son en español y orientados al usuario

### Seguridad

- Las contraseñas se almacenan en texto plano (requiere implementar hash en producción)
- Las cookies de sesión son HTTP-only
- Las validaciones de permisos se hacen en cada endpoint
- Las consultas usan parámetros preparados para prevenir SQL injection
- El middleware protege rutas sensibles

### Lógica de Negocio

- La lógica de negocio reside principalmente en la base de datos
- La aplicación invoca funciones/SP, valida entrada y presenta resultados
- No se duplica lógica de negocio en la aplicación
- Los cálculos (montos, intereses, reembolsos) se hacen en la BD

## Licencia

Proyecto académico - Universidad Católica Andrés Bello (UCAB)
