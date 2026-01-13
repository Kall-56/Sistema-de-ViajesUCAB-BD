# APIs - Funciones de BD

## Lista de Deseos
- `app/api/cliente/deseos/route.ts` → `listar_deseos(fk_cliente, fk_lugar, fk_servicio)`

## Restricciones
- `app/api/admin/restricciones/route.ts` → `CALL gestionar_restriccion_paquete(id_usuario, id_paquete, caracteristica, operador, valor)`

## Reembolsos
- `app/api/cliente/reembolsos/route.ts` → `CALL realizar_reembolso(id_venta, es_cancelacion_voluntaria)`

## Financiamiento con Pago de Cuotas
- `app/api/cliente/checkout/route.ts` → `agregar_cuotas(id_venta, tasa_interes, num_cuotas)`
- `app/api/cliente/cuotas/pagar/route.ts` → `pagar_cuota(id_cuota, monto, id_metodo_pago, denominacion)`

## Reclamos
- `app/api/cliente/reclamos/route.ts` → `agregar_reclamo(comentario, id_cliente, id_tipo_reclamo, id_itinerario)`
- `app/api/admin/reclamos/[id]/estado/route.ts` → `cambiar_estado_reclamo(id_reclamo, id_estado)`

## Valoraciones (Reseñas)
- `app/api/cliente/resenas/route.ts` → `agregar_resena(id_itinerario, calificacion_resena, comentario)`
