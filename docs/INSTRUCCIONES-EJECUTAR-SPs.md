# Instrucciones para Ejecutar los Stored Procedures de Reportes

## 📍 Ubicación del Archivo

El archivo SQL con todos los stored procedures está en:

```
scripts/stored-procedures-reportes.sql
```

## 🚀 Cómo Ejecutar

### Opción 1: Desde psql (Línea de comandos)

```bash
psql -U tu_usuario -d tu_base_de_datos -f scripts/stored-procedures-reportes.sql
```

### Opción 2: Desde pgAdmin

1. Abre pgAdmin
2. Conecta a tu base de datos
3. Click derecho en la base de datos → **Query Tool**
4. Abre el archivo `scripts/stored-procedures-reportes.sql`
5. Ejecuta el script (F5 o botón Execute)

### Opción 3: Desde DBeaver o similar

1. Abre DBeaver
2. Conecta a tu base de datos PostgreSQL
3. Abre el archivo `scripts/stored-procedures-reportes.sql`
4. Ejecuta el script

## ✅ Verificación

Al final del script, se ejecuta una verificación automática que muestra:

- ✅ Si se crearon los 4 stored procedures correctamente
- ⚠️ Si falta alguno

También puedes verificar manualmente:

```sql
SELECT 
    p.proname AS nombre_funcion,
    pg_get_function_arguments(p.oid) AS argumentos
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
```

## 🧪 Probar los Reportes

Después de crear los SPs, puedes probarlos directamente en PostgreSQL:

```sql
-- Ventas del último mes
SELECT * FROM rep_ventas_periodo(
    CURRENT_DATE - INTERVAL '1 month',
    CURRENT_DATE
);

-- Top 10 clientes más activos
SELECT * FROM rep_clientes_activos(NULL, NULL, 10);

-- Servicios más populares
SELECT * FROM rep_servicios_populares(NULL, NULL, 10);

-- Ingresos por método de pago
SELECT * FROM rep_ingresos_metodos_pago(NULL, NULL);
```

## 📋 Stored Procedures Creados

1. **`rep_ventas_periodo`**
   - Parámetros: `fecha_inicio`, `fecha_fin`
   - Retorna: Análisis completo de ventas

2. **`rep_clientes_activos`**
   - Parámetros: `fecha_inicio`, `fecha_fin`, `limite`
   - Retorna: Ranking de clientes más activos

3. **`rep_servicios_populares`**
   - Parámetros: `fecha_inicio`, `fecha_fin`, `limite`
   - Retorna: Servicios más vendidos

4. **`rep_ingresos_metodos_pago`**
   - Parámetros: `fecha_inicio`, `fecha_fin`
   - Retorna: Distribución de ingresos por método de pago

## ⚠️ Notas Importantes

- Los SPs usan `CREATE OR REPLACE`, así que puedes ejecutarlos múltiples veces
- Si hay errores, revisa que las tablas existan y tengan datos
- Los parámetros son opcionales (DEFAULT NULL), puedes llamarlos sin parámetros
- El script incluye verificación automática al final

## 🐛 Solución de Problemas

### Error: "El reporte no existe" o "function does not exist"
**Causa**: Los stored procedures no están creados en la base de datos.

**Solución**:
1. Ejecuta el script de verificación: `scripts/verificar-stored-procedures.sql`
2. Si no existen, ejecuta: `scripts/stored-procedures-reportes.sql`
3. Verifica que estés conectado a la base de datos correcta

### Error: "structure of query does not match function result type"
**Causa**: Los parámetros pasados no coinciden con la firma del stored procedure.

**Solución**: Este error ya está corregido en la API. Si persiste:
- Verifica que los SPs estén actualizados ejecutando el script nuevamente
- Los SPs usan `CREATE OR REPLACE`, así que puedes ejecutarlos múltiples veces

### Error: "relation does not exist"
- Verifica que las tablas `venta`, `itinerario`, `servicio`, etc. existan

### Error: "function already exists"
- Esto es normal, el script usa `CREATE OR REPLACE` para actualizar funciones existentes

### Error: "syntax error"
- Verifica que estés usando PostgreSQL 12 o superior
- Revisa que no haya caracteres especiales corruptos

### Datos vacíos al probar
- Verifica que haya datos en las tablas relacionadas
- Prueba sin filtros de fecha primero: `SELECT * FROM rep_ventas_periodo(NULL, NULL);`

## 🔍 Verificación Rápida

Para verificar rápidamente si los SPs están creados, ejecuta:

```sql
-- Script de verificación
\i scripts/verificar-stored-procedures.sql
```

O ejecuta directamente en pgAdmin/DBeaver el archivo:
```
scripts/verificar-stored-procedures.sql
```

