-- ============================================================================
-- SCRIPTS SQL DE PRUEBA PARA TODOS LOS REQUISITOS
-- Sistema de Viajes UCAB - Base de Datos
-- ============================================================================

-- NOTA: Estos scripts asumen que ya existen datos básicos en la BD:
-- - Clientes (al menos cliente ID 1)
-- - Servicios (al menos servicio ID 1)
-- - Lugares (al menos lugar ID 1)
-- - Paquetes (al menos paquete ID 1)
-- - Estados (estados con nombres: 'pendiente', 'Pagado', 'Reembolsado')
-- - Tipos de reclamo
-- - Métodos de pago
-- - Cambio de moneda activo

-- ============================================================================
-- REQUISITO 1: LISTA DE DESEOS
-- ============================================================================

-- Precondiciones: Cliente ID 1 y Servicio ID 1 deben existir
-- (Esto se verifica con consultas, no se crean aquí)

-- Verificar que el cliente existe
SELECT id, nombre_1, apellido_1 FROM cliente WHERE id = 1;

-- Verificar que el servicio existe
SELECT id, nombre FROM servicio WHERE id = 1;

-- Verificar que el lugar existe (opcional)
SELECT id, nombre FROM lugar WHERE id = 1;

-- Agregar servicio a lista de deseos (esto se hace vía API normalmente)
-- Ejemplo directo en SQL:
INSERT INTO lista_deseo (fk_cliente, fk_servicio, fk_lugar)
VALUES (1, 1, NULL)
ON CONFLICT (fk_cliente) 
DO UPDATE SET 
  fk_servicio = EXCLUDED.fk_servicio,
  fk_lugar = EXCLUDED.fk_lugar;

-- Verificar lista de deseos
SELECT 
  ld.*,
  s.nombre AS servicio_nombre,
  l.nombre AS lugar_nombre
FROM lista_deseo ld
LEFT JOIN servicio s ON s.id = ld.fk_servicio
LEFT JOIN lugar l ON l.id = ld.fk_lugar
WHERE ld.fk_cliente = 1;

-- Agregar lugar a lista de deseos (reemplaza el servicio)
INSERT INTO lista_deseo (fk_cliente, fk_servicio, fk_lugar)
VALUES (1, NULL, 1)
ON CONFLICT (fk_cliente) 
DO UPDATE SET 
  fk_servicio = EXCLUDED.fk_servicio,
  fk_lugar = EXCLUDED.fk_lugar;

-- Verificar cambio
SELECT 
  ld.*,
  s.nombre AS servicio_nombre,
  l.nombre AS lugar_nombre
FROM lista_deseo ld
LEFT JOIN servicio s ON s.id = ld.fk_servicio
LEFT JOIN lugar l ON l.id = ld.fk_lugar
WHERE ld.fk_cliente = 1;

-- Limpiar (si se necesita para re-probar)
DELETE FROM lista_deseo WHERE fk_cliente = 1;

-- ============================================================================
-- REQUISITO 2: RESTRICCIONES DE PAQUETES
-- ============================================================================

-- Precondiciones: Paquete ID 1 debe existir
-- Verificar que el paquete existe
SELECT id, nombre FROM paquete WHERE id = 1;

-- Crear restricción de edad (requiere edad > 50)
-- NOTA: Usar estructura correcta según DDL proporcionado: caracteristica, operador, valor_restriccion
INSERT INTO restriccion (fk_paquete, caracteristica, operador, valor_restriccion)
VALUES (1, 'edad', '>', '50')
ON CONFLICT DO NOTHING;

-- Verificar restricción creada
SELECT * FROM restriccion WHERE fk_paquete = 1;

-- Crear restricción de estado civil (requiere estado_civil = 'casado')
INSERT INTO restriccion (fk_paquete, caracteristica, operador, valor_restriccion)
VALUES (1, 'estado_civil', '=', 'casado')
ON CONFLICT DO NOTHING;

-- Verificar todas las restricciones del paquete
SELECT * FROM restriccion WHERE fk_paquete = 1;

-- Probar validación (cliente ID 1, paquete ID 1)
-- Esto se hace vía API normalmente, pero podemos probar la función directamente:
SELECT cliente_cumple_restricciones(1, 1) AS cumple;

-- Si el cliente no cumple, la función lanzará EXCEPTION con mensaje descriptivo
-- Ejemplo de mensaje esperado si no cumple:
-- "Bloqueado: El cliente tiene X años y se requiere > 50"

-- Verificar datos del cliente para entender por qué puede fallar
SELECT 
  id,
  nombre_1,
  apellido_1,
  estado_civil,
  fecha_nacimiento,
  EXTRACT(YEAR FROM AGE(fecha_nacimiento))::integer AS edad
FROM cliente WHERE id = 1;

-- Limpiar (si se necesita)
DELETE FROM restriccion WHERE fk_paquete = 1;

-- ============================================================================
-- REQUISITO 3: REEMBOLSOS
-- ============================================================================

-- Precondiciones: Venta pagada debe existir (venta ID 1 en estado "Pagado")
-- Verificar que la venta existe y está pagada
SELECT 
  v.id_venta,
  v.monto_total,
  v.fk_cliente,
  e.nombre AS estado
FROM venta v
JOIN ven_est ve ON ve.fk_venta = v.id_venta
JOIN estado e ON e.id = ve.fk_estado
WHERE v.id_venta = 1 
  AND ve.fecha_fin IS NULL
  AND e.nombre = 'Pagado';

-- Verificar que no hay reembolso previo
SELECT * FROM reembolso WHERE fk_venta = 1;

-- Solicitar reembolso (vía stored procedure)
-- Esto se hace normalmente vía API, pero podemos probar directamente:
CALL realizar_reembolso(1);

-- Verificar reembolso creado
SELECT 
  r.*,
  v.monto_total AS monto_original
FROM reembolso r
JOIN venta v ON v.id_venta = r.fk_venta
WHERE r.fk_venta = 1;

-- Verificar que el estado de la venta cambió a "Reembolsado"
SELECT 
  v.id_venta,
  e.nombre AS estado,
  ve.fecha_inicio
FROM venta v
JOIN ven_est ve ON ve.fk_venta = v.id_venta
JOIN estado e ON e.id = ve.fk_estado
WHERE v.id_venta = 1 
  AND ve.fecha_fin IS NULL;

-- Verificar que se creó un pago asociado al reembolso
SELECT 
  p.*,
  r.monto_reembolso
FROM pago p
JOIN reembolso r ON r.id_reembolso = p.fk_reembolso AND r.fk_venta = p.fk_reembolso_venta_id
WHERE r.fk_venta = 1;

-- Limpiar (CUIDADO: Solo para testing, revierte el reembolso)
-- Esto requiere revertir el estado y eliminar registros en orden correcto:
-- 1. Eliminar pago asociado al reembolso
-- 2. Eliminar estado "Reembolsado"
-- 3. Restaurar estado "Pagado"
-- 4. Eliminar reembolso

-- NOTA: En producción, esto NO debería hacerse. Solo para testing.

-- ============================================================================
-- REQUISITO 4: FINANCIAMIENTO CON CUOTAS
-- ============================================================================

-- Precondiciones: Venta pendiente debe existir (venta ID 2 con estado "pendiente")
-- Verificar que la venta existe y está pendiente
SELECT 
  v.id_venta,
  v.monto_total,
  v.fk_cliente,
  e.nombre AS estado
FROM venta v
JOIN ven_est ve ON ve.fk_venta = v.id_venta
JOIN estado e ON e.id = ve.fk_estado
WHERE v.id_venta = 2 
  AND ve.fecha_fin IS NULL
  AND e.nombre = 'pendiente';

-- Crear plan de cuotas (3 cuotas con 3% interés)
-- Esto se hace normalmente vía API en checkout, pero podemos probar directamente:
SELECT agregar_cuotas(2, 3000, 3, 3) AS resultado;

-- Verificar plan de cuotas creado
SELECT * FROM plan_cuotas WHERE fk_venta = 2;

-- Verificar cuotas creadas
SELECT 
  c.*,
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

-- Obtener primera cuota para pagar (esto se hace en checkout)
SELECT 
  c.id_cuota,
  c.monto_cuota,
  c.fecha_pagar
FROM cuota c
JOIN plan_cuotas pc ON pc.id_plan_cuotas = c.fk_plan_cuotas
WHERE pc.fk_venta = 2
ORDER BY c.id_cuota ASC
LIMIT 1;

-- Pagar primera cuota (necesita id_metodo_pago, ejemplo: 1)
-- Esto se hace normalmente vía API en checkout
-- Ejemplo directo (asumiendo método_pago ID 1 existe):
-- SELECT pagar_cuota(
--   (SELECT c.id_cuota FROM cuota c JOIN plan_cuotas pc ON pc.id_plan_cuotas = c.fk_plan_cuotas WHERE pc.fk_venta = 2 ORDER BY c.id_cuota ASC LIMIT 1),
--   (SELECT c.monto_cuota FROM cuota c JOIN plan_cuotas pc ON pc.id_plan_cuotas = c.fk_plan_cuotas WHERE pc.fk_venta = 2 ORDER BY c.id_cuota ASC LIMIT 1),
--   1, -- id_metodo_pago
--   'VEN'
-- ) AS id_pago;

-- Verificar estado de cuotas después del pago
SELECT 
  c.id_cuota,
  c.monto_cuota,
  c.fecha_pagar,
  ce.fk_estado,
  e.nombre AS estado_cuota
FROM cuota c
JOIN plan_cuotas pc ON pc.id_plan_cuotas = c.fk_plan_cuotas
LEFT JOIN cuo_ecuo ce ON ce.fk_cuota = c.id_cuota AND ce.fecha_fin IS NULL
LEFT JOIN estado e ON e.id = ce.fk_estado
WHERE pc.fk_venta = 2
ORDER BY c.id_cuota ASC;

-- Limpiar (si se necesita)
-- Orden correcto: cuo_ecuo -> cuota -> plan_cuotas
DELETE FROM cuo_ecuo 
WHERE fk_cuota IN (
  SELECT id_cuota FROM cuota 
  WHERE fk_plan_cuotas = (SELECT id_plan_cuotas FROM plan_cuotas WHERE fk_venta = 2)
);

DELETE FROM cuota 
WHERE fk_plan_cuotas = (SELECT id_plan_cuotas FROM plan_cuotas WHERE fk_venta = 2);

DELETE FROM plan_cuotas WHERE fk_venta = 2;

-- ============================================================================
-- REQUISITO 5: RECLAMOS Y RESEÑAS
-- ============================================================================

-- Verificar tipos de reclamo disponibles
SELECT * FROM tipo_reclamo ORDER BY id;

-- Verificar que hay un itinerario pagado (cliente ID 1)
SELECT 
  i.id AS id_itinerario,
  s.nombre AS servicio_nombre,
  v.id_venta,
  e.nombre AS estado_venta
FROM itinerario i
JOIN servicio s ON s.id = i.fk_servicio
JOIN venta v ON v.id_venta = i.fk_venta
JOIN ven_est ve ON ve.fk_venta = v.id_venta
JOIN estado e ON e.id = ve.fk_estado
WHERE v.fk_cliente = 1
  AND ve.fecha_fin IS NULL
  AND e.nombre = 'Pagado'
LIMIT 1;

-- Crear reclamo (esto se hace vía API normalmente)
-- Ejemplo directo (asumiendo itinerario ID 1, tipo_reclamo ID 1):
-- SELECT agregar_reclamo('Test de reclamo', 1, 1, 1) AS resultado;

-- Verificar reclamo creado
SELECT 
  r.*,
  tr.descripcion AS tipo_reclamo,
  e.nombre AS estado,
  re.fecha_inicio
FROM reclamo r
JOIN tipo_reclamo tr ON tr.id = r.fk_tipo_reclamo
JOIN rec_est re ON re.fk_reclamo = r.id
JOIN estado e ON e.id = re.fk_estado
WHERE r.fk_cliente = 1
  AND re.fecha_final IS NULL
ORDER BY re.fecha_inicio DESC;

-- Crear reseña (esto se hace vía API normalmente)
-- Ejemplo directo (asumiendo itinerario ID 1 pagado):
-- SELECT agregar_resena(1, 5, 'Excelente servicio') AS resultado;

-- Verificar reseña creada
SELECT 
  r.*,
  i.fk_servicio,
  s.nombre AS servicio_nombre
FROM resena r
JOIN itinerario i ON i.id = r.fk_itinerario
JOIN servicio s ON s.id = i.fk_servicio
WHERE i.fk_venta IN (SELECT id_venta FROM venta WHERE fk_cliente = 1)
ORDER BY r.id DESC;

-- Limpiar (si se necesita)
-- DELETE FROM resena WHERE fk_itinerario = 1;
-- DELETE FROM rec_est WHERE fk_reclamo = (SELECT id FROM reclamo WHERE fk_cliente = 1 AND fk_itinerario = 1);
-- DELETE FROM reclamo WHERE fk_cliente = 1 AND fk_itinerario = 1;

-- ============================================================================
-- REQUISITO 6: ROLES Y PERMISOS
-- ============================================================================

-- Verificar roles existentes
SELECT * FROM rol ORDER BY id;

-- Verificar permisos existentes
SELECT * FROM permiso ORDER BY id;

-- Verificar usuarios existentes
SELECT 
  u.*,
  r.nombre AS nombre_rol
FROM usuario u
LEFT JOIN rol r ON r.id = u.fk_rol
ORDER BY u.id DESC;

-- Verificar permisos de un rol específico (ejemplo: rol ID 1)
SELECT * FROM obtener_rol_permisos(1);

-- Crear nuevo rol (esto se hace vía API normalmente)
-- Ejemplo directo:
-- SELECT insertar_rol(99, 'Rol Test', ARRAY[1, 2, 3]) AS resultado; -- IDs de permisos

-- Verificar rol creado
SELECT * FROM rol WHERE id = 99;
SELECT * FROM permiso_rol WHERE fk_rol = 99;

-- Eliminar rol de prueba (esto se hace vía API normalmente)
-- SELECT eliminar_rol_seguro(99) AS resultado;

-- ============================================================================
-- SCRIPT DE LIMPIEZA COMPLETO (ORDEN CORRECTO RESPETANDO FK)
-- ============================================================================

-- IMPORTANTE: Solo ejecutar en ambiente de testing/desarrollo
-- NO ejecutar en producción sin revisar cuidadosamente

-- Orden de eliminación (respetando constraints de FK):

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
-- ya que pueden ser usados por otros registros o por el sistema en general.

-- ============================================================================
-- FIN DE SCRIPTS DE PRUEBA
-- ============================================================================
