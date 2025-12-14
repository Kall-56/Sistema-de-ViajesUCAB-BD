-- =====================================================
-- STORED PROCEDURES PARA REPORTES - SISTEMA DE VIAJES UCAB
-- =====================================================
-- Este script crea los 5 stored procedures requeridos
-- para el sistema de reportes con JasperReports.
-- 
-- Ejecutar este script en PostgreSQL antes de usar
-- los reportes desde la aplicación.
-- =====================================================

-- =====================================================
-- 1. TOP DESTINOS VENDIDAS
-- =====================================================
-- Reporte de destinos más vendidos con estadísticas
-- de reservas e ingresos
-- =====================================================

-- =====================================================
-- 2. REPORTE VENTAS PERIODO
-- =====================================================
-- Análisis completo de ventas en un período determinado
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
    estado VARCHAR,
    fecha_inicio_minima DATE,
    fecha_fin_maxima DATE
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id_venta,
        (SELECT MIN(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta)::DATE AS fecha_venta,
        CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, '')) AS cliente_nombre,
        c.c_i AS cliente_ci,
        v.monto_total,
        (SELECT COUNT(*) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS cantidad_items,
        e.nombre AS estado,
        (SELECT MIN(i.fecha_hora_inicio) FROM itinerario i WHERE i.fk_venta = v.id_venta)::DATE AS fecha_inicio_minima,
        (SELECT MAX(i.fecha_hora_fin) FROM itinerario i WHERE i.fk_venta = v.id_venta)::DATE AS fecha_fin_maxima
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
-- 3. REPORTE CLIENTES ACTIVOS
-- =====================================================
-- Ranking de clientes más activos con mayor número
-- de reservas y gastos
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
        CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, '')) AS nombre_completo,
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
-- 4. REPORTE SERVICIOS POPULARES
-- =====================================================
-- Servicios más vendidos con estadísticas de demanda
-- =====================================================

CREATE OR REPLACE FUNCTION rep_servicios_populares(
    fecha_inicio DATE DEFAULT NULL,
    fecha_fin DATE DEFAULT NULL,
    limite INTEGER DEFAULT 20
) 
RETURNS TABLE (
    id_servicio INTEGER,
    nombre_servicio VARCHAR,
    tipo_servicio VARCHAR,
    nombre_proveedor VARCHAR,
    lugar_destino VARCHAR,
    veces_vendido BIGINT,
    ingresos_totales NUMERIC,
    precio_promedio NUMERIC,
    denominacion VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS id_servicio,
        s.nombre AS nombre_servicio,
        s.tipo_servicio,
        p.nombre_proveedor,
        l.nombre AS lugar_destino,
        COUNT(i.id) AS veces_vendido,
        SUM(COALESCE(i.costo_especial, s.costo_servicio))::NUMERIC AS ingresos_totales,
        AVG(COALESCE(i.costo_especial, s.costo_servicio))::NUMERIC AS precio_promedio,
        s.denominacion
    FROM servicio s
    JOIN itinerario i ON i.fk_servicio = s.id
    JOIN proveedor p ON p.id = s.fk_proveedor
    JOIN lugar l ON l.id = s.fk_lugar
    WHERE 
        (fecha_inicio IS NULL OR i.fecha_hora_inicio >= fecha_inicio)
        AND (fecha_fin IS NULL OR i.fecha_hora_fin <= fecha_fin)
    GROUP BY s.id, s.nombre, s.tipo_servicio, p.nombre_proveedor, l.nombre, s.denominacion
    ORDER BY veces_vendido DESC, ingresos_totales DESC
    LIMIT COALESCE(limite, 20);
END;
$$;

-- =====================================================
-- 5. REPORTE INGRESOS METODOS PAGO
-- =====================================================
-- Distribución de ingresos según método de pago utilizado
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
    denominacion VARCHAR,
    cantidad_clientes BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.tipo_metodo_pago::VARCHAR AS tipo_metodo_pago,
        COUNT(p.id_pago) AS cantidad_pagos,
        SUM(p.monto)::NUMERIC AS monto_total,
        AVG(p.monto)::NUMERIC AS monto_promedio,
        p.denominacion,
        COUNT(DISTINCT mp.fk_cliente) AS cantidad_clientes
    FROM metodo_pago mp
    JOIN pago p ON p.fk_metodo_pago = mp.id_metodo_pago
    WHERE 
        mp.tipo_metodo_pago != 'milla' -- Excluir método de millas del reporte
        AND (fecha_inicio IS NULL OR p.fecha_hora >= fecha_inicio::TIMESTAMP)
        AND (fecha_fin IS NULL OR p.fecha_hora <= fecha_fin::TIMESTAMP)
    GROUP BY mp.tipo_metodo_pago, p.denominacion
    ORDER BY monto_total DESC;
END;
$$;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verificar que todas las funciones se crearon correctamente

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
        'rep_servicios_populares',
        'rep_ingresos_metodos_pago'
    );
    
    IF func_count = 4 THEN
        RAISE NOTICE '✅ Todos los stored procedures se crearon correctamente (4/4)';
    ELSE
        RAISE WARNING '⚠️ Solo se crearon % de 4 stored procedures', func_count;
    END IF;
END $$;

-- =====================================================
-- PRUEBAS RÁPIDAS (OPCIONAL)
-- =====================================================
-- Descomentar para probar los reportes después de crearlos

-- SELECT * FROM rep_ventas_periodo(NULL, NULL);
-- SELECT * FROM rep_clientes_activos(NULL, NULL, 10);
-- SELECT * FROM rep_servicios_populares(NULL, NULL, 10);
-- SELECT * FROM rep_ingresos_metodos_pago(NULL, NULL);

