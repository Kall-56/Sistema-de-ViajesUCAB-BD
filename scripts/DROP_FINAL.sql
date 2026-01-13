drop table if exists permiso_rol cascade;

drop table if exists permiso cascade;

drop table if exists telefono cascade;

drop table if exists documento cascade;

drop table if exists tipo_documento cascade;

drop table if exists auditoria cascade;

drop table if exists usuario cascade;

drop table if exists rol cascade;

drop table if exists c_pre cascade;

drop table if exists preferencia cascade;

drop table if exists lista_deseo cascade;

drop table if exists sistema_milla cascade;

drop table if exists metodo_pago cascade;

drop type if exists tipo_metodo_pago_enum cascade;

drop table if exists banco cascade;

drop table if exists tipo_billetera_digital cascade;

drop table if exists pago cascade;

drop table if exists cambio_moneda cascade;

drop table if exists reembolso cascade;

drop table if exists ven_est cascade;

drop table if exists cuo_ecuo cascade;

drop table if exists cuota cascade;

drop table if exists plan_cuotas cascade;

drop table if exists terminal_operacion cascade;

drop table if exists cupo cascade;

drop table if exists transporte cascade;

drop table if exists imagen cascade;

drop table if exists descuento cascade;

drop table if exists r_a cascade;

drop table if exists ambiente cascade;

drop table if exists r_tc cascade;

drop table if exists tipo_comida cascade;

drop table if exists rec_est cascade;

drop table if exists estado cascade;

drop table if exists reclamo cascade;

drop table if exists tipo_reclamo cascade;

drop table if exists resena cascade;

drop table if exists itinerario cascade;

drop table if exists paquete_servicio cascade;

drop table if exists servicio cascade;

drop table if exists proveedor cascade;

drop type if exists tipo_proveedor_enum cascade;

drop table if exists lugar cascade;

drop table if exists viaje cascade;

drop table if exists alquiler_vehiculo cascade;

drop table if exists hotel cascade;

drop table if exists restaurante cascade;

drop table if exists pasajero cascade;

drop table if exists venta cascade;

drop table if exists cliente cascade;

drop type if exists estado_civil_enum cascade;

drop table if exists restriccion cascade;

drop table if exists paquete cascade;

drop function if exists alterar_paquete(integer, varchar, varchar, varchar, integer[]) cascade;

drop function if exists agregar_permisos_rol(integer, integer[]) cascade;

drop function if exists eliminar_permisos_rol(integer, integer[]) cascade;

drop function if exists obtener_rol_permisos(integer) cascade;

drop function if exists insertar_rol(integer, varchar, integer[]) cascade;

drop function if exists eliminar_rol(integer) cascade;

drop function if exists insertar_usuario(varchar, varchar, integer, integer, integer) cascade;

drop function if exists insertar_documento_cliente(integer, integer, integer, integer, date, date) cascade;

drop function if exists obtener_documento_cliente(integer) cascade;

drop function if exists eliminar_documento_cliente(integer, integer) cascade;

drop function if exists inicio_sesion(varchar, varchar) cascade;

drop function if exists listar_roles() cascade;

drop function if exists listar_permisos() cascade;

drop function if exists listar_usuarios() cascade;

drop function if exists listar_clientes_dropdown() cascade;

drop function if exists listar_proveedores_dropdown() cascade;

drop function if exists cambiar_estado_usuario(integer, integer) cascade;

drop function if exists eliminar_rol_seguro(integer) cascade;

drop function if exists actualizar_nombre_rol(integer, varchar) cascade;

drop function if exists insertar_servicio_viaje_aereolinea(varchar, varchar, integer, integer, varchar, integer,
                                                           integer, integer, varchar, integer, varchar, integer,
                                                           character varying[]) cascade;

drop function if exists obtener_servicio_viaje_aereolinea(integer) cascade;

drop function if exists alterar_servicio_viaje_aereolinea(integer, varchar, varchar, integer, integer, varchar, integer,
                                                          integer, varchar, integer, varchar, integer,
                                                          character varying[]) cascade;

drop function if exists eliminar_servicio_viaje_aereolinea(integer) cascade;

drop function if exists insertar_cliente(varchar, varchar, varchar, varchar, varchar, varchar, integer, bigint[],
                                         varchar, varchar, date) cascade;

drop function if exists obtener_paquete(integer) cascade;

drop function if exists insertar_descuento(integer, numeric, date) cascade;

drop function if exists obtener_descuentos_servicio(integer) cascade;

drop function if exists alterar_descuento(integer, numeric, date) cascade;

drop function if exists eliminar_descuento(integer) cascade;

drop function if exists obtener_tasa_cambio_actual() cascade;

drop function if exists actualizar_estado_venta(integer, varchar) cascade;

drop function if exists iniciar_venta(integer) cascade;

drop function if exists eliminar_item_itinerario(integer) cascade;

drop function if exists obtener_itinerario_venta(integer) cascade;

drop function if exists obtener_pagos_venta(integer) cascade;

drop function if exists insertar_proveedor(varchar, varchar, varchar, bigint[], date, integer, varchar) cascade;

drop function if exists insertar_metodo_pago_cripto(integer, varchar, varchar) cascade;

drop function if exists obtener_metodos_pago_cliente(integer) cascade;

drop function if exists alterar_metodo_pago_tarjeta(integer, integer, integer, date, varchar, varchar, integer) cascade;

drop function if exists alterar_metodo_pago_cheque(integer, integer, integer, integer) cascade;

drop function if exists alterar_metodo_pago_deposito(integer, integer, integer, integer) cascade;

drop function if exists alterar_metodo_pago_billetera(integer, integer, integer, integer) cascade;

drop function if exists alterar_metodo_pago_cripto(integer, varchar, varchar) cascade;

drop function if exists eliminar_metodo_pago(integer) cascade;

drop function if exists rep_obtener_valor_tasa_cambio(varchar) cascade;

drop function if exists rep_obtener_valor_descuento(integer) cascade;

drop function if exists rep_servicios_populares(date, integer) cascade;

drop function if exists recalcular_monto_venta(integer, integer, integer, varchar, numeric) cascade;

drop function if exists agregar_item_itinerario(integer, integer, date) cascade;

drop function if exists vender_paquete(integer, integer, timestamp without time zone[]) cascade;

drop function if exists agregar_pasajero(integer, varchar, varchar, integer, varchar, date, estado_civil_enum) cascade;

drop function if exists eliminar_pasajero(integer, varchar) cascade;

drop function if exists insertar_metodo_pago_tarjeta(integer, bigint, integer, date, varchar, varchar, integer) cascade;

drop function if exists insertar_metodo_pago_deposito(integer, bigint, bigint, integer) cascade;

drop function if exists insertar_metodo_pago_billetera(integer, bigint, integer, integer) cascade;

drop function if exists insertar_metodo_pago_cheque(integer, bigint, bigint, integer) cascade;

drop function if exists registrar_pago(integer, bigint, integer, varchar) cascade;

drop function if exists rep_top_destinos_vendidos() cascade;

drop function if exists rep_ventas_periodo(date, date) cascade;

drop function if exists rep_clientes_activos(date, date, integer) cascade;

drop function if exists rep_proveedores_mas_vendidos(date, date, integer) cascade;

drop function if exists agregar_resena(integer, numeric, varchar) cascade;

drop function if exists agregar_reclamo(varchar, integer, integer, integer) cascade;

drop function if exists cambiar_estado_reclamo(integer, integer) cascade;

drop function if exists listar_deseos(integer, integer, integer) cascade;

drop procedure if exists realizar_reembolso(integer) cascade;

drop procedure if exists gestionar_restriccion_paquete(integer, integer, varchar, varchar, varchar) cascade;

drop function if exists cliente_cumple_restricciones(integer, integer) cascade;

drop function if exists agregar_cuotas(integer, integer, integer) cascade;

drop function if exists pagar_cuota(integer, bigint, integer, varchar) cascade;

drop function if exists insertar_paquete(integer, varchar, varchar, varchar, integer[]) cascade;


