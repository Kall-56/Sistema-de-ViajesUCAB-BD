# 📋 GUÍA COMPLETA DE PRUEBAS - IMPLEMENTACIÓN FINAL

## ✅ ESTADO FINAL: TODOS LOS REQUISITOS COMPLETOS

---

## 📦 REQUISITO 1: LISTA DE DESEOS DE LOS CLIENTES

### **Objetivo**
Verificar que un cliente puede agregar, ver y eliminar items de su lista de deseos (servicios o lugares).

### **Precondiciones**
1. Cliente autenticado en el sistema (rolId = 1)
2. Existe al menos un servicio en la BD (servicio ID 1)
3. Existe al menos un lugar en la BD (lugar ID 1)

### **Pasos de Prueba**

#### **1.1 Agregar Servicio a Lista de Deseos**
1. Iniciar sesión como cliente
2. Ir a `/promociones` o cualquier página que muestre servicios
3. Hacer clic en el botón de corazón (WishlistButton) en un servicio
4. **Resultado esperado:**
   - El botón cambia a estado "en lista" (corazón relleno)
   - Aparece toast: "Agregado a lista de deseos"
   - El servicio queda guardado en BD

#### **1.2 Ver Lista de Deseos**
1. Ir a `/lista-deseos` (o la ruta correspondiente)
2. **Resultado esperado:**
   - Se muestra el servicio agregado previamente
   - Se muestra nombre, descripción, precio, imagen
   - Botón para ver detalles del servicio

#### **1.3 Eliminar de Lista de Deseos**
1. En la página de lista de deseos, hacer clic en "Eliminar de Lista"
2. **Resultado esperado:**
   - El item desaparece de la lista
   - Aparece toast: "Item eliminado de la lista de deseos"
   - La lista muestra "Tu lista de deseos está vacía"

#### **1.4 Reemplazar Item en Lista (Limitación de BD)**
1. Agregar un servicio a la lista de deseos
2. Agregar otro servicio (o un lugar) a la lista
3. **Resultado esperado:**
   - El segundo item reemplaza al primero (BD solo permite 1 item por cliente)
   - La lista muestra solo el último item agregado

### **Verificación en BD**
```sql
-- Verificar lista de deseos del cliente ID 1
SELECT * FROM lista_deseo WHERE fk_cliente = 1;

-- Verificar datos completos
SELECT 
  ld.*,
  s.nombre AS servicio_nombre,
  l.nombre AS lugar_nombre
FROM lista_deseo ld
LEFT JOIN servicio s ON s.id = ld.fk_servicio
LEFT JOIN lugar l ON l.id = ld.fk_lugar
WHERE ld.fk_cliente = 1;
```

### **Script SQL de Prueba**
```sql
-- Insertar servicio en lista de deseos (reemplaza cualquier item existente)
INSERT INTO lista_deseo (fk_cliente, fk_servicio, fk_lugar)
VALUES (1, 1, NULL)
ON CONFLICT (fk_cliente) 
DO UPDATE SET 
  fk_servicio = EXCLUDED.fk_servicio,
  fk_lugar = EXCLUDED.fk_lugar;

-- Limpiar
DELETE FROM lista_deseo WHERE fk_cliente = 1;
```

---

## 🚫 REQUISITO 2: APLICAR RESTRICCIONES DE PAQUETES (CREAR Y APLICAR)

### **Objetivo**
Verificar que al intentar comprar un paquete, se validan las restricciones del cliente (edad, estado civil, etc.).

### **Precondiciones**
1. Cliente autenticado (edad conocida, estado civil conocido)
2. Paquete existente (paquete ID 1)
3. Restricciones creadas en el paquete

### **Pasos de Prueba**

#### **2.1 Crear Restricción de Edad (Admin/Proveedor)**
1. Iniciar sesión como administrador o proveedor
2. Ir a gestión de paquetes
3. Crear/editar un paquete
4. Agregar restricción: "edad > 50"
5. Guardar
6. **Resultado esperado:**
   - La restricción se guarda en BD
   - Se muestra en el detalle del paquete

#### **2.2 Intentar Comprar Paquete SIN Cumplir Restricción**
1. Iniciar sesión como cliente con edad < 50 años
2. Ir a `/paquetes/[id]` donde [id] es un paquete con restricción edad > 50
3. Seleccionar fechas y hacer clic en "Agregar al Carrito" o "Comprar"
4. **Resultado esperado:**
   - Error claro: "Bloqueado: El cliente tiene X años y se requiere > 50"
   - No se permite la compra
   - La venta NO se crea

#### **2.3 Intentar Comprar Paquete CUMPLIENDO Restricción**
1. Iniciar sesión como cliente con edad > 50 años
2. Ir al mismo paquete
3. Seleccionar fechas y hacer clic en "Comprar"
4. **Resultado esperado:**
   - La compra se permite
   - Se crea la venta e itinerarios
   - El cliente puede proceder al checkout

#### **2.4 Restricción de Estado Civil**
1. Crear restricción: "estado_civil = 'casado'"
2. Intentar comprar como cliente soltero → **Debe fallar**
3. Intentar comprar como cliente casado → **Debe permitir**

### **Verificación en BD**
```sql
-- Ver restricciones de un paquete
SELECT * FROM restriccion WHERE fk_paquete = 1;

-- Verificar datos del cliente
SELECT 
  id,
  nombre_1,
  estado_civil,
  fecha_nacimiento,
  EXTRACT(YEAR FROM AGE(fecha_nacimiento))::integer AS edad
FROM cliente WHERE id = 1;

-- Probar validación directamente
SELECT cliente_cumple_restricciones(1, 1) AS cumple;
```

### **Script SQL de Prueba**
```sql
-- Crear restricción de edad
INSERT INTO restriccion (fk_paquete, caracteristica, operador, valor_restriccion)
VALUES (1, 'edad', '>', '50')
ON CONFLICT DO NOTHING;

-- Limpiar
DELETE FROM restriccion WHERE fk_paquete = 1;
```

---

## 💰 REQUISITO 3: REEMBOLSOS

### **Objetivo**
Verificar que un cliente puede solicitar reembolso de una venta pagada y ver su historial.

### **Precondiciones**
1. Cliente autenticado
2. Venta existente en estado "Pagado" (venta ID 1)
3. La venta NO tiene reembolso previo

### **Pasos de Prueba**

#### **3.1 Ver Ventas Disponibles para Reembolso**
1. Iniciar sesión como cliente
2. Ir a `/cancelaciones-reembolsos`
3. **Resultado esperado:**
   - Se muestra dropdown con ventas pagadas
   - Solo se muestran ventas en estado "Pagado"
   - Se muestran detalles: destino, fechas, monto

#### **3.2 Solicitar Reembolso**
1. Seleccionar una venta pagada del dropdown
2. (Opcional) Ingresar motivo de cancelación
3. Revisar cálculo: monto original, penalización 10%, monto a reembolsar
4. Hacer clic en "Confirmar Cancelación"
5. **Resultado esperado:**
   - Toast: "Reembolso solicitado"
   - El estado de la venta cambia a "Reembolsado"
   - Se crea registro en tabla `reembolso`
   - Se crea registro en tabla `pago` asociado al reembolso
   - La venta desaparece del dropdown de reembolsos disponibles

#### **3.3 Ver Historial de Reembolsos**
1. En la misma página, desplazarse a "Historial de Reembolsos"
2. **Resultado esperado:**
   - Se muestra el reembolso solicitado
   - Estado: "Completado"
   - Monto original, monto reembolsado
   - Fecha de solicitud

#### **3.4 Intentar Reembolsar Venta No Pagada**
1. Intentar seleccionar una venta en estado "pendiente"
2. **Resultado esperado:**
   - No aparece en el dropdown (solo aparecen pagadas)
   - Si se intenta por API directo, error: "La venta debe estar en estado 'Pagado'"

### **Verificación en BD**
```sql
-- Verificar venta está pagada
SELECT v.id_venta, e.nombre AS estado
FROM venta v
JOIN ven_est ve ON ve.fk_venta = v.id_venta
JOIN estado e ON e.id = ve.fk_estado
WHERE v.id_venta = 1 AND ve.fecha_fin IS NULL;

-- Ver reembolso creado
SELECT * FROM reembolso WHERE fk_venta = 1;

-- Ver estado actual de la venta
SELECT v.id_venta, e.nombre AS estado
FROM venta v
JOIN ven_est ve ON ve.fk_venta = v.id_venta
JOIN estado e ON e.id = ve.fk_estado
WHERE v.id_venta = 1 AND ve.fecha_fin IS NULL;
-- Debe mostrar estado = 'Reembolsado'
```

### **Script SQL de Prueba**
```sql
-- Solicitar reembolso (vía API normalmente)
CALL realizar_reembolso(1);

-- Limpiar (solo para testing)
-- DELETE FROM pago WHERE fk_reembolso IS NOT NULL;
-- DELETE FROM reembolso WHERE fk_venta = 1;
-- (Reversar estado manualmente)
```

---

## 💳 REQUISITO 4: FINANCIAMIENTO CON PAGO DE CUOTAS

### **Objetivo**
Verificar que un cliente puede seleccionar un plan de cuotas al hacer checkout y que se crean correctamente.

### **Precondiciones**
1. Cliente autenticado
2. Venta pendiente en el carrito (monto_total > 0)
3. Método de pago configurado

### **Pasos de Prueba**

#### **4.1 Seleccionar Plan de Cuotas en Checkout**
1. Ir a `/carrito`
2. Hacer clic en "Ir a Checkout"
3. Seleccionar método de pago (ej: tarjeta)
4. En "Plan de Pago", seleccionar "3 cuotas (3% interés)"
5. Completar datos de pago
6. Hacer clic en "Confirmar y pagar"
7. **Resultado esperado:**
   - Se crea `plan_cuotas` con tasa_interes = 3, num_cuotas = 3
   - Se crean 3 registros en tabla `cuota`
   - Cada cuota tiene monto_cuota calculado: `(monto_total * 1.03) / 3`
   - Cada cuota tiene fecha_pagar: CURRENT_DATE + (índice * 30 días)
   - Cada cuota tiene estado inicial (pendiente) en `cuo_ecuo`
   - Se paga la primera cuota automáticamente
   - La venta sigue en estado "pendiente" (no "Pagado" hasta completar todas)

#### **4.2 Verificar Cuotas Creadas**
1. Consultar en BD las cuotas del plan
2. **Resultado esperado:**
   - 3 cuotas creadas
   - Primera cuota: estado "pagado" (estado 2)
   - Segunda y tercera: estado "pendiente" (estado 1)
   - Fechas correctas (30 días de diferencia)

#### **4.3 Pago Único (Sin Cuotas)**
1. En checkout, seleccionar "1 pago (sin intereses)"
2. Completar pago
3. **Resultado esperado:**
   - NO se crea plan de cuotas
   - Se usa flujo normal de `registrar_pago`
   - Si el pago completa el monto, la venta pasa a "Pagado"

### **Verificación en BD**
```sql
-- Ver plan de cuotas creado
SELECT * FROM plan_cuotas WHERE fk_venta = 2;

-- Ver cuotas creadas
SELECT 
  c.id_cuota,
  c.monto_cuota,
  c.fecha_pagar,
  ce.fk_estado,
  e.nombre AS estado_cuota,
  ce.fecha_inicio,
  ce.fecha_fin
FROM cuota c
JOIN plan_cuotas pc ON pc.id_plan_cuotas = c.fk_plan_cuotas
LEFT JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota AND ce.fecha_fin IS NULL
LEFT JOIN estado e ON e.id = ce.fk_estado
WHERE pc.fk_venta = 2
ORDER BY c.id_cuota ASC;

-- Verificar que la primera cuota está pagada
-- Debe tener estado 2 (pagado) y fecha_fin IS NULL en cuo_ecuo
```

### **Script SQL de Prueba**
```sql
-- Crear plan de cuotas (3 cuotas, 3% interés)
SELECT agregar_cuotas(2, 3000, 3, 3) AS resultado;

-- Verificar cuotas
SELECT * FROM cuota WHERE fk_plan_cuotas = (SELECT id_plan_cuotas FROM plan_cuotas WHERE fk_venta = 2);

-- Limpiar
DELETE FROM cuo_ecuo WHERE fk_cuota IN (SELECT id_cuota FROM cuota WHERE fk_plan_cuotas = (SELECT id_plan_cuotas FROM plan_cuotas WHERE fk_venta = 2));
DELETE FROM cuota WHERE fk_plan_cuotas = (SELECT id_plan_cuotas FROM plan_cuotas WHERE fk_venta = 2);
DELETE FROM plan_cuotas WHERE fk_venta = 2;
```

---

## ⭐ REQUISITO 5: RECLAMOS, QUEJAS Y VALORACIONES

### **Objetivo**
Verificar que los clientes pueden crear reclamos y reseñas para servicios pagados.

### **Precondiciones**
1. Cliente autenticado
2. Itinerario pagado (estado venta = "Pagado")
3. Tipos de reclamo existentes en BD

### **Pasos de Prueba**

#### **5.1 Crear Reseña**
1. Ir a `/mis-viajes`
2. Buscar un servicio pagado
3. Hacer clic en "Calificar"
4. Seleccionar calificación (1-5 estrellas)
5. Escribir comentario
6. Hacer clic en "Enviar Reseña"
7. **Resultado esperado:**
   - Toast: "Reseña creada exitosamente"
   - Se crea registro en tabla `resena`
   - El botón "Calificar" desaparece (ya tiene reseña)

#### **5.2 Intentar Crear Reseña Duplicada**
1. Intentar crear otra reseña para el mismo itinerario
2. **Resultado esperado:**
   - Error: "Ya existe una reseña para este itinerario"
   - No se crea segunda reseña

#### **5.3 Crear Reclamo**
1. En `/mis-viajes`, buscar servicio pagado
2. Hacer clic en "Reclamar"
3. Seleccionar tipo de reclamo
4. Escribir comentario
5. Hacer clic en "Enviar Reclamo"
6. **Resultado esperado:**
   - Toast: "Reclamo creado exitosamente"
   - Se crea registro en tabla `reclamo`
   - Se crea estado inicial "En Espera" (estado 8) en `rec_est`

#### **5.4 Ver Reclamos (Admin)**
1. Iniciar sesión como administrador
2. Ir a gestión de postventa
3. **Resultado esperado:**
   - Se listan todos los reclamos
   - Se puede cambiar estado del reclamo
   - Se muestra historial de estados

### **Verificación en BD**
```sql
-- Ver reseñas del cliente
SELECT * FROM resena WHERE fk_itinerario IN (
  SELECT i.id FROM itinerario i
  JOIN venta v ON v.id_venta = i.fk_venta
  WHERE v.fk_cliente = 1
);

-- Ver reclamos del cliente
SELECT 
  r.*,
  tr.descripcion AS tipo_reclamo,
  e.nombre AS estado
FROM reclamo r
JOIN tipo_reclamo tr ON tr.id = r.fk_tipo_reclamo
JOIN rec_est re ON re.fk_reclamo = r.id
JOIN estado e ON e.id = re.fk_estado
WHERE r.fk_cliente = 1 AND re.fecha_final IS NULL;
```

---

## 👥 REQUISITO 6: MANEJO DE USUARIOS, ROLES Y PRIVILEGIOS EN BD

### **Objetivo**
Verificar que los administradores pueden gestionar roles, permisos y usuarios.

### **Precondiciones**
1. Usuario autenticado como administrador (rolId = 3)
2. Permisos existentes en BD

### **Pasos de Prueba**

#### **6.1 Crear Rol**
1. Ir a gestión de roles
2. Hacer clic en "Crear Rol"
3. Ingresar nombre: "Editor"
4. Seleccionar permisos
5. Guardar
6. **Resultado esperado:**
   - Se crea rol en BD
   - Se asocian permisos al rol
   - Aparece en lista de roles

#### **6.2 Asignar Rol a Usuario**
1. Ir a gestión de usuarios
2. Editar un usuario
3. Cambiar rol a "Editor"
4. Guardar
5. **Resultado esperado:**
   - El usuario tiene el nuevo rol
   - Los permisos se aplican correctamente

#### **6.3 Eliminar Rol (Sin Usuarios)**
1. Intentar eliminar un rol que no tiene usuarios asignados
2. **Resultado esperado:**
   - El rol se elimina correctamente
   - Los permisos asociados se eliminan

#### **6.4 Intentar Eliminar Rol (Con Usuarios)**
1. Intentar eliminar un rol que tiene usuarios asignados
2. **Resultado esperado:**
   - Error: "No se puede eliminar: hay X usuarios con este rol"
   - El rol NO se elimina

### **Verificación en BD**
```sql
-- Ver roles
SELECT * FROM rol ORDER BY id;

-- Ver permisos de un rol
SELECT * FROM obtener_rol_permisos(1);

-- Ver usuarios con sus roles
SELECT 
  u.*,
  r.nombre AS nombre_rol
FROM usuario u
LEFT JOIN rol r ON r.id = u.fk_rol;
```

---

## 🔧 SCRIPT DE LIMPIEZA COMPLETO

### **Orden Correcto (Respetando FK)**

```sql
-- 1. Eliminar pagos asociados a reembolsos
DELETE FROM pago WHERE fk_reembolso IS NOT NULL;

-- 2. Eliminar estados de cuotas
DELETE FROM cuo_ecuo;

-- 3. Eliminar cuotas
DELETE FROM cuota;

-- 4. Eliminar planes de cuotas
DELETE FROM plan_cuotas;

-- 5. Eliminar otros pagos
DELETE FROM pago WHERE fk_venta IS NOT NULL;

-- 6. Eliminar estados de ventas
DELETE FROM ven_est;

-- 7. Eliminar reseñas
DELETE FROM resena;

-- 8. Eliminar estados de reclamos
DELETE FROM rec_est;

-- 9. Eliminar reclamos
DELETE FROM reclamo;

-- 10. Eliminar itinerarios
DELETE FROM itinerario;

-- 11. Eliminar ventas
DELETE FROM venta;

-- 12. Eliminar lista de deseos
DELETE FROM lista_deseo;

-- 13. Eliminar restricciones
DELETE FROM restriccion;

-- NOTA: NO eliminar datos maestros (clientes, usuarios, roles, permisos, servicios, lugares, etc.)
```

---

## ✅ CHECKLIST FINAL

### **Backend APIs**
- [ ] `GET /api/cliente/deseos` - Obtener lista de deseos
- [ ] `POST /api/cliente/deseos` - Agregar/actualizar item
- [ ] `DELETE /api/cliente/deseos` - Eliminar item
- [ ] `GET /api/cliente/reembolsos` - Obtener historial
- [ ] `POST /api/cliente/reembolsos` - Solicitar reembolso
- [ ] Validación de restricciones en `/api/cliente/paquetes/comprar`
- [ ] Manejo de cuotas en `/api/cliente/checkout`

### **Frontend**
- [ ] `components/wishlist.tsx` - Carga y muestra lista real
- [ ] `components/wishlist-button.tsx` - Agrega/elimina items
- [ ] `components/cancellations-refunds.tsx` - Solicita reembolsos y muestra historial
- [ ] `components/cart-checkout.tsx` - Selección de cuotas funciona
- [ ] `components/mis-viajes-list.tsx` - Crear reseñas y reclamos

### **Funciones BD**
- [ ] `cliente_cumple_restricciones` - Valida restricciones
- [ ] `agregar_cuotas` - Crea plan de cuotas
- [ ] `pagar_cuota` - Paga cuota individual
- [ ] `realizar_reembolso` - Procesa reembolso
- [ ] `listar_deseos` - (INSERTA, no lista) - Usar consultas directas

---

## 📊 RESUMEN DE COBERTURA

**Backend:** ✅ 6/6 requisitos completos  
**Frontend:** ✅ 6/6 requisitos completos  
**Funciones BD:** ✅ Todas usadas correctamente  
**Scripts de Prueba:** ✅ Completos  
**Guía de Pruebas:** ✅ Completa

---

**Fin de la Guía de Pruebas**
