-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE STORED PROCEDURES
-- =====================================================
-- Este script verifica si los stored procedures de reportes
-- están creados correctamente en la base de datos.
-- =====================================================

-- Verificar existencia de los SPs
SELECT 
    p.proname AS nombre_funcion,
    pg_get_function_arguments(p.oid) AS argumentos,
    CASE 
        WHEN p.proname IN (
            'rep_ventas_periodo',
            'rep_clientes_activos',
            'rep_servicios_populares',
            'rep_ingresos_metodos_pago'
        ) THEN '✅ Existe'
        ELSE '❌ No encontrado'
    END AS estado
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname IN (
    'rep_ventas_periodo',
    'rep_clientes_activos',
    'rep_servicios_populares',
    'rep_ingresos_metodos_pago'
)
ORDER BY p.proname;

-- Contar cuántos SPs están creados
SELECT 
    COUNT(*) AS total_creados,
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ Todos los SPs están creados (4/4)'
        ELSE CONCAT('⚠️ Faltan ', (4 - COUNT(*)), ' stored procedures')
    END AS resultado
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.proname IN (
    'rep_ventas_periodo',
    'rep_clientes_activos',
    'rep_servicios_populares',
    'rep_ingresos_metodos_pago'
);

-- Si no hay SPs, mostrar mensaje
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
    
    IF func_count = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '❌ ERROR: No se encontraron stored procedures de reportes.';
        RAISE NOTICE '';
        RAISE NOTICE '📝 SOLUCIÓN: Ejecuta el script stored-procedures-reportes.sql';
        RAISE NOTICE '   Ubicación: scripts/stored-procedures-reportes.sql';
        RAISE NOTICE '';
    ELSIF func_count < 4 THEN
        RAISE NOTICE '';
        RAISE WARNING '⚠️ Solo se encontraron % de 4 stored procedures', func_count;
        RAISE NOTICE '   Ejecuta el script stored-procedures-reportes.sql para crear los faltantes';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '✅ Todos los stored procedures están creados correctamente (4/4)';
        RAISE NOTICE '';
    END IF;
END $$;

