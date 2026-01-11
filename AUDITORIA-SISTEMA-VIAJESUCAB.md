# 📋 AUDITORÍA COMPLETA DEL SISTEMA VIAJESUCAB

**Fecha de Auditoría:** Enero 2025  
**Alcance:** Frontend, Backend (APIs), Base de Datos (DDL y Funciones)  
**Objetivo:** Evaluar el estado de implementación de los 6 requisitos oficiales de la última entrega

---

## 1️⃣ RESUMEN EJECUTIVO

### ✅ **Qué está sólido:**

- **Reclamos, quejas y valoraciones:** Completamente implementado en BD y frontend con APIs funcionales
- **Manejo de usuarios, roles y privilegios:** Sistema completo con gestión de roles, permisos y usuarios
- **Reembolsos:** Soporte completo en BD (SP `realizar_reembolso`) aunque el frontend es parcial (UI mockup sin integración)
- **Reseñas:** APIs y componentes funcionales, integrados en "Mis Viajes"

### 🟡 **Qué es parcial:**

- **Lista de deseos:** UI completa pero sin integración con BD (datos hardcodeados, función `listar_deseos` existe pero no se usa)
- **Restricciones de paquetes:** Creación y almacenamiento funcionan, pero **NO se validan al comprar** (falta llamar a `cliente_cumple_restricciones`)
- **Financiamiento con cuotas:** Tablas y funciones de BD completas, pero no hay integración en checkout (UI permite seleccionar cuotas pero no las procesa)

### 🔴 **Qué bloquea la entrega:**

1. **Restricciones de paquetes no se aplican:** Los paquetes pueden comprarse sin validar restricciones (edad, estado civil, etc.)
2. **Lista de deseos no persiste:** Los datos se pierden al recargar (solo existe en memoria del componente)
3. **Cuotas no se procesan:** El checkout no llama a `agregar_cuotas` ni a `pagar_cuota`

---

## 2️⃣ MATRIZ REQUISITOS → ESTADO → EVIDENCIA → ACCIÓN

### **Requisito 1: Lista de deseos de los clientes**

| Aspecto | Estado | Evidencia | Acción Propuesta |
|---------|--------|-----------|------------------|
| **BD (Tabla `lista_deseo`)** | ✅ Implementado | `CREATE TABLE lista_deseo` con `fk_cliente`, `fk_lugar`, `fk_servicio` | - |
| **BD (Función `listar_deseos`)** | ✅ Implementado | Función PL/pgSQL `listar_deseos(integer, integer, integer)` | - |
| **Frontend (Componente `wishlist.tsx`)** | 🟡 Parcial | UI completa con datos hardcodeados (líneas 46-107) | Integrar con API |
| **Frontend (Botón `wishlist-button.tsx`)** | 🟡 Parcial | Componente funcional pero sin persistencia (solo estado local) | Conectar a API |
| **Backend (API)** | 🔴 No implementado | No existe `/api/cliente/deseos` o similar | Crear endpoint POST/GET/DELETE |
| **Integración** | 🔴 No implementado | Función BD no se llama desde ningún endpoint | Implementar endpoints que usen `listar_deseos` |

**Evidencia del código:**
- `components/wishlist.tsx`: Estado local con datos mock (línea 46)
- `components/wishlist-button.tsx`: Estado local `isInWishlist` (línea 17)
- BD: Función `listar_deseos` existe en DDL pero no se usa
- BD: Tabla `lista_deseo` tiene constraint que permite solo lugar O servicio

---

### **Requisito 2: Aplicar restricciones de paquetes (crear y aplicar)**

| Aspecto | Estado | Evidencia | Acción Propuesta |
|---------|--------|-----------|------------------|
| **BD (Tabla `restriccion`)** | ✅ Implementado | Tabla con `fk_paquete`, `caracteristica`, `operador`, `valor_restriccion` | - |
| **BD (SP `gestionar_restriccion_paquete`)** | ✅ Implementado | SP para crear restricciones (valida permisos Admin/Proveedor) | - |
| **BD (Función `cliente_cumple_restricciones`)** | ✅ Implementado | Valida edad y estado civil del cliente vs restricciones | - |
| **Frontend (Crear restricciones)** | ✅ Implementado | `components/packages-management.tsx` permite agregar restricciones | - |
| **Backend (API crear restricciones)** | ✅ Implementado | `app/api/admin/paquetes/route.ts` usa `insertar_paquete` con restricciones | - |
| **Validación al comprar** | 🔴 **CRÍTICO: NO IMPLEMENTADO** | `app/api/cliente/paquetes/comprar/route.ts` llama a `vender_paquete` SIN validar | **Llamar a `cliente_cumple_restricciones` ANTES de `vender_paquete`** |
| **UI mostrar restricciones** | ✅ Implementado | `app/paquetes/[id]/page.tsx` muestra restricciones en tab | - |

**Evidencia del código:**
- `app/api/cliente/paquetes/comprar/route.ts` (línea 95): Llama directamente a `vender_paquete` sin validar restricciones
- BD: Función `cliente_cumple_restricciones(i_id_cliente, i_id_paquete)` existe y funciona
- BD: Función `gestionar_restriccion_paquete` existe pero se usa solo para crear, no para validar

**Bug crítico identificado:**
```typescript
// ACTUAL (INCORRECTO):
const { rows } = await pool.query(
  `SELECT vender_paquete($1, $2, $3::timestamp without time zone[]) AS ids_itinerarios`,
  [clienteId, id_paquete, fechasTimestamp]
);

// DEBERÍA SER:
// 1. Validar restricciones primero
const { rows: cumple } = await pool.query(
  `SELECT cliente_cumple_restricciones($1, $2) AS cumple`,
  [clienteId, id_paquete]
);
// 2. Si cumple, proceder con vender_paquete
```

---

### **Requisito 3: Reembolsos**

| Aspecto | Estado | Evidencia | Acción Propuesta |
|---------|--------|-----------|------------------|
| **BD (Tabla `reembolso`)** | ✅ Implementado | Tabla con `id_reembolso`, `monto_reembolso`, `fk_venta` | - |
| **BD (SP `realizar_reembolso`)** | ✅ Implementado | SP completo que actualiza estado, crea registro en `reembolso` y `pago` | - |
| **Frontend (UI `cancellations-refunds.tsx`)** | 🟡 Parcial | Componente visual completo pero con datos mock (línea 16) | Integrar con API |
| **Backend (API)** | 🔴 No implementado | No existe `/api/cliente/reembolsos` o `/api/admin/reembolsos` | Crear endpoints POST (cliente solicita) y GET (admin gestiona) |
| **Validaciones** | ✅ Implementado (en SP) | SP valida estado "Pagado" antes de reembolsar | - |

**Evidencia del código:**
- `components/cancellations-refunds.tsx`: Datos hardcodeados (líneas 16-54)
- BD: SP `realizar_reembolso(i_id_venta)` implementado correctamente
- BD: El SP maneja transacción, actualiza estado a "Reembolsado", registra en `pago`

**Nota:** El SP está listo pero falta exponerlo vía API.

---

### **Requisito 4: Financiamiento con pago de cuotas**

| Aspecto | Estado | Evidencia | Acción Propuesta |
|---------|--------|-----------|------------------|
| **BD (Tablas `plan_cuotas`, `cuota`, `cuo_ecuo`)** | ✅ Implementado | Estructura completa para planes de cuotas | - |
| **BD (Función `agregar_cuotas`)** | ✅ Implementado | Crea plan de cuotas y cuotas individuales con fechas | - |
| **BD (Función `pagar_cuota`)** | ✅ Implementado | Valida monto, actualiza estado de cuota, registra pago | - |
| **Frontend (UI checkout)** | 🟡 Parcial | `components/cart-checkout.tsx` permite seleccionar cuotas (línea 752) pero no las procesa | Integrar llamada a `agregar_cuotas` |
| **Backend (API checkout)** | 🔴 No implementado | `app/api/cliente/checkout/route.ts` NO llama a `agregar_cuotas` ni maneja cuotas | Agregar lógica para crear plan de cuotas si se selecciona |

**Evidencia del código:**
- `components/cart-checkout.tsx` (línea 82): Estado `installments` existe
- `components/cart-checkout.tsx` (línea 752-763): UI para seleccionar cuotas
- `app/api/cliente/checkout/route.ts`: Solo llama a `registrar_pago`, no a `agregar_cuotas`
- BD: Funciones `agregar_cuotas` y `pagar_cuota` funcionan correctamente

**Gap identificado:**
El checkout actual siempre llama a `registrar_pago` para pago único. Si `installments !== "1"`, debería:
1. Llamar a `agregar_cuotas(id_venta, monto_venta, tasa_interes, num_cuotas)`
2. Registrar el pago de la primera cuota con `pagar_cuota`

---

### **Requisito 5: Reclamos, quejas y valoraciones de los clientes**

| Aspecto | Estado | Evidencia | Acción Propuesta |
|---------|--------|-----------|------------------|
| **BD (Tablas `reclamo`, `tipo_reclamo`, `rec_est`, `resena`)** | ✅ Implementado | Estructura completa | - |
| **BD (Función `agregar_reclamo`)** | ✅ Implementado | Crea reclamo y estado inicial "En Espera" | - |
| **BD (Función `cambiar_estado_reclamo`)** | ✅ Implementado | Actualiza estado histórico | - |
| **BD (Función `agregar_resena`)** | ✅ Implementado | Valida que itinerario esté pagado antes de crear reseña | - |
| **Backend (API cliente reclamos)** | ✅ Implementado | `app/api/cliente/reclamos/route.ts` POST/GET funcionan | - |
| **Backend (API admin reclamos)** | ✅ Implementado | `app/api/admin/reclamos/route.ts` y `[id]/estado/route.ts` | - |
| **Backend (API cliente reseñas)** | ✅ Implementado | `app/api/cliente/resenas/route.ts` y `/itinerario/[id]/route.ts` | - |
| **Frontend (Componente `mis-viajes-list.tsx`)** | ✅ Implementado | Permite crear reseñas y reclamos desde "Mis Viajes" | - |
| **Frontend (Componente `postsale-management.tsx`)** | ✅ Implementado | Admin puede gestionar reclamos y ver reseñas | - |
| **Frontend (Componente `claims-surveys.tsx`)** | ✅ Implementado | UI para gestionar reclamos y encuestas | - |

**Evidencia del código:**
- `app/api/cliente/reclamos/route.ts`: Implementación completa
- `app/api/cliente/resenas/route.ts`: Implementación completa
- `components/mis-viajes-list.tsx`: Integrado con APIs reales (líneas 79-83)
- `components/postsale-management.tsx`: Gestiona reclamos desde admin

**✅ Estado:** Completamente funcional. No requiere acciones.

---

### **Requisito 6: Manejo de usuarios, roles y privilegios en la base de datos**

| Aspecto | Estado | Evidencia | Acción Propuesta |
|---------|--------|-----------|------------------|
| **BD (Tablas `rol`, `permiso`, `permiso_rol`, `usuario`)** | ✅ Implementado | Estructura completa con relaciones | - |
| **BD (Funciones de gestión)** | ✅ Implementado | `insertar_rol`, `eliminar_rol_seguro`, `agregar_permisos_rol`, `obtener_rol_permisos`, etc. | - |
| **Backend (API admin roles)** | ✅ Implementado | `app/api/admin/roles/route.ts` y `[id]/route.ts` completos | - |
| **Backend (API admin usuarios)** | ✅ Implementado | `app/api/admin/usuarios/route.ts` y `[id]/status/route.ts` | - |
| **Backend (Middleware auth)** | ✅ Implementado | `lib/require-admin.ts` valida permisos por rol y permisos específicos | - |
| **Frontend (Componente `user-role-management.tsx`)** | ✅ Implementado | UI completa para gestionar usuarios, roles y permisos | - |

**Evidencia del código:**
- `lib/require-admin.ts`: Sistema de permisos funcional (línea 22-33)
- `app/api/admin/roles/route.ts`: CRUD completo de roles
- `components/user-role-management.tsx`: UI completa e integrada
- BD: Funciones almacenadas usan transacciones y validaciones

**✅ Estado:** Completamente funcional. No requiere acciones.

---

## 3️⃣ HALLAZGOS CRÍTICOS (Alta severidad)

### 🔴 **CRÍTICO 1: Restricciones de paquetes NO se validan al comprar**

**Archivo:** `app/api/cliente/paquetes/comprar/route.ts`  
**Método:** `POST` (línea 95)  
**Impacto:** Los clientes pueden comprar paquetes sin cumplir restricciones (edad, estado civil, etc.)

**Causa:**
La función `cliente_cumple_restricciones` existe en BD pero nunca se llama antes de `vender_paquete`.

**Solución propuesta:**
```typescript
// ANTES de llamar a vender_paquete (línea 95):
// Validar restricciones
try {
  const { rows: validacion } = await pool.query(
    `SELECT cliente_cumple_restricciones($1, $2) AS cumple`,
    [clienteId, id_paquete]
  );
  // La función lanza EXCEPTION si no cumple, así que si llegamos aquí, cumple
} catch (e: any) {
  // La función lanza excepción con mensaje descriptivo si no cumple
  return NextResponse.json(
    { error: e.message ?? "No cumple con las restricciones del paquete" },
    { status: 400 }
  );
}

// Luego proceder con vender_paquete
const { rows } = await pool.query(
  `SELECT vender_paquete($1, $2, $3::timestamp without time zone[]) AS ids_itinerarios`,
  [clienteId, id_paquete, fechasTimestamp]
);
```

**Severidad:** 🔴 **BLOQUEANTE** - Viola requisitos de negocio

---

### 🔴 **CRÍTICO 2: Lista de deseos no persiste (solo UI mockup)**

**Archivos:** `components/wishlist.tsx`, `components/wishlist-button.tsx`  
**Impacto:** Los usuarios no pueden guardar items en lista de deseos (se pierden al recargar)

**Causa:**
- No existe API para gestionar lista de deseos
- La función BD `listar_deseos` existe pero no se expone
- Los componentes usan estado local con datos hardcodeados

**Solución propuesta:**
1. Crear `/api/cliente/deseos` (POST, GET, DELETE)
2. POST: Llamar a función `listar_deseos(i_fk_cliente, i_fk_lugar, i_fk_servicio)`
3. GET: Consultar tabla `lista_deseo` filtrando por `fk_cliente`
4. DELETE: Eliminar registro de `lista_deseo`
5. Actualizar `wishlist.tsx` y `wishlist-button.tsx` para usar APIs

**Severidad:** 🔴 **ALTA** - Funcionalidad requerida no funcional

---

### 🟡 **MEDIO 1: Reembolsos no están integrados en frontend**

**Archivo:** `components/cancellations-refunds.tsx`  
**Impacto:** Los clientes no pueden solicitar reembolsos desde la UI (solo existe el mockup)

**Causa:**
El SP `realizar_reembolso` existe pero no hay API que lo exponga.

**Solución propuesta:**
1. Crear `/api/cliente/reembolsos` POST (solicitar reembolso)
2. Crear `/api/cliente/reembolsos` GET (historial del cliente)
3. Crear `/api/admin/reembolsos` GET (todos los reembolsos)
4. Actualizar `cancellations-refunds.tsx` para usar APIs reales

**Severidad:** 🟡 **MEDIA** - Funcionalidad requerida pero el backend está listo

---

### 🟡 **MEDIO 2: Cuotas no se procesan en checkout**

**Archivos:** `app/api/cliente/checkout/route.ts`, `components/cart-checkout.tsx`  
**Impacto:** Los usuarios pueden seleccionar cuotas en UI pero el sistema procesa como pago único

**Causa:**
El checkout siempre llama a `registrar_pago` sin considerar si se seleccionó plan de cuotas.

**Solución propuesta:**
1. Modificar `checkout/route.ts` para recibir `plan_cuotas: { num_cuotas, tasa_interes }`
2. Si `plan_cuotas` está presente:
   - Llamar a `agregar_cuotas(id_venta, monto_total, tasa_interes, num_cuotas)`
   - Pagar primera cuota con `pagar_cuota(id_cuota_primera, monto_cuota, id_metodo_pago, denominacion)`
3. Si no, usar flujo actual de `registrar_pago`

**Severidad:** 🟡 **MEDIA** - Funcionalidad parcial, backend listo

---

## 4️⃣ HALLAZGOS MEDIOS Y BAJOS

### **Medio: UI de reembolsos con datos mock**
- `components/cancellations-refunds.tsx` usa datos hardcodeados
- Impacto: Bajo (solo afecta UX de demo)

### **Bajo: Validación de reseñas duplicadas**
- `app/api/cliente/resenas/route.ts` línea 83 usa columna incorrecta: `fk_itinerario_servicio` debería ser `fk_itinerario`
- Impacto: La validación de duplicados podría fallar

**Corrección sugerida:**
```typescript
// Línea 83 - CORREGIR:
const { rows: resenaExistente } = await pool.query(
  `SELECT id FROM resena WHERE fk_itinerario = $1`, // Cambiar fk_itinerario_servicio por fk_itinerario
  [id_itinerario]
);
```

---

## 5️⃣ FUNCIONALIDADES MARCADAS COMO "PRÓXIMAMENTE"

### **Ninguna funcionalidad marcada como "PRÓXIMAMENTE"**

**Observación importante:**
Todos los requisitos tienen soporte completo en la base de datos. No hay funcionalidades que requieran cambios en BD para implementarse.

Las siguientes funcionalidades están **parcialmente implementadas** pero **NO** requieren cambios en BD:

1. **Lista de deseos:** Tabla y función BD existen, solo falta API
2. **Reembolsos:** SP completo existe, solo falta API
3. **Cuotas:** Funciones BD completas, solo falta integrar en checkout
4. **Restricciones:** Validación existe, solo falta llamarla

**Recomendación:** Todas estas funcionalidades pueden completarse en la iteración actual sin modificar BD.

---

## 6️⃣ PLAN DE CIERRE POR ITERACIONES

### **Iteración 1: Quick Wins (Críticos bloqueantes)**

**Duración estimada:** 2-3 días  
**Prioridad:** 🔴 **BLOQUEANTE**

1. ✅ **Validar restricciones al comprar paquetes**
   - Archivo: `app/api/cliente/paquetes/comprar/route.ts`
   - Acción: Agregar llamada a `cliente_cumple_restricciones` antes de `vender_paquete`
   - Tiempo: 2 horas

2. ✅ **Corregir validación de reseñas duplicadas**
   - Archivo: `app/api/cliente/resenas/route.ts`
   - Acción: Cambiar columna `fk_itinerario_servicio` por `fk_itinerario`
   - Tiempo: 15 minutos

**Resultado esperado:** Los paquetes con restricciones ya no pueden comprarse sin validación.

---

### **Iteración 2: Completar flujos existentes (Funcionalidades parciales)**

**Duración estimada:** 3-4 días  
**Prioridad:** 🟡 **ALTA**

1. ✅ **Implementar API de lista de deseos**
   - Crear `app/api/cliente/deseos/route.ts` (POST, GET, DELETE)
   - Integrar `wishlist.tsx` y `wishlist-button.tsx` con API
   - Tiempo: 1 día

2. ✅ **Implementar API de reembolsos**
   - Crear `app/api/cliente/reembolsos/route.ts` (POST, GET)
   - Crear `app/api/admin/reembolsos/route.ts` (GET)
   - Integrar `cancellations-refunds.tsx` con API
   - Tiempo: 1 día

3. ✅ **Integrar cuotas en checkout**
   - Modificar `app/api/cliente/checkout/route.ts` para manejar cuotas
   - Modificar `components/cart-checkout.tsx` para enviar datos de cuotas
   - Tiempo: 1 día

**Resultado esperado:** Todas las funcionalidades requeridas están completamente operativas.

---

### **Iteración 3: Hardening y limpieza**

**Duración estimada:** 2 días  
**Prioridad:** 🟢 **MEJORA**

1. ✅ **Testing manual completo**
   - Probar todos los flujos end-to-end
   - Validar casos edge (restricciones, cuotas, reembolsos)

2. ✅ **Documentación**
   - Actualizar README con nuevas funcionalidades
   - Documentar APIs nuevas

3. ✅ **Mejoras de UX**
   - Mensajes de error más descriptivos
   - Loading states mejorados
   - Validaciones en frontend adicionales

**Resultado esperado:** Sistema robusto, probado y documentado.

---

## 7️⃣ CHECKLIST DE PRUEBAS MANUALES

### **Requisito 1: Lista de deseos**
- [ ] Agregar servicio a lista de deseos desde detalle de servicio
- [ ] Agregar lugar a lista de deseos desde búsqueda
- [ ] Ver lista de deseos en "Mi Lista de Deseos"
- [ ] Eliminar item de lista de deseos
- [ ] Verificar que persiste después de recargar página
- [ ] Agregar/eliminar desde botón de corazón en grids

### **Requisito 2: Restricciones de paquetes**
- [ ] Crear paquete con restricción de edad (ej: > 50)
- [ ] Crear paquete con restricción de estado civil (ej: = "casado")
- [ ] Intentar comprar paquete con restricción sin cumplir (debe fallar con mensaje claro)
- [ ] Intentar comprar paquete con restricción cumpliendo (debe permitir)
- [ ] Ver restricciones en detalle de paquete
- [ ] Gestionar restricciones desde admin (agregar/eliminar)

### **Requisito 3: Reembolsos**
- [ ] Solicitar reembolso de venta pagada desde "Cancelaciones y Reembolsos"
- [ ] Ver historial de reembolsos
- [ ] Verificar que el estado de la venta cambia a "Reembolsado"
- [ ] Verificar que se crea registro en tabla `reembolso`
- [ ] Verificar que se crea registro en tabla `pago` con referencia al reembolso
- [ ] Intentar reembolsar venta no pagada (debe fallar)

### **Requisito 4: Cuotas**
- [ ] Seleccionar plan de 3 cuotas en checkout
- [ ] Completar checkout con cuotas
- [ ] Verificar que se crea `plan_cuotas`
- [ ] Verificar que se crean las cuotas individuales
- [ ] Verificar que se paga la primera cuota
- [ ] Verificar que las cuotas tienen fechas correctas (30 días entre cada una)
- [ ] Verificar estado de cuotas (primera pagada, demás pendientes)
- [ ] Pagar cuota pendiente (requiere endpoint adicional o flujo manual)

### **Requisito 5: Reclamos y reseñas**
- [ ] Crear reclamo desde "Mis Viajes" para itinerario pagado
- [ ] Ver lista de reclamos del cliente
- [ ] Admin: Ver todos los reclamos
- [ ] Admin: Cambiar estado de reclamo
- [ ] Crear reseña desde "Mis Viajes" para itinerario pagado
- [ ] Ver reseñas de un itinerario
- [ ] Intentar crear reseña para itinerario no pagado (debe fallar)
- [ ] Intentar crear reseña duplicada (debe fallar)

### **Requisito 6: Roles y permisos**
- [ ] Crear nuevo rol desde admin
- [ ] Asignar permisos a rol
- [ ] Crear usuario con rol personalizado
- [ ] Verificar que los permisos funcionan (acceso a recursos según permiso)
- [ ] Eliminar rol (solo si no tiene usuarios)
- [ ] Intentar eliminar rol con usuarios (debe fallar)
- [ ] Activar/desactivar usuario
- [ ] Usuario desactivado no puede iniciar sesión

---

## 📊 RESUMEN DE ESTADO GENERAL

| Requisito | Estado General | % Completitud | Bloqueos |
|-----------|----------------|---------------|----------|
| 1. Lista de deseos | 🟡 Parcial | 60% | Falta API y integración |
| 2. Restricciones paquetes | 🟡 Parcial | 80% | **CRÍTICO: No se validan al comprar** |
| 3. Reembolsos | 🟡 Parcial | 70% | Falta API y integración |
| 4. Cuotas | 🟡 Parcial | 65% | No se procesan en checkout |
| 5. Reclamos y reseñas | ✅ Completo | 100% | Ninguno |
| 6. Roles y permisos | ✅ Completo | 100% | Ninguno |

**Completitud general del sistema:** **~76%**

**Bloqueos críticos:** 1 (Restricciones no validadas)  
**Funcionalidades parciales:** 4 (Lista deseos, Reembolsos, Cuotas, Restricciones)  
**Funcionalidades completas:** 2 (Reclamos/Reseñas, Roles/Permisos)

---

## 📝 NOTAS FINALES

1. **Base de datos está sólida:** Todos los requisitos tienen soporte completo en BD. No se requieren cambios en esquema.

2. **Priorización clara:** La validación de restricciones es el único bloqueo crítico. Debe resolverse primero.

3. **Tiempo estimado para completitud:** 5-7 días de desarrollo para cerrar todas las funcionalidades parciales.

4. **Riesgos identificados:**
   - Restricciones no validadas: Riesgo de negocio (clientes comprando paquetes incorrectos)
   - Cuotas no procesadas: Riesgo funcional (expectativa vs realidad)
   - Lista de deseos no persistente: Riesgo de UX (frustración de usuarios)

5. **Recomendaciones:**
   - Priorizar Iteración 1 (críticos) antes de cualquier otra tarea
   - Realizar testing manual exhaustivo antes de considerar cerrada cualquier iteración
   - Considerar agregar tests automatizados para validaciones críticas (restricciones, permisos)

---

**Fin del Informe de Auditoría**
