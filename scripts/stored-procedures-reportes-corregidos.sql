-- =====================================================
-- STORED PROCEDURES CORREGIDOS - SOLUCIÓN DEFINITIVA
-- =====================================================
-- Versiones corregidas con tipos de datos explícitos
-- para evitar errores de tipo TEXT vs VARCHAR
-- =====================================================

-- Eliminar TODAS las versiones antiguas
DROP FUNCTION IF EXISTS rep_ventas_periodo(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS rep_ingresos_metodos_pago(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS rep_clientes_activos(DATE, DATE, INTEGER) CASCADE;

-- =====================================================
-- 1. REP_VENTAS_PERIODO - CORREGIDO
-- =====================================================
CREATE OR REPLACE FUNCTION rep_ventas_periodo(
    fecha_inicio DATE DEFAULT NULL,
    fecha_fin DATE DEFAULT NULL
) 
RETURNS TABLE (
    id_venta INTEGER,
    fecha_venta DATE,
    cliente_nombre VARCHAR,
    cliente_ci INTEGER,
    monto_total INTEGER,
    cantidad_items BIGINT,
    estado VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id_venta,
        COALESCE(
            (SELECT MIN(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta)::DATE,
            CURRENT_DATE
        ) AS fecha_venta,
        CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, ''))::VARCHAR AS cliente_nombre,
        c.c_i AS cliente_ci,
        v.monto_total,
        (SELECT COUNT(*) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS cantidad_items,
        COALESCE(e.nombre, 'Sin estado')::VARCHAR AS estado
    FROM venta v
    JOIN cliente c ON c.id = v.fk_cliente
    LEFT JOIN ven_est ve ON ve.fk_venta = v.id_venta
    LEFT JOIN estado e ON e.id = ve.fk_estado
    WHERE 
        (fecha_inicio IS NULL OR EXISTS (
            SELECT 1 FROM itinerario i 
            WHERE i.fk_venta = v.id_venta 
            AND i.fecha_hora_inicio >= fecha_inicio
        ))
        AND (fecha_fin IS NULL OR EXISTS (
            SELECT 1 FROM itinerario i 
            WHERE i.fk_venta = v.id_venta 
            AND i.fecha_hora_fin <= fecha_fin
        ))
    ORDER BY v.id_venta DESC;
END;
$$;

-- =====================================================
-- 2. REP_CLIENTES_ACTIVOS - CORREGIDO
-- =====================================================
CREATE OR REPLACE FUNCTION rep_clientes_activos(
    fecha_inicio DATE DEFAULT NULL,
    fecha_fin DATE DEFAULT NULL,
    limite INTEGER DEFAULT 20
) 
RETURNS TABLE (
    id_cliente INTEGER,
    nombre_completo VARCHAR,
    ci INTEGER,
    total_reservas BIGINT,
    monto_total_gastado NUMERIC,
    ultima_reserva DATE,
    primera_reserva DATE
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS id_cliente,
        CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, ''))::VARCHAR AS nombre_completo,
        c.c_i AS ci,
        COUNT(DISTINCT v.id_venta) AS total_reservas,
        SUM(v.monto_total)::NUMERIC AS monto_total_gastado,
        MAX(i.fecha_hora_fin)::DATE AS ultima_reserva,
        MIN(i.fecha_hora_inicio)::DATE AS primera_reserva
    FROM cliente c
    JOIN venta v ON v.fk_cliente = c.id
    JOIN itinerario i ON i.fk_venta = v.id_venta
    WHERE 
        (fecha_inicio IS NULL OR i.fecha_hora_inicio >= fecha_inicio)
        AND (fecha_fin IS NULL OR i.fecha_hora_fin <= fecha_fin)
    GROUP BY c.id, c.nombre_1, c.nombre_2, c.apellido_1, c.apellido_2, c.c_i
    HAVING COUNT(DISTINCT v.id_venta) > 0
    ORDER BY total_reservas DESC, monto_total_gastado DESC
    LIMIT COALESCE(limite, 20);
END;
$$;

-- =====================================================
-- 3. REP_INGRESOS_METODOS_PAGO - CORREGIDO
-- =====================================================
CREATE OR REPLACE FUNCTION rep_ingresos_metodos_pago(
    fecha_inicio DATE DEFAULT NULL,
    fecha_fin DATE DEFAULT NULL
) 
RETURNS TABLE (
    tipo_metodo_pago VARCHAR,
    cantidad_pagos BIGINT,
    monto_total NUMERIC,
    monto_promedio NUMERIC,
    denominacion VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.tipo_metodo_pago::VARCHAR AS tipo_metodo_pago,
        COUNT(p.id_pago) AS cantidad_pagos,
        COALESCE(SUM(p.monto), 0)::NUMERIC AS monto_total,
        COALESCE(AVG(p.monto), 0)::NUMERIC AS monto_promedio,
        COALESCE(p.denominacion, 'N/A')::VARCHAR AS denominacion
    FROM metodo_pago mp
    JOIN pago p ON p.fk_metodo_pago = mp.id_metodo_pago
    WHERE 
        mp.tipo_metodo_pago != 'milla'
        AND (fecha_inicio IS NULL OR p.fecha_hora >= fecha_inicio::TIMESTAMP)
        AND (fecha_fin IS NULL OR p.fecha_hora <= fecha_fin::TIMESTAMP)
    GROUP BY mp.tipo_metodo_pago, p.denominacion
    ORDER BY monto_total DESC;
END;
$$;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    AND p.proname IN (
        'rep_ventas_periodo',
        'rep_clientes_activos',
        'rep_ingresos_metodos_pago'
    );
    
    IF func_count = 3 THEN
        RAISE NOTICE '✅ Todos los stored procedures corregidos se crearon correctamente (3/3)';
    ELSE
        RAISE WARNING '⚠️ Solo se crearon % de 3 stored procedures', func_count;
    END IF;
END $$;

