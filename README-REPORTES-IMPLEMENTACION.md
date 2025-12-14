# Sistema de Reportes - Implementación Completa

## 📊 Resumen de la Implementación

He implementado un sistema completo de reportes que utiliza **stored procedures** de PostgreSQL como fuente de datos, siguiendo el patrón que mencionaste (`top_destinos_vendidas`).

## 🏗️ Arquitectura Implementada

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend      │ ──GET──> │  API Route       │ ──SP──>  │ PostgreSQL  │
│ (React/Next.js) │         │ /api/reportes/   │         │   Database  │
│                 │ <──JSON── │ [nombre]         │ <──Data── │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
```

### Componentes Creados:

1. **API Genérica** (`app/api/reportes/[nombre]/route.ts`)
   - Endpoint dinámico que llama a cualquier stored procedure
   - Valida autenticación y permisos (solo admin)
   - Acepta parámetros: `fechaInicio`, `fechaFin`, `limit`
   - Retorna datos en formato JSON estructurado

2. **Componente UI Actualizado** (`components/reports-analytics.tsx`)
   - 5 reportes predefinidos conectados a la API
   - Botones funcionales para ejecutar y descargar
   - Vista previa de resultados en tabla
   - Exportación a JSON y CSV

3. **Documentación**:
   - `docs/JASPERREPORTS-ARQUITECTURA.md` - Explicación de la arquitectura
   - `docs/ESTRUCTURA-STORED-PROCEDURES-REPORTES.md` - Guía para crear SPs

## 🎯 Los 5 Reportes Definidos

1. **`top_destinos_vendidas`** - Destinos más vendidos
2. **`reporte_ventas_periodo`** - Ventas por período
3. **`reporte_clientes_activos`** - Clientes más activos
4. **`reporte_servicios_populares`** - Servicios más populares
5. **`reporte_ingresos_metodos_pago`** - Ingresos por método de pago

## 📝 Estructura Esperada de Stored Procedures

Cada SP debe seguir este patrón:

```sql
CREATE FUNCTION nombre_reporte(
    fecha_inicio DATE DEFAULT NULL,
    fecha_fin DATE DEFAULT NULL,
    limite INTEGER DEFAULT NULL
) 
RETURNS TABLE (
    -- Columnas específicas del reporte
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT ...
    FROM ...
    WHERE 
        (fecha_inicio IS NULL OR campo_fecha >= fecha_inicio)
        AND (fecha_fin IS NULL OR campo_fecha <= fecha_fin)
    ORDER BY ...
    LIMIT COALESCE(limite, 100);
END;
$$;
```

## 🚀 Cómo Usar

### 1. Crear los Stored Procedures

Crea los 5 stored procedures en PostgreSQL siguiendo el patrón documentado en `docs/ESTRUCTURA-STORED-PROCEDURES-REPORTES.md`.

### 2. Ejecutar un Reporte desde la UI

1. Ve al Dashboard de Admin → Pestaña "Reportes"
2. Selecciona un reporte del catálogo
3. Click en "Ejecutar"
4. Ingresa parámetros (fechas, límite) o deja vacío
5. Los resultados aparecerán en la vista previa
6. Click en "Descargar" para exportar JSON o CSV

### 3. Ejecutar desde la API Directamente

```bash
# Sin parámetros
GET /api/reportes/top_destinos_vendidas

# Con parámetros
GET /api/reportes/top_destinos_vendidas?fechaInicio=2024-01-01&fechaFin=2024-12-31&limit=10
```

## 📋 Formato de Respuesta de la API

```json
{
  "reporte": "top_destinos_vendidas",
  "fechaGeneracion": "2025-01-15T10:30:00.000Z",
  "parametros": {
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-12-31",
    "limit": 10
  },
  "totalRegistros": 10,
  "datos": [
    {
      "id_lugar": 1,
      "nombre_destino": "Miami",
      "cantidad_reservas": 45,
      "total_ingresos": 22500
    }
  ]
}
```

## ✅ Características Implementadas

- ✅ API genérica que funciona con cualquier SP
- ✅ Validación de autenticación y permisos (solo admin)
- ✅ Parámetros opcionales (fechas, límite)
- ✅ Manejo de errores robusto
- ✅ UI conectada con funcionalidad completa
- ✅ Vista previa de resultados en tabla
- ✅ Exportación a JSON y CSV
- ✅ Notificaciones toast para feedback
- ✅ Loading states durante generación

## 🔐 Seguridad

- Solo usuarios autenticados pueden acceder
- Solo administradores (rolId = 3) pueden ejecutar reportes
- Validación de nombres de SP (solo letras, números y guiones bajos)
- Sanitización de parámetros antes de ejecutar queries

## 📚 Próximos Pasos

1. **Crear los Stored Procedures**: Usa la documentación en `docs/ESTRUCTURA-STORED-PROCEDURES-REPORTES.md` como guía
2. **Probar cada reporte**: Ejecuta cada uno desde la UI para verificar que funciona
3. **Ajustar parámetros**: Si algún SP necesita parámetros adicionales, actualiza la API
4. **Exportación PDF/Excel** (opcional): Puedes agregar jsPDF o ExcelJS para generar archivos

## 🐛 Troubleshooting

### Error: "El reporte no existe"
- Verifica que el stored procedure esté creado en la BD
- Verifica que el nombre coincida exactamente (case-sensitive)

### Error: "Sin permisos"
- Asegúrate de estar logueado como administrador (rolId = 3)

### Error: "No autenticado"
- Inicia sesión primero
- Verifica que la cookie de sesión esté presente

### Datos vacíos
- Verifica que haya datos en las tablas relacionadas
- Revisa los filtros de fecha si los aplicaste

## 📖 Documentación Adicional

- `docs/JASPERREPORTS-ARQUITECTURA.md` - Arquitectura y conceptos
- `docs/ESTRUCTURA-STORED-PROCEDURES-REPORTES.md` - Guía detallada para crear SPs

