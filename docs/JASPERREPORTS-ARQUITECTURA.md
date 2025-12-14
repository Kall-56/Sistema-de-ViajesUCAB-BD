# Arquitectura de Reportes con Stored Procedures

## 📊 Concepto General

**JasperReports** es una biblioteca Java de código abierto para generar reportes profesionales. Sin embargo, como estamos en Next.js (Node.js), implementaremos una arquitectura híbrida:

1. **Stored Procedures (PostgreSQL)**: Toda la lógica de negocio y consultas complejas
2. **API Next.js**: Llama a los SPs y prepara los datos
3. **Frontend React**: Muestra los datos y permite exportar
4. **Generación de PDF/Excel**: Usando bibliotecas Node.js (jsPDF, ExcelJS) o integración futura con JasperReports Server

## 🏗️ Arquitectura Propuesta

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend      │ ──GET──> │  API Route       │ ──SP──>  │ PostgreSQL  │
│ (React/Next.js) │         │ /api/reportes/   │         │   Database  │
│                 │ <──JSON── │ [nombre]         │ <──Data── │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │ Stored Procedure │
                            │ (Lógica de BD)   │
                            └──────────────────┘
```

## 📋 Estructura de Stored Procedures

Cada reporte tendrá un stored procedure con el siguiente patrón:

```sql
CREATE FUNCTION nombre_reporte(
    fecha_inicio DATE DEFAULT NULL,
    fecha_fin DATE DEFAULT NULL,
    -- otros parámetros opcionales
) 
RETURNS TABLE (
    columna1 tipo1,
    columna2 tipo2,
    ...
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT ...
    FROM ...
    WHERE ...
    ORDER BY ...;
END;
$$;
```

## 🎯 Los 5 Reportes

Basándome en el patrón `top_destinos_vendidas`, los 5 reportes serán:

1. **top_destinos_vendidas** - Destinos más vendidos
2. **reporte_ventas_periodo** - Ventas por período
3. **reporte_clientes_activos** - Clientes más activos
4. **reporte_servicios_populares** - Servicios más populares
5. **reporte_ingresos_metodos_pago** - Ingresos por método de pago

## 🔌 Integración con la API

La API será genérica y flexible:

```typescript
GET /api/reportes/[nombre]?fechaInicio=2024-01-01&fechaFin=2024-12-31
```

Esto llamará al stored procedure correspondiente y retornará los datos en JSON.

## 📄 Exportación a PDF/Excel

Para la exportación, usaremos:
- **JSON → PDF**: jsPDF o react-pdf
- **JSON → Excel**: ExcelJS
- **Futuro**: Integración con JasperReports Server (Java) si se requiere

## ✅ Ventajas de esta Arquitectura

1. **Lógica en BD**: Toda la lógica compleja está en stored procedures
2. **Performance**: Las consultas se optimizan en PostgreSQL
3. **Mantenibilidad**: Cambios en reportes solo requieren modificar SPs
4. **Flexibilidad**: Fácil agregar nuevos reportes
5. **Escalabilidad**: Puede migrar a JasperReports Server después

