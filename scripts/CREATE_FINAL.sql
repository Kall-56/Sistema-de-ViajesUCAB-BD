create type tipo_metodo_pago_enum as enum ('tarjeta', 'cheque', 'deposito', 'billetera', 'cripto', 'milla');

create type estado_civil_enum as enum ('soltero', 'casado', 'divorciado', 'viudo');

create type tipo_proveedor_enum as enum ('aereo', 'maritimo', 'terrestre', 'otro');

create table if not exists cliente
(
    id               serial,
    nombre_1         varchar           not null,
    nombre_2         varchar,
    apellido_1       varchar           not null,
    apellido_2       varchar,
    c_i              integer           not null,
    direccion        varchar           not null,
    estado_civil     estado_civil_enum not null,
    fecha_nacimiento date              not null,
    primary key (id),
    constraint cliente_c_i_unique
        unique (c_i),
    constraint check_edad_mayor_18
        check (fecha_nacimiento <= (CURRENT_DATE - '18 years'::interval))
);

create table if not exists rol
(
    id     integer not null,
    nombre varchar not null,
    primary key (id)
);

create table if not exists permiso
(
    id          integer not null,
    descripcion varchar not null,
    primary key (id)
);

create table if not exists permiso_rol
(
    fk_permiso integer not null,
    fk_rol     integer not null,
    primary key (fk_permiso, fk_rol),
    foreign key (fk_rol) references rol,
    foreign key (fk_permiso) references permiso
);

create table if not exists lugar
(
    id       serial,
    nombre   varchar not null,
    tipo     varchar not null,
    fk_lugar integer,
    primary key (id),
    foreign key (fk_lugar) references lugar
);

create table if not exists proveedor
(
    id               serial,
    nombre_proveedor varchar             not null,
    fecha_fundacion  date                not null,
    fk_lugar         integer             not null,
    tipo_proveedor   tipo_proveedor_enum not null,
    constraint proveedor_pk
        primary key (id),
    constraint proveedor_lugar_id_fk
        foreign key (fk_lugar) references lugar
);

create table if not exists telefono
(
    id           serial,
    numero       bigint not null,
    fk_cliente   integer,
    fk_proveedor integer,
    constraint telefono_pk
        primary key (id),
    constraint telefono_numero_unique
        unique (numero),
    constraint telefono_cliente_id_fk
        foreign key (fk_cliente) references cliente,
    constraint telefono_proveedor_id_fk
        foreign key (fk_proveedor) references proveedor,
    constraint verificar_fks
        check ((fk_cliente IS NULL) OR (fk_proveedor IS NULL))
);

create table if not exists tipo_documento
(
    id          integer not null,
    nombre      varchar not null,
    descripcion varchar not null,
    constraint tipo_documento_pk
        primary key (id)
);

create table if not exists documento
(
    numero_documento  integer not null,
    fecha_emision     date    not null,
    fecha_expiracion  date    not null,
    fk_cliente        integer not null,
    fk_lugar          integer not null,
    fk_tipo_documento integer not null,
    constraint documento_pk
        primary key (numero_documento),
    constraint documento_cliente_id_fk
        foreign key (fk_cliente) references cliente,
    constraint documento_lugar_id_fk
        foreign key (fk_lugar) references lugar,
    constraint documento_tipo_documento_id_fk
        foreign key (fk_tipo_documento) references tipo_documento
);

create table if not exists estado
(
    id     serial,
    nombre varchar not null,
    constraint estado_pk
        primary key (id)
);

create table if not exists tipo_reclamo
(
    id          serial,
    descripcion varchar not null,
    constraint tipo_reclamo_pk
        primary key (id)
);

create table if not exists usuario
(
    id           serial,
    email        varchar           not null,
    contraseña   varchar           not null,
    fk_rol       integer           not null,
    fk_cliente   integer,
    fk_proveedor integer,
    activo       integer default 1 not null,
    constraint usuario_pk
        primary key (id),
    constraint usuario_unique
        unique (email),
    constraint usuario_rol_id_fk
        foreign key (fk_rol) references rol,
    constraint usuario_cliente_id_fk
        foreign key (fk_cliente) references cliente,
    constraint usuario_proveedor_id_fk
        foreign key (fk_proveedor) references proveedor,
    constraint check_cliente_proveedor
        check (((fk_cliente IS NOT NULL) AND (fk_proveedor IS NULL)) OR
               ((fk_cliente IS NULL) AND (fk_proveedor IS NOT NULL)) OR
               ((fk_cliente IS NULL) AND (fk_proveedor IS NULL))),
    constraint check_email
        check ((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)
);

create table if not exists auditoria
(
    id                serial,
    tabla_afectada    varchar   not null,
    fecha_tiempo      timestamp not null,
    descripcion       varchar   not null,
    id_tabla_afectada integer   not null,
    fk_usuario        integer   not null,
    constraint auditoria_pk
        primary key (id),
    constraint auditoria_usuario_id_fk
        foreign key (fk_usuario) references usuario
);

create table if not exists preferencia
(
    id          serial,
    nombre      varchar not null,
    descripcion varchar not null,
    constraint preferencia_pk
        primary key (id)
);

create table if not exists c_pre
(
    fk_cliente     integer not null,
    fk_preferencia integer not null,
    constraint c_pre_pk
        primary key (fk_cliente, fk_preferencia),
    constraint c_pre_cliente_id_fk
        foreign key (fk_cliente) references cliente,
    constraint c_pre_preferencia_id_fk
        foreign key (fk_preferencia) references preferencia
);

create table if not exists lista_deseo
(
    fk_cliente  integer not null,
    fk_lugar    integer,
    fk_servicio integer,
    constraint lista_deseo_pk
        primary key (fk_cliente),
    constraint lista_deseo_cliente_id_fk
        foreign key (fk_cliente) references cliente,
    constraint lista_deseo_lugar_id_fk
        foreign key (fk_lugar) references lugar,
    constraint check_lugar_servicio
        check (((fk_lugar IS NOT NULL) AND (fk_servicio IS NULL)) OR ((fk_lugar IS NULL) AND (fk_servicio IS NOT NULL)))
);

create table if not exists banco
(
    id_banco     integer not null,
    nombre_banco varchar(50),
    constraint banco_pk
        primary key (id_banco)
);

create table if not exists tipo_billetera_digital
(
    id_tbd          numeric(10) not null,
    descripcion_tbd varchar(100),
    constraint tipo_billetera_digital_pk
        primary key (id_tbd)
);

create table if not exists cambio_moneda
(
    id_cambiom      numeric(10)  not null,
    cantidad_cambio numeric(100) not null,
    fecha_inicio    timestamp    not null,
    fecha_fin       timestamp,
    denominacion    varchar(50)  not null,
    primary key (id_cambiom)
);

create table if not exists metodo_pago
(
    id_metodo_pago        serial,
    numero_tarjeta        bigint,
    codigo_seguridad      integer,
    fecha_vencimiento     date,
    titular               varchar,
    emisor                varchar,
    codigo_cuenta         bigint,
    numero_cheque         bigint,
    numero_referencia     bigint,
    numero_cuenta_destino bigint,
    numero_confirmacion   bigint,
    nombre_criptomoneda   varchar,
    direccion_billetera   varchar,
    tipo_metodo_pago      tipo_metodo_pago_enum not null,
    fk_banco              integer,
    fk_tbd                integer,
    fk_cliente            integer               not null,
    cantidad_millas       integer,
    primary key (id_metodo_pago, fk_cliente),
    constraint fk_tbdmp
        foreign key (fk_tbd) references tipo_billetera_digital,
    constraint metodo_pago_cliente_id_fk
        foreign key (fk_cliente) references cliente,
    constraint fk_bancomp
        foreign key (fk_banco) references banco
);

create table if not exists sistema_milla
(
    id_sistema_milla serial,
    cantidad_millas  integer not null,
    fecha            date    not null,
    tipo_transaccion varchar not null,
    fk_metodo_pago   integer not null,
    fk_cliente       integer not null,
    descripcion      varchar(255),
    prueba           varchar,
    prueba234        varchar,
    constraint sistema_milla_pk
        primary key (id_sistema_milla),
    constraint sistema_milla_metodo_pago_id_metodo_pago_fk_cliente_fk
        foreign key (fk_metodo_pago, fk_cliente) references metodo_pago
);

create table if not exists venta
(
    id_venta           serial,
    monto_total        bigint  not null,
    monto_compensacion bigint,
    fk_cliente         integer not null,
    primary key (id_venta),
    constraint venta_cliente_id_fk
        foreign key (fk_cliente) references cliente
);

create table if not exists plan_cuotas
(
    id_plan_cuotas serial,
    tasa_interes   integer not null,
    fk_venta       integer,
    primary key (id_plan_cuotas),
    constraint id_venta
        foreign key (fk_venta) references venta
);

create table if not exists cuota
(
    id_cuota       serial,
    monto_cuota    integer not null,
    fk_plan_cuotas integer,
    fecha_pagar    date    not null,
    primary key (id_cuota),
    constraint id_plan_cuotas
        foreign key (fk_plan_cuotas) references plan_cuotas
);

create table if not exists reembolso
(
    id_reembolso    serial,
    monto_reembolso integer not null,
    fk_venta        integer not null,
    primary key (id_reembolso, fk_venta),
    constraint id_venta
        foreign key (fk_venta) references venta
);

create table if not exists pago
(
    id_pago               serial,
    monto                 bigint    not null,
    fecha_hora            timestamp not null,
    denominacion          varchar   not null,
    fk_cambio_moneda      integer   not null,
    fk_metodo_pago        integer   not null,
    fk_reembolso          integer,
    fk_venta              integer,
    fk_reembolso_venta_id integer,
    primary key (id_pago),
    constraint id_cambio_moneda
        foreign key (fk_cambio_moneda) references cambio_moneda,
    constraint fk_pago_reembolso
        foreign key (fk_reembolso, fk_reembolso_venta_id) references reembolso,
    constraint id_venta
        foreign key (fk_venta) references venta,
    constraint chk_reembolso_venta
        check (((fk_venta IS NOT NULL) AND (fk_reembolso IS NULL) AND (fk_reembolso_venta_id IS NULL)) OR
               ((fk_venta IS NULL) AND (fk_reembolso IS NOT NULL) AND (fk_reembolso_venta_id IS NOT NULL)))
);

create table if not exists ven_est
(
    fk_estado    integer                             not null,
    fk_venta     integer                             not null,
    fecha_inicio timestamp default CURRENT_TIMESTAMP not null,
    fecha_fin    timestamp,
    primary key (fk_venta, fk_estado, fecha_inicio),
    constraint id_venta
        foreign key (fk_venta) references venta,
    constraint ven_est_estado_id_fk
        foreign key (fk_estado) references estado
);

create table if not exists cuo_ecuo
(
    fk_cuota     integer not null,
    fk_estado    integer not null,
    fecha_inicio date    not null,
    fecha_fin    date,
    primary key (fk_cuota, fk_estado),
    constraint id_cuota
        foreign key (fk_cuota) references cuota,
    constraint cuo_ecuo_estado_id_fk
        foreign key (fk_estado) references estado
);

create table if not exists ambiente
(
    id     serial,
    nombre varchar not null,
    primary key (id)
);

create table if not exists tipo_comida
(
    id          serial,
    descripcion varchar not null,
    primary key (id)
);

create table if not exists viaje
(
    id                 serial,
    costo_compensacion integer not null,
    constraint viaje_pk
        primary key (id)
);

create table if not exists terminal_operacion
(
    id       serial,
    nombre   varchar not null,
    fk_viaje integer not null,
    fk_lugar integer not null,
    primary key (id),
    foreign key (fk_lugar) references lugar,
    constraint terminal_operacion_viaje_id_fk
        foreign key (fk_viaje) references viaje
);

create table if not exists alquiler_vehiculo
(
    id                 integer not null,
    direccion_vehiculo varchar not null,
    constraint alquiler_vehiculo_pk
        primary key (id)
);

create table if not exists transporte
(
    id                            serial,
    tipo_transporte               varchar not null,
    tipo_avion                    varchar,
    nombre_barco                  varchar,
    placa_vehiculo                varchar,
    fk_servicio_alquiler_vehiculo integer,
    fk_viaje                      integer,
    constraint transporte_pk
        primary key (id),
    constraint transporte_alquiler_vehiculo_id_fk
        foreign key (fk_servicio_alquiler_vehiculo) references alquiler_vehiculo,
    constraint transporte_viaje_id_fk
        foreign key (fk_viaje) references viaje,
    constraint transporte_tipo_transporte_check
        check ((tipo_transporte)::text = ANY
               (ARRAY [('avion'::character varying)::text, ('barco'::character varying)::text, ('vehiculo_terrestre'::character varying)::text])),
    constraint transporte_avion_check
        check (((tipo_transporte)::text <> 'avion'::text) OR
               ((tipo_avion IS NOT NULL) AND (nombre_barco IS NULL) AND (placa_vehiculo IS NULL) AND
                (fk_servicio_alquiler_vehiculo IS NULL))),
    constraint transporte_barco_check
        check (((tipo_transporte)::text <> 'barco'::text) OR
               ((nombre_barco IS NOT NULL) AND (tipo_avion IS NULL) AND (placa_vehiculo IS NULL) AND
                (fk_servicio_alquiler_vehiculo IS NULL))),
    constraint transporte_vehiculo_terrestre_check
        check (((tipo_transporte)::text <> 'vehiculo_terrestre'::text) OR
               ((placa_vehiculo IS NOT NULL) AND (tipo_avion IS NULL) AND (nombre_barco IS NULL) AND
                (fk_servicio_alquiler_vehiculo IS NOT NULL)))
);

create table if not exists cupo
(
    id            serial,
    numero_cupo   integer not null,
    fk_transporte integer not null,
    primary key (id),
    constraint cupo_transporte_fk
        foreign key (fk_transporte) references transporte
);

create table if not exists hotel
(
    id         integer not null,
    direccion  varchar not null,
    tipo_hotel varchar not null,
    constraint hotel_pk
        primary key (id)
);

create table if not exists restaurante
(
    id        integer not null,
    direccion varchar not null,
    constraint restaurante_pk
        primary key (id)
);

create table if not exists servicio
(
    id               serial,
    nombre           varchar not null,
    descripcion      varchar not null,
    costo_servicio   integer not null,
    denominacion     varchar not null,
    millas_otorgadas integer not null,
    clasificacion    numeric(5, 1),
    fk_lugar         integer not null,
    fk_proveedor     integer not null,
    tipo_servicio    varchar not null,
    fk_viaje         integer,
    fk_alquiler      integer,
    fk_hotel         integer,
    fk_restaurante   integer,
    constraint servicio_pk
        primary key (id),
    constraint servicio_lugar_fk
        foreign key (fk_lugar) references lugar,
    constraint servicio_proveedor_fk
        foreign key (fk_proveedor) references proveedor,
    constraint servicio_alquiler_vehiculo_id_fk
        foreign key (fk_alquiler) references alquiler_vehiculo,
    constraint servicio_hotel_id_fk
        foreign key (fk_hotel) references hotel,
    constraint servicio_restaurante_id_fk
        foreign key (fk_restaurante) references restaurante,
    constraint servicio_viaje_id_fk
        foreign key (fk_viaje) references viaje
);

create table if not exists imagen
(
    id          serial,
    link        varchar not null,
    fk_servicio integer not null,
    primary key (id),
    constraint imagen_servicio_id_fk
        foreign key (fk_servicio) references servicio
);

create table if not exists descuento
(
    id                   serial,
    porcentaje_descuento numeric(5, 2) not null,
    fecha_vencimiento    date,
    fk_servicio          integer       not null,
    constraint descuento_pk
        primary key (id),
    constraint descuento_servicio_fk
        foreign key (fk_servicio) references servicio,
    constraint descuento_porcentaje_check
        check ((porcentaje_descuento >= (0)::numeric) AND (porcentaje_descuento <= (100)::numeric))
);

create table if not exists r_a
(
    fk_restaurante integer not null,
    fk_ambiente    integer not null,
    primary key (fk_ambiente, fk_restaurante),
    foreign key (fk_ambiente) references ambiente,
    constraint r_a_restaurante_id_fk
        foreign key (fk_restaurante) references restaurante
);

create table if not exists r_tc
(
    fk_restaurante integer not null,
    fk_tipo_comida integer not null,
    primary key (fk_tipo_comida, fk_restaurante),
    foreign key (fk_tipo_comida) references tipo_comida,
    constraint r_tc_restaurante_id_fk
        foreign key (fk_restaurante) references restaurante
);

create table if not exists paquete
(
    id           integer not null,
    nombre       varchar not null,
    descripcion  varchar not null,
    tipo_paquete varchar not null,
    constraint paquete_pk
        primary key (id)
);

create table if not exists itinerario
(
    fk_servicio       integer   not null,
    fk_venta          integer,
    costo_especial    numeric(10, 2),
    fecha_hora_inicio timestamp not null,
    id                serial,
    constraint itinerario_pk
        primary key (id),
    constraint paquete_fk_venta_fkey
        foreign key (fk_venta) references venta,
    constraint paquete_servicio_fk
        foreign key (fk_servicio) references servicio
);

create table if not exists reclamo
(
    id              serial,
    comentario      varchar not null,
    fk_cliente      integer not null,
    fk_tipo_reclamo integer not null,
    fk_itinerario   integer not null,
    constraint reclamo_pk
        primary key (id),
    constraint reclamo_cliente_id_fk
        foreign key (fk_cliente) references cliente,
    constraint reclamo_tipo_reclamo_id_fk
        foreign key (fk_tipo_reclamo) references tipo_reclamo,
    constraint reclamo_itinerario_id_fk
        foreign key (fk_itinerario) references itinerario
);

create table if not exists rec_est
(
    fecha_inicio date    not null,
    fecha_final  date,
    fk_estado    integer not null,
    fk_reclamo   integer not null,
    constraint rec_est_pk
        primary key (fk_reclamo, fk_estado),
    constraint rec_est_reclamo_id_fk
        foreign key (fk_reclamo) references reclamo,
    constraint rec_est_estado_id_fk
        foreign key (fk_estado) references estado
);

create table if not exists resena
(
    id                  serial,
    calificacion_resena numeric(5, 1) not null,
    comentario          varchar       not null,
    fk_itinerario       integer       not null,
    primary key (id),
    constraint resena_fks
        foreign key (fk_itinerario) references itinerario,
    constraint calificacion_resena_check
        check ((calificacion_resena >= (0)::numeric) AND (calificacion_resena <= (5)::numeric))
);

create table if not exists paquete_servicio
(
    fk_paquete  integer not null,
    fk_servicio integer not null,
    constraint paquete_servicio_pk
        primary key (fk_paquete, fk_servicio),
    constraint paquete_servicio_paquete_id_fk
        foreign key (fk_paquete) references paquete,
    constraint paquete_servicio_servicio_id_fk
        foreign key (fk_servicio) references servicio
);

create table if not exists pasajero
(
    id               serial,
    nombre           varchar           not null,
    apellido         varchar           not null,
    c_i              integer           not null,
    direccion        varchar           not null,
    fecha_nacimiento date              not null,
    estado_civil     estado_civil_enum not null,
    fk_venta         integer           not null,
    constraint pasajero_pk
        primary key (id),
    constraint pasajero_venta_id_venta_fk
        foreign key (fk_venta) references venta
);

create table if not exists restriccion
(
    id_restriccion    serial,
    fk_paquete        integer      not null,
    caracteristica    varchar(50)  not null,
    operador          varchar(10)  not null,
    valor_restriccion varchar(100) not null,
    constraint restriccion_pk
        primary key (id_restriccion),
    constraint restriccion_paquete_fk
        foreign key (fk_paquete) references paquete
);

create or replace function alterar_paquete(i_id_paquete integer, i_nombre character varying, i_descripcion character varying, i_tipo_paquete character varying, i_ids_servicios integer[]) returns integer
    language plpgsql
as
$$
BEGIN
    -- 1. Actualizar datos del paquete principal
    UPDATE paquete SET nombre = i_nombre, descripcion = i_descripcion, tipo_paquete = i_tipo_paquete
    WHERE id = i_id_paquete;

    -- 3. Actualizar la relación N-N (borrar y volver a crear)
    DELETE FROM paquete_servicio WHERE fk_paquete = i_id_paquete;
    IF i_ids_servicios IS NOT NULL THEN
        INSERT INTO paquete_servicio(fk_paquete, fk_servicio)
        SELECT i_id_paquete, unnest(i_ids_servicios);
    END IF;

    RETURN i_id_paquete;
END;
$$;

create or replace function agregar_permisos_rol(id_rol integer, ids_permisos integer[]) returns integer
    language plpgsql
as
$$
DECLARE id_permiso integer;
BEGIN
    FOREACH id_permiso in array ids_permisos
        Loop
            INSERT INTO permiso_rol(fk_rol,fk_permiso)
            VALUES (id_rol,id_permiso);
        end loop;
    RETURN 1;
end;
$$;

create or replace function eliminar_permisos_rol(id_rol integer, ids_permisos integer[]) returns integer
    language plpgsql
as
$$
DECLARE id_permiso integer;
BEGIN
    FOREACH id_permiso in array ids_permisos
        Loop
            DELETE from permiso_rol
            WHERE fk_rol = id_rol
              AND fk_permiso = id_permiso;
        end loop;
    RETURN 1;
end;
$$;

create or replace function obtener_rol_permisos(i_id_rol integer)
    returns TABLE(id_rol integer, nombre_rol character varying, ids_permisos integer[], nombres_permisos character varying[])
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
        SELECT
            r.id,
            r.nombre,
            array_agg(p.id),
            array_agg(p.descripcion)
        FROM rol r
                 JOIN permiso_rol pr ON r.id = pr.fk_rol
                 JOIN permiso p ON pr.fk_permiso = p.id
        WHERE r.id = i_id_rol
        GROUP BY r.id, r.nombre;
END;
$$;

create or replace function insertar_rol(i_id integer, i_nombre character varying, ids_permiso integer[]) returns integer
    language plpgsql
as
$$
DECLARE id_permiso integer;
BEGIN
    INSERT INTO rol(id,nombre)
    VALUES (i_id,i_nombre);

    FOREACH id_permiso in array ids_permiso
    LOOP
        INSERT INTO permiso_rol(fk_permiso,fk_rol)
        VALUES (id_permiso,i_id);
    end loop;
    RETURN 1;
END;
$$;

create or replace function eliminar_rol(id_rol integer) returns integer
    language plpgsql
as
$$
BEGIN
    DELETE from permiso_rol
    WHERE fk_rol = id_rol;
    DELETE from rol
    WHERE id = id_rol;
    RETURN 1;
end;
$$;

create or replace function insertar_usuario(i_email character varying, "i_contraseña" character varying, id_rol integer, id_cliente integer, id_proveedor integer) returns integer
    language plpgsql
as
$$
DECLARE
    new_usuario_id integer;
BEGIN
    IF i_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Error de Validación: El correo "%" no tiene un formato válido.', i_email
            USING HINT = 'Por favor revise que contenga @ y un dominio válido (ej: .com)';
    END IF;

    INSERT INTO usuario(email, contraseña, fk_rol, fk_cliente, fk_proveedor)
    VALUES (i_email, i_contraseña, id_rol, id_cliente, id_proveedor)
    RETURNING id INTO new_usuario_id;

    RETURN new_usuario_id;
END;
$$;

create or replace function insertar_documento_cliente(num_documento integer, id_tipo_documento integer, id_lugar integer, id_cliente integer, i_fecha_emision date, i_fecha_expiracion date) returns integer
    language plpgsql
as
$$
BEGIN
    IF EXISTS(SELECT 1 FROM documento WHERE numero_documento = num_documento) THEN
        RAISE EXCEPTION 'El numero de documento ya existe';
    end if;

    INSERT INTO documento
    VALUES (num_documento,i_fecha_emision,i_fecha_expiracion, id_cliente,id_lugar,id_tipo_documento);
    RETURN 1;
end;
$$;

create or replace function obtener_documento_cliente(id_cliente integer)
    returns TABLE(num_documento integer, fecha_emision date, fecha_expiracion date, nombre_lugar character varying, nombre_tipo_documento character varying)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
        SELECT d.numero_documento, d.fecha_emision, d.fecha_expiracion, l.nombre, td.nombre
        FROM documento d
        JOIN lugar l on l.id = d.fk_lugar
        JOIN tipo_documento td on td.id = d.fk_tipo_documento
        WHERE d.fk_cliente = id_cliente;
end;
$$;

create or replace function eliminar_documento_cliente(id_cliente integer, num_documento integer) returns integer
    language plpgsql
as
$$
BEGIN
    DELETE FROM documento
    WHERE numero_documento = num_documento
    AND fk_cliente = id_cliente;
    RETURN 1;
END;
$$;

create or replace function inicio_sesion(i_email character varying, "i_contraseña" character varying)
    returns TABLE(user_id integer, rol_id integer, cliente_id integer, proveedor_id integer, permisos integer[])
    language plpgsql
as
$$
DECLARE
  v_activo integer;
BEGIN
  SELECT u.id, u.fk_rol, u.fk_cliente, u.fk_proveedor, u.activo
  INTO user_id, rol_id, cliente_id, proveedor_id, v_activo
  FROM usuario u
  WHERE u.email = i_email AND u.contraseña = i_contraseña;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'El usuario no existe o la contraseña es incorrecta.';
  END IF;

  IF v_activo <> 1 THEN
    RAISE EXCEPTION 'Usuario suspendido.';
  END IF;

  RETURN QUERY
      SELECT
      user_id,
      rol_id,
      cliente_id,
      proveedor_id,
      array_agg(pr.fk_permiso) AS permisos
      FROM permiso_rol pr
      WHERE pr.fk_rol = rol_id
      group by user_id, rol_id, cliente_id, proveedor_id;
END;
$$;

create or replace function listar_roles()
    returns TABLE(id integer, nombre character varying)
    language sql
as
$$
SELECT r.id, r.nombre
FROM rol r
ORDER BY r.id;
$$;

create or replace function listar_permisos()
    returns TABLE(id integer, descripcion character varying)
    language sql
as
$$
SELECT p.id, p.descripcion
FROM permiso p
ORDER BY p.id;
$$;

create or replace function listar_usuarios()
    returns TABLE(id integer, email character varying, fk_rol integer, fk_cliente integer, fk_proveedor integer, activo integer)
    language sql
as
$$
SELECT u.id, u.email, u.fk_rol, u.fk_cliente, u.fk_proveedor, u.activo
FROM usuario u
ORDER BY u.id DESC;
$$;

create or replace function listar_clientes_dropdown()
    returns TABLE(id integer, nombre text)
    language sql
as
$$
SELECT c.id,
       CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ',
              COALESCE(c.apellido_2, ''))::text AS nombre
FROM cliente c
ORDER BY c.id DESC
LIMIT 200;
$$;

create or replace function listar_proveedores_dropdown()
    returns TABLE(id integer, nombre character varying)
    language sql
as
$$
SELECT p.id, p.nombre_proveedor AS nombre
FROM proveedor p
ORDER BY p.id DESC
LIMIT 200;
$$;

create or replace function cambiar_estado_usuario(i_usuario_id integer, i_activo integer) returns integer
    language plpgsql
as
$$
BEGIN
  IF i_activo NOT IN (0,1) THEN
    RAISE EXCEPTION 'activo debe ser 0 o 1';
  END IF;

  UPDATE usuario
  SET activo = i_activo
  WHERE id = i_usuario_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario % no existe', i_usuario_id;
  END IF;

  RETURN 1;
END;
$$;

create or replace function eliminar_rol_seguro(i_rol_id integer) returns integer
    language plpgsql
as
$$
DECLARE
    c integer;
BEGIN
    SELECT COUNT(*) INTO c FROM usuario WHERE fk_rol = i_rol_id;
    IF c > 0 THEN
        RAISE EXCEPTION 'No se puede eliminar: hay % usuarios con este rol', c;
    END IF;

    DELETE FROM permiso_rol WHERE fk_rol = i_rol_id;
    DELETE FROM rol WHERE id = i_rol_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Rol % no existe', i_rol_id;
    END IF;

    RETURN 1;
END;
$$;

create or replace function actualizar_nombre_rol(i_rol_id integer, i_nombre character varying) returns integer
    language plpgsql
as
$$
BEGIN
  UPDATE rol SET nombre = i_nombre WHERE id = i_rol_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rol % no existe', i_rol_id;
  END IF;
  RETURN 1;
END;
$$;

create or replace function insertar_servicio_viaje_aereolinea(i_nombre character varying, i_descripcion character varying, i_costo_servicio integer, i_costo_compensacion integer, i_denominacion character varying, i_millas_otorgadas integer, id_lugar integer, id_proveedor integer, i_tipo_avion character varying, i_cupo integer, nombre_terminal character varying, lugar_terminal integer, links_imagenes character varying[]) returns integer
    language plpgsql
as
$$
DECLARE id_viaje integer;
        id_servicio integer;
        id_transporte integer;
        link_imagen varchar;
BEGIN
    INSERT INTO viaje(costo_compensacion)
    values (i_costo_compensacion)
    RETURNING id into id_viaje;
    INSERT INTO servicio(nombre, descripcion, costo_servicio, denominacion, millas_otorgadas, fk_lugar, fk_proveedor,tipo_servicio,fk_viaje)
    VALUES (i_nombre, i_descripcion, i_costo_servicio, i_denominacion, i_millas_otorgadas, id_lugar, id_proveedor,'aereo',id_viaje)
    RETURNING id into id_servicio;

    FOREACH link_imagen in array links_imagenes
    LOOP
        INSERT INTO imagen(link, fk_servicio)
        VALUES (link_imagen, id_servicio);
    end loop;

    INSERT INTO transporte(fk_viaje, tipo_transporte, tipo_avion)
    VALUES (id_viaje, 'avion', i_tipo_avion)
    RETURNING id into id_transporte;

    INSERT INTO cupo(numero_cupo, fk_transporte)
    VALUES (i_cupo, id_transporte);

    INSERT INTO terminal_operacion(nombre, fk_viaje, fk_lugar)
    VALUES (nombre_terminal, id_viaje, lugar_terminal);

    RETURN id_servicio;
end;
$$;

create or replace function obtener_servicio_viaje_aereolinea(i_id_servicio integer)
    returns TABLE(nombre character varying, descripcion character varying, costo_servicio integer, costo_compensacion integer, denominacion character varying, millas_otorgadas integer, id_lugar integer, id_proveedor integer, tipo_avion character varying, cupo integer, nombre_terminal character varying, lugar_terminal integer, links_imagenes character varying[])
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
    SELECT
        s.nombre,
        s.descripcion,
        s.costo_servicio,
        v.costo_compensacion,
        s.denominacion,
        s.millas_otorgadas,
        s.fk_lugar,
        s.fk_proveedor,
        t.tipo_avion,
        c.numero_cupo,
        "to".nombre,
        "to".fk_lugar,
        (SELECT array_agg(i.link) FROM imagen i WHERE i.fk_servicio = s.id)
    FROM servicio s
    JOIN viaje v ON s.fk_viaje = v.id
    JOIN transporte t ON v.id = t.fk_viaje
    JOIN cupo c ON t.id = c.fk_transporte
    JOIN terminal_operacion "to" ON v.id = "to".fk_viaje
    WHERE s.id = i_id_servicio AND s.tipo_servicio = 'aereo';
END;
$$;

create or replace function alterar_servicio_viaje_aereolinea(i_id_servicio integer, i_nombre character varying, i_descripcion character varying, i_costo_servicio integer, i_costo_compensacion integer, i_denominacion character varying, i_millas_otorgadas integer, id_lugar integer, i_tipo_avion character varying, i_cupo integer, nombre_terminal character varying, lugar_terminal integer, links_imagenes character varying[]) returns integer
    language plpgsql
as
$$
DECLARE
    v_id_viaje integer;
    v_id_transporte integer;
    link_imagen varchar;
BEGIN
    SELECT fk_viaje INTO v_id_viaje FROM servicio WHERE id = i_id_servicio;

    IF v_id_viaje IS NULL THEN
        RAISE EXCEPTION 'Servicio with id % not found.', i_id_servicio;
    END IF;

    UPDATE servicio
    SET nombre = i_nombre,
        descripcion = i_descripcion,
        costo_servicio = i_costo_servicio,
        denominacion = i_denominacion,
        millas_otorgadas = i_millas_otorgadas,
        fk_lugar = id_lugar
    WHERE id = i_id_servicio;

    UPDATE viaje
    SET costo_compensacion = i_costo_compensacion
    WHERE id = v_id_viaje;

    UPDATE transporte
    SET tipo_avion = i_tipo_avion
    WHERE fk_viaje = v_id_viaje
    RETURNING id INTO v_id_transporte;

    UPDATE cupo
    SET numero_cupo = i_cupo
    WHERE fk_transporte = v_id_transporte;

    UPDATE terminal_operacion
    SET nombre = nombre_terminal,
        fk_lugar = lugar_terminal
    WHERE fk_viaje = v_id_viaje;

    DELETE FROM imagen WHERE fk_servicio = i_id_servicio;
    IF links_imagenes IS NOT NULL THEN
        FOREACH link_imagen IN ARRAY links_imagenes
        LOOP
            INSERT INTO imagen(link, fk_servicio)
            VALUES (link_imagen, i_id_servicio);
        END LOOP;
    END IF;

    RETURN i_id_servicio;
END;
$$;

create or replace function eliminar_servicio_viaje_aereolinea(i_id_servicio integer) returns integer
    language plpgsql
as
$$
DECLARE
    v_id_viaje integer;
BEGIN
    SELECT fk_viaje INTO v_id_viaje FROM servicio WHERE id = i_id_servicio;

    IF v_id_viaje IS NULL THEN
        RAISE EXCEPTION 'Servicio with id % not found.', i_id_servicio;
    END IF;


    DELETE FROM imagen WHERE fk_servicio = i_id_servicio;

    DELETE FROM cupo WHERE fk_transporte IN (SELECT id FROM transporte WHERE fk_viaje = v_id_viaje);

    DELETE FROM terminal_operacion WHERE fk_viaje = v_id_viaje;

    DELETE FROM transporte WHERE fk_viaje = v_id_viaje;

    DELETE FROM servicio WHERE id = i_id_servicio;

    DELETE FROM viaje WHERE id = v_id_viaje;

    RETURN i_id_servicio;
END;
$$;

create or replace function insertar_cliente(i_email character varying, "i_contraseña" character varying, i_nombre character varying, i_nombre2 character varying, i_apellido1 character varying, i_apellido2 character varying, i_ci integer, i_telefonos bigint[], i_direccion character varying, i_estado_civil character varying, i_fecha_nacimiento date) returns integer
    language plpgsql
as
$$
DECLARE
    new_cliente_id integer;
    new_usuario_id integer;
    telefono bigint;
    est_civ estado_civil_enum;
BEGIN
    IF EXTRACT(YEAR FROM AGE(i_fecha_nacimiento)) < 18 THEN
        RAISE EXCEPTION 'Error de Validación: El cliente debe ser mayor de 18 años.'
            USING HINT = 'Por favor revise que la fecha de nacimiento sea correcta.';
    END IF;

    IF i_estado_civil not in ('soltero', 'casado', 'divorciado', 'viudo') THEN
        RAISE EXCEPTION 'Error de Validación: El estado civil "%" no es válido.', i_estado_civil;
    ELSE
        est_civ = i_estado_civil;
    END IF;


    INSERT INTO cliente(nombre_1, nombre_2, apellido_1, apellido_2, c_i, direccion, estado_civil, fecha_nacimiento)
    VALUES (i_nombre, i_nombre2, i_apellido1, i_apellido2, i_ci, i_direccion, est_civ, i_fecha_nacimiento)
    RETURNING id INTO new_cliente_id;

    FOREACH telefono IN ARRAY i_telefonos
        LOOP
            INSERT INTO telefono(numero,fk_cliente)
            VALUES (telefono, new_cliente_id);
        END LOOP;

    INSERT INTO metodo_pago(cantidad_millas,tipo_metodo_pago,fk_cliente)
    VALUES (0,'milla', new_cliente_id);

    SELECT insertar_usuario(i_email, i_contraseña, 1, new_cliente_id, null) INTO new_usuario_id;


    RETURN new_usuario_id;
END;
$$;

create or replace function obtener_paquete(i_id_paquete integer)
    returns TABLE(id_paquete integer, nombre_paquete character varying, descripcion_paquete character varying, tipo_paquete character varying, restricciones character varying[], ids_servicios integer[])
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.tipo_paquete,
        (SELECT array_agg(r.descripcion) FROM restriccion r WHERE r.fk_paquete = p.id),
        (SELECT array_agg(ps.fk_servicio) FROM paquete_servicio ps WHERE ps.fk_paquete = p.id)
    FROM paquete p
    WHERE p.id = i_id_paquete;
END;
$$;

create or replace function insertar_descuento(i_fk_servicio integer, i_porcentaje numeric, i_fecha_vencimiento date) returns integer
    language plpgsql
as
$$
DECLARE
    new_descuento_id integer;
BEGIN
    INSERT INTO descuento(fk_servicio, porcentaje_descuento, fecha_vencimiento)
    VALUES (i_fk_servicio, i_porcentaje, i_fecha_vencimiento)
    RETURNING id INTO new_descuento_id;
    RETURN new_descuento_id;
END;
$$;

create or replace function obtener_descuentos_servicio(i_fk_servicio integer)
    returns TABLE(id_descuento integer, porcentaje_descuento numeric, fecha_vencimiento date)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
    SELECT id, d.porcentaje_descuento, d.fecha_vencimiento
    FROM descuento d
    WHERE d.fk_servicio = i_fk_servicio;
END;
$$;

create or replace function alterar_descuento(i_id_descuento integer, i_porcentaje numeric, i_fecha_vencimiento date) returns integer
    language plpgsql
as
$$
BEGIN
    UPDATE descuento
    SET
        porcentaje_descuento = i_porcentaje,
        fecha_vencimiento = i_fecha_vencimiento
    WHERE id = i_id_descuento;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Descuento con id % no encontrado.', i_id_descuento;
    END IF;

    RETURN i_id_descuento;
END;
$$;

create or replace function eliminar_descuento(i_id_descuento integer) returns integer
    language plpgsql
as
$$
BEGIN
    DELETE FROM descuento WHERE id = i_id_descuento;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Descuento con id % no encontrado.', i_id_descuento;
    END IF;

    RETURN i_id_descuento;
END;
$$;

create or replace function obtener_tasa_cambio_actual() returns numeric
    language plpgsql
as
$$
DECLARE
    tasa numeric;
BEGIN
    -- Se asume que la moneda base es Dólar y buscamos la tasa activa a Bolívares
    -- fecha_fin IS NULL indica que es la tasa vigente.
    SELECT cantidad_cambio INTO tasa
    FROM cambio_moneda
    WHERE fecha_fin IS NULL
    ORDER BY fecha_inicio DESC
    LIMIT 1;

    IF tasa IS NULL THEN
        RAISE EXCEPTION 'No hay una tasa de cambio activa configurada en el sistema.';
    END IF;

    RETURN tasa;
END;
$$;

create or replace function actualizar_estado_venta(i_id_venta integer, nombre_nuevo_estado character varying) returns void
    language plpgsql
as
$$
DECLARE
    id_estado_nuevo integer;
BEGIN
    -- Buscar el ID del estado por nombre
    SELECT id INTO id_estado_nuevo FROM estado WHERE nombre = nombre_nuevo_estado;

    IF id_estado_nuevo IS NULL THEN
        -- Si no existe, se podría crear o lanzar error. Aquí lanzamos error.
        RAISE EXCEPTION 'El estado "%" no existe en la base de datos.', nombre_nuevo_estado;
    END IF;

    -- Eliminar estado anterior (o mantener histórico según reglas de negocio, aquí reemplazamos para simplificar estado actual)
    UPDATE ven_est
    SET fecha_fin = CURRENT_TIMESTAMP
    WHERE fk_venta = i_id_venta;

    -- Insertar nuevo estado
    INSERT INTO ven_est(fk_venta, fk_estado,fecha_inicio)
    VALUES (i_id_venta, id_estado_nuevo,CURRENT_TIMESTAMP);
END;
$$;

create or replace function iniciar_venta(i_id_cliente integer) returns integer
    language plpgsql
as
$$
DECLARE
    new_venta_id integer;
BEGIN
    INSERT INTO venta(monto_total, monto_compensacion, fk_cliente)
    VALUES (0, 0, i_id_cliente) -- Se inicia en 0 hasta agregar items
    RETURNING id_venta INTO new_venta_id;

    PERFORM actualizar_estado_venta(new_venta_id, 'pendiente');

    RETURN new_venta_id;
END;
$$;

create or replace function eliminar_item_itinerario(i_id_itinerario integer) returns void
    language plpgsql
as
$$
DECLARE
    v_id_venta integer;
    estado_venta varchar;
    id_servicio integer;
    costo integer;
    compensacion integer;
    r_denominacion varchar;
BEGIN
    SELECT fk_venta, fk_servicio INTO v_id_venta, id_servicio FROM itinerario WHERE id = i_id_itinerario;

    SELECT e.nombre into estado_venta from estado e, ven_est ve
    WHERE ve.fk_venta = v_id_venta AND e.id = ve.fk_estado;

    IF v_id_venta IS NULL THEN
        RAISE EXCEPTION 'Item de itinerario % no encontrado', i_id_itinerario;
    END IF;

    IF estado_venta != 'pendiente' then
        RAISE EXCEPTION 'Este itinerario ya no se puede modificar';
    end if;

    DELETE FROM itinerario WHERE id = i_id_itinerario;

    Select s.costo_servicio, v.costo_compensacion, s.denominacion
    INTO costo, compensacion, r_denominacion
    FROM servicio s, viaje v
    WHERE s.id = id_servicio
      AND s.fk_viaje = v.id;

    -- Recalcular el monto total de la venta en Bs
    PERFORM recalcular_monto_venta(v_id_venta,
                                   costo,
                                   compensacion,
                                   r_denominacion,
                                   1);
END;
$$;

create or replace function obtener_itinerario_venta(i_id_venta integer)
    returns TABLE(id_itinerario integer, nombre_servicio character varying, costo_unitario_usd numeric, fecha_inicio date)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        s.nombre,
        COALESCE(i.costo_especial, s.costo_servicio)::numeric,
        i.fecha_hora_inicio
    FROM itinerario i
    JOIN servicio s ON i.fk_servicio = s.id
    WHERE i.fk_venta = i_id_venta;
END;
$$;

create or replace function obtener_pagos_venta(i_id_venta integer)
    returns TABLE(id_pago integer, monto integer, fecha timestamp without time zone, metodo_pago character varying)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
    SELECT
        p.id_pago,
        p.monto,
        p.fecha_hora,
        mp.tipo_metodo_pago::varchar
    FROM pago p
    JOIN metodo_pago mp ON p.fk_metodo_pago = mp.id_metodo_pago
    WHERE p.fk_venta = i_id_venta;
END;
$$;

create or replace function insertar_proveedor(i_email character varying, "i_contraseña" character varying, i_nombre_proveedor character varying, i_telefonos bigint[], i_fecha_fundacion date, i_lugar integer, i_tipo_proveedor character varying) returns integer
    language plpgsql
as
$$
DECLARE
    new_proveedor_id integer;
    new_usuario_id integer;
    telefono bigint;
    r_tipo_proveedor tipo_proveedor_enum;
BEGIN
    IF i_tipo_proveedor not in ('aereo', 'maritimo', 'terrestre','otro') THEN
        RAISE EXCEPTION 'Error de Validación: El tipo de proveedor "%" no es válido.', i_tipo_proveedor;
    ELSE
        r_tipo_proveedor = i_tipo_proveedor;
    end if;

    INSERT INTO proveedor(nombre_proveedor, fecha_fundacion, fk_lugar, tipo_proveedor)
    VALUES (i_nombre_proveedor, i_fecha_fundacion, i_lugar, r_tipo_proveedor)
    RETURNING id INTO new_proveedor_id;

    FOREACH telefono IN ARRAY i_telefonos
    LOOP
        INSERT INTO telefono(numero,fk_proveedor)
        VALUES (telefono, new_proveedor_id);
    END LOOP;

    SELECT insertar_usuario(i_email, "i_contraseña", 2, null, new_proveedor_id) INTO new_usuario_id;
    RETURN new_usuario_id;
END;
$$;

create or replace function insertar_metodo_pago_cripto(i_fk_cliente integer, i_nombre_criptomoneda character varying, i_direccion_billetera character varying) returns integer
    language plpgsql
as
$$
DECLARE
    new_metodo_pago_id integer;
BEGIN
    INSERT INTO metodo_pago(
        fk_cliente, tipo_metodo_pago, nombre_criptomoneda, direccion_billetera
    )
    VALUES (
        i_fk_cliente, 'cripto', i_nombre_criptomoneda, i_direccion_billetera
    )
    RETURNING id_metodo_pago INTO new_metodo_pago_id;

    RETURN new_metodo_pago_id;
END;
$$;

create or replace function obtener_metodos_pago_cliente(i_fk_cliente integer)
    returns TABLE(id_metodo_pago integer, tipo_metodo_pago tipo_metodo_pago_enum, numero_tarjeta integer, codigo_seguridad integer, fecha_vencimiento date, titular character varying, emisor character varying, codigo_cuenta integer, numero_cheque integer, numero_referencia integer, numero_cuenta_destino integer, numero_confirmacion integer, nombre_criptomoneda character varying, direccion_billetera character varying, fk_banco integer, nombre_banco character varying, fk_tbd integer, descripcion_tbd character varying)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
    SELECT
        mp.id_metodo_pago,
        mp.tipo_metodo_pago,
        mp.numero_tarjeta,
        mp.codigo_seguridad,
        mp.fecha_vencimiento,
        mp.titular,
        mp.emisor,
        mp.codigo_cuenta,
        mp.numero_cheque,
        mp.numero_referencia,
        mp.numero_cuenta_destino,
        mp.numero_confirmacion,
        mp.nombre_criptomoneda,
        mp.direccion_billetera,
        mp.fk_banco,
        b.nombre_banco,
        mp.fk_tbd,
        tbd.descripcion_tbd
    FROM metodo_pago mp
    LEFT JOIN banco b ON mp.fk_banco = b.id_banco
    LEFT JOIN tipo_billetera_digital tbd ON mp.fk_tbd = tbd.id_tbd
    WHERE mp.fk_cliente = i_fk_cliente AND mp.tipo_metodo_pago != 'milla';
END;
$$;

create or replace function alterar_metodo_pago_tarjeta(i_id_metodo_pago integer, i_numero_tarjeta integer, i_codigo_seguridad integer, i_fecha_vencimiento date, i_titular character varying, i_emisor character varying, i_fk_banco integer) returns integer
    language plpgsql
as
$$
BEGIN
    UPDATE metodo_pago
    SET
        numero_tarjeta = i_numero_tarjeta,
        codigo_seguridad = i_codigo_seguridad,
        fecha_vencimiento = i_fecha_vencimiento,
        titular = i_titular,
        emisor = i_emisor,
        fk_banco = i_fk_banco
    WHERE id_metodo_pago = i_id_metodo_pago AND tipo_metodo_pago = 'tarjeta';

    RETURN i_id_metodo_pago;
END;
$$;

create or replace function alterar_metodo_pago_cheque(i_id_metodo_pago integer, i_codigo_cuenta integer, i_numero_cheque integer, i_fk_banco integer) returns integer
    language plpgsql
as
$$
BEGIN
    UPDATE metodo_pago
    SET
        codigo_cuenta = i_codigo_cuenta,
        numero_cheque = i_numero_cheque,
        fk_banco = i_fk_banco
    WHERE id_metodo_pago = i_id_metodo_pago AND tipo_metodo_pago = 'cheque';

    RETURN i_id_metodo_pago;
END;
$$;

create or replace function alterar_metodo_pago_deposito(i_id_metodo_pago integer, i_numero_referencia integer, i_numero_cuenta_destino integer, i_fk_banco integer) returns integer
    language plpgsql
as
$$
BEGIN
    UPDATE metodo_pago
    SET
        numero_referencia = i_numero_referencia,
        numero_cuenta_destino = i_numero_cuenta_destino,
        fk_banco = i_fk_banco
    WHERE id_metodo_pago = i_id_metodo_pago AND tipo_metodo_pago = 'deposito';

    RETURN i_id_metodo_pago;
END;
$$;

create or replace function alterar_metodo_pago_billetera(i_id_metodo_pago integer, i_numero_confirmacion integer, i_fk_tbd integer, i_fk_banco integer) returns integer
    language plpgsql
as
$$
BEGIN
    UPDATE metodo_pago
    SET
        numero_confirmacion = i_numero_confirmacion,
        fk_tbd = i_fk_tbd,
        fk_banco = i_fk_banco
    WHERE id_metodo_pago = i_id_metodo_pago AND tipo_metodo_pago = 'billetera';

    RETURN i_id_metodo_pago;
END;
$$;

create or replace function alterar_metodo_pago_cripto(i_id_metodo_pago integer, i_nombre_criptomoneda character varying, i_direccion_billetera character varying) returns integer
    language plpgsql
as
$$
BEGIN
    UPDATE metodo_pago
    SET
        nombre_criptomoneda = i_nombre_criptomoneda,
        direccion_billetera = i_direccion_billetera
    WHERE id_metodo_pago = i_id_metodo_pago AND tipo_metodo_pago = 'cripto';

    RETURN i_id_metodo_pago;
END;
$$;

create or replace function eliminar_metodo_pago(i_id_metodo_pago integer) returns integer
    language plpgsql
as
$$
BEGIN
    -- Validar que no esté en uso en la tabla 'pago'
    IF EXISTS (SELECT 1 FROM pago WHERE fk_metodo_pago = i_id_metodo_pago) THEN
        RAISE EXCEPTION 'El método de pago está en uso y no puede ser eliminado.';
    END IF;

    DELETE FROM metodo_pago
    WHERE id_metodo_pago = i_id_metodo_pago;

    RETURN i_id_metodo_pago;
END;
$$;

create or replace function rep_obtener_valor_tasa_cambio(i_denominacion character varying) returns numeric
    language plpgsql
as
$$
BEGIN
    RETURN (SELECT cm.cantidad_cambio
            FROM cambio_moneda cm
            WHERE cm.denominacion = i_denominacion
            AND cm.fecha_fin is null);
END;
$$;

create or replace function rep_obtener_valor_descuento(id_servicio integer) returns numeric
    language plpgsql
as
$$
BEGIN
    RETURN COALESCE((SELECT d.porcentaje_descuento
            FROM descuento d
            WHERE id_servicio = d.fk_servicio
            AND  d.fecha_vencimiento > CURRENT_DATE), 0);
END;
$$;

create or replace function rep_servicios_populares(fecha_inicio date DEFAULT NULL::date, limite integer DEFAULT 20)
    returns TABLE(id_servicio integer, nombre_servicio character varying, tipo_servicio character varying, nombre_proveedor character varying, lugar_destino character varying, veces_vendido bigint, ingresos_totales numeric, precio_promedio numeric, denominacion character varying)
    language plpgsql
as
$$
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
    GROUP BY s.id, s.nombre, s.tipo_servicio, p.nombre_proveedor, l.nombre, s.denominacion
    ORDER BY veces_vendido DESC, ingresos_totales DESC
    LIMIT COALESCE(limite, 20);
END;
$$;

create or replace function recalcular_monto_venta(i_id_venta integer, i_monto integer, i_monto_c integer, i_denominacion character varying, suma_resta numeric) returns void
    language plpgsql
as
$$
DECLARE
    tasa_cambio numeric;
    total_venta integer;
    total_compensacion integer;
BEGIN
    tasa_cambio := coalesce(rep_obtener_valor_tasa_cambio(i_denominacion),1);

    SELECT v.monto_total, v.monto_compensacion
    INTO total_venta, total_compensacion
    FROM venta v
    WHERE v.id_venta = i_id_venta;

    IF suma_resta = 1 THEN
        UPDATE venta
        SET monto_total = total_venta + (i_monto * tasa_cambio),
            monto_compensacion = total_compensacion + (i_monto_c * tasa_cambio)
        WHERE id_venta = i_id_venta;
    ELSE
        UPDATE venta
        SET monto_total = total_venta - (i_monto * tasa_cambio),
            monto_compensacion = total_compensacion - (i_monto_c * tasa_cambio)
        WHERE id_venta = i_id_venta;
    END IF;
END;
$$;

create or replace function agregar_item_itinerario(i_id_venta integer, i_id_servicio integer, i_fecha_inicio date) returns integer
    language plpgsql
as
$$
DECLARE
    estado_venta varchar;
    new_itinerario_id integer;
    costo integer;
    compensacion integer;
    r_denominacion varchar;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM venta WHERE id_venta = i_id_venta) THEN
        RAISE EXCEPTION 'Venta % no encontrada', i_id_venta;
    END IF;

    SELECT e.nombre into estado_venta from estado e, ven_est ve
    WHERE ve.fk_venta = i_id_venta AND e.id = ve.fk_estado;

    IF estado_venta != 'pendiente' then
        RAISE EXCEPTION 'Este itinerario ya no se puede modificar';
    end if;

    INSERT INTO itinerario(fk_servicio, fk_venta, costo_especial, fecha_hora_inicio)
    VALUES (i_id_servicio, i_id_venta, null, i_fecha_inicio)
    RETURNING id INTO new_itinerario_id;

    Select s.costo_servicio, v.costo_compensacion, s.denominacion
    INTO costo, compensacion, r_denominacion
    FROM servicio s, viaje v
    WHERE s.id = i_id_servicio
    AND s.fk_viaje = v.id;

    -- Recalcular el monto total de la venta en Bs
    PERFORM recalcular_monto_venta(i_id_venta,
                                   costo,
                                   compensacion,
                                   r_denominacion,
                                   1);

    RETURN new_itinerario_id;
END;
$$;

create or replace function vender_paquete(i_id_cliente integer, i_id_paquete integer, i_fecha_inicio timestamp without time zone[]) returns integer[]
    language plpgsql
as
$$
DECLARE
    id_venta integer;
    nuevos_itinerarios_ids integer[];
    nuevo_id integer;
    v_idx integer := 1;
    r_servicio record;
BEGIN
    IF array_length(i_fecha_inicio, 1) != (SELECT count(*) FROM paquete_servicio WHERE fk_paquete = i_id_paquete) THEN
        RAISE EXCEPTION 'La cantidad de fechas no coincide con los servicios del paquete';
    END IF;

    SELECT iniciar_venta(i_id_cliente) INTO id_venta;

    FOR r_servicio IN (SELECT s.id AS fk_servicio, s.costo_servicio, s.denominacion, COALESCE(v.costo_compensacion, 0) as costo_compensacion
                       FROM paquete_servicio ps
                                JOIN servicio s ON ps.fk_servicio = s.id
                                LEFT JOIN viaje v ON s.fk_viaje = v.id
                       WHERE ps.fk_paquete = i_id_paquete
                       ORDER BY ps.fk_servicio)
        LOOP
            INSERT INTO itinerario(fk_servicio, fk_venta, costo_especial, fecha_hora_inicio)
            VALUES (r_servicio.fk_servicio, id_venta, null, i_fecha_inicio[v_idx])
            RETURNING id INTO nuevo_id;
            nuevos_itinerarios_ids := array_append(nuevos_itinerarios_ids, nuevo_id);
            PERFORM recalcular_monto_venta(id_venta, r_servicio.costo_servicio, r_servicio.costo_compensacion, r_servicio.denominacion, 1);
            v_idx := v_idx + 1;
        END LOOP;

    RETURN nuevos_itinerarios_ids;
END;
$$;

create or replace function agregar_pasajero(i_id_venta integer, i_nombre character varying, i_apellido character varying, i_c_i integer, i_direccion character varying, i_fecha_nacimiento date, i_estado_civil estado_civil_enum) returns integer
    language plpgsql
as
$$
DECLARE
    estado_venta varchar;
    cantidad_original integer;
BEGIN
    SELECT e.nombre into estado_venta
    from ven_est ve, estado e
    WHERE ve.fk_venta = i_id_venta
    AND e.id = ve.fk_estado;

    IF estado_venta = 'Pagado' THEN
        RAISE EXCEPTION 'No se pueden insertar pasajeros a una venta pagada';
    end if;

    SELECT count(*) into cantidad_original
    FROM pasajero
    WHERE fk_venta = i_id_venta;

    cantidad_original := cantidad_original+1;

    INSERT INTO pasajero(nombre, apellido, c_i, direccion, fecha_nacimiento, estado_civil, fk_venta)
    values (i_nombre, i_apellido, i_c_i, i_direccion, i_fecha_nacimiento, i_estado_civil,i_id_venta);

    UPDATE venta
    SET monto_total = monto_total/cantidad_original * (1 + (SELECT count(*) FROM pasajero WHERE fk_venta = id_venta)),
        monto_compensacion = monto_compensacion/cantidad_original * (1 + (SELECT count(*) FROM pasajero WHERE fk_venta = id_venta))
    WHERE id_venta = i_id_venta;

    RETURN 1;
END;
$$;

create or replace function eliminar_pasajero(i_id_venta integer, i_id_pasajero character varying) returns integer
    language plpgsql
as
$$
DECLARE
    estado_venta varchar;
    cantidad_original integer;
BEGIN
    SELECT e.nombre into estado_venta
    from ven_est ve, estado e
    WHERE ve.fk_venta = i_id_venta
      AND e.id = ve.fk_estado;

    IF estado_venta = 'Pagado' THEN
        RAISE EXCEPTION 'No se pueden eliminar pasajeros a una venta pagada';
    end if;

    SELECT count(*) into cantidad_original
    FROM pasajero
    WHERE fk_venta = i_id_venta;

    cantidad_original := cantidad_original+1;

    DELETE FROM pasajero
    WHERE id = i_id_pasajero;

    UPDATE venta
    SET monto_total = monto_total/cantidad_original * (1 + (SELECT count(*) FROM pasajero WHERE fk_venta = id_venta)),
        monto_compensacion = monto_compensacion/cantidad_original * (1 + (SELECT count(*) FROM pasajero WHERE fk_venta = id_venta))
    WHERE id_venta = i_id_venta;

    RETURN 1;
END;
$$;

create or replace function insertar_metodo_pago_tarjeta(i_fk_cliente integer, i_numero_tarjeta bigint, i_codigo_seguridad integer, i_fecha_vencimiento date, i_titular character varying, i_emisor character varying, i_fk_banco integer) returns integer
    language plpgsql
as
$$
DECLARE
    new_metodo_pago_id integer;
BEGIN
    INSERT INTO metodo_pago(
        fk_cliente, tipo_metodo_pago, numero_tarjeta, codigo_seguridad,
        fecha_vencimiento, titular, emisor, fk_banco
    )
    VALUES (
        i_fk_cliente, 'tarjeta', i_numero_tarjeta, i_codigo_seguridad,
        i_fecha_vencimiento, i_titular, i_emisor, i_fk_banco
    )
    RETURNING id_metodo_pago INTO new_metodo_pago_id;

    RETURN new_metodo_pago_id;
END;
$$;

create or replace function insertar_metodo_pago_deposito(i_fk_cliente integer, i_numero_referencia bigint, i_numero_cuenta_destino bigint, i_fk_banco integer) returns integer
    language plpgsql
as
$$
DECLARE
    new_metodo_pago_id integer;
BEGIN
    INSERT INTO metodo_pago(
        fk_cliente, tipo_metodo_pago, numero_referencia, numero_cuenta_destino, fk_banco
    )
    VALUES (
        i_fk_cliente, 'deposito', i_numero_referencia, i_numero_cuenta_destino, i_fk_banco
    )
    RETURNING id_metodo_pago INTO new_metodo_pago_id;

    RETURN new_metodo_pago_id;
END;
$$;

create or replace function insertar_metodo_pago_billetera(i_fk_cliente integer, i_numero_confirmacion bigint, i_fk_tbd integer, i_fk_banco integer) returns integer
    language plpgsql
as
$$
DECLARE
    new_metodo_pago_id integer;
BEGIN
    INSERT INTO metodo_pago(
        fk_cliente, tipo_metodo_pago, numero_confirmacion, fk_tbd, fk_banco
    )
    VALUES (
        i_fk_cliente, 'billetera', i_numero_confirmacion, i_fk_tbd, i_fk_banco
    )
    RETURNING id_metodo_pago INTO new_metodo_pago_id;

    RETURN new_metodo_pago_id;
END;
$$;

create or replace function insertar_metodo_pago_cheque(i_fk_cliente integer, i_codigo_cuenta bigint, i_numero_cheque bigint, i_fk_banco integer) returns integer
    language plpgsql
as
$$
DECLARE
    new_metodo_pago_id integer;
BEGIN
    INSERT INTO metodo_pago(
        fk_cliente, tipo_metodo_pago, codigo_cuenta, numero_cheque, fk_banco
    )
    VALUES (
        i_fk_cliente, 'cheque', i_codigo_cuenta, i_numero_cheque, i_fk_banco
    )
    RETURNING id_metodo_pago INTO new_metodo_pago_id;

    RETURN new_metodo_pago_id;
END;
$$;

create or replace function registrar_pago(i_id_venta integer, i_monto_pago bigint, i_fk_metodo_pago integer, i_denominacion character varying) returns integer
    language plpgsql
as
$$
DECLARE
    new_pago_id integer;
    v_monto_total_venta bigint;
    v_total_pagado bigint;
    v_id_cambio_moneda integer;
    v_cantidad_millas integer;
    v_id_metodo_pago integer;
BEGIN
    -- 1. Obtener el ID del cambio de moneda activo
    SELECT id_cambiom INTO v_id_cambio_moneda
    FROM cambio_moneda
    WHERE fecha_fin IS NULL
    LIMIT 1;

    -- 2. Registrar el pago
    INSERT INTO pago(monto, fecha_hora, denominacion, fk_cambio_moneda, fk_metodo_pago, fk_venta)
    VALUES (i_monto_pago, CURRENT_TIMESTAMP, i_denominacion, v_id_cambio_moneda, i_fk_metodo_pago, i_id_venta)
    RETURNING id_pago INTO new_pago_id;

    -- 3. Verificar si la venta ha sido pagada en su totalidad

    -- Obtener monto total de la venta
    SELECT monto_total INTO v_monto_total_venta FROM venta WHERE id_venta = i_id_venta;

    -- Calcular total pagado hasta el momento para esta venta
    SELECT COALESCE(SUM(
                        CASE
                            WHEN denominacion != 'VEN' THEN
                                monto * coalesce(rep_obtener_valor_tasa_cambio(denominacion),1)
                            ELSE monto
                            END), 0) INTO v_total_pagado
    FROM pago
    WHERE fk_venta = i_id_venta;

    -- Si lo pagado es mayor o igual al total, marcar como 'Pagado'
    IF v_total_pagado >= v_monto_total_venta THEN
        PERFORM actualizar_estado_venta(i_id_venta, 'Pagado');

        Select SUM(s.millas_otorgadas) into v_cantidad_millas
        FROM servicio s, itinerario i
        WHERE i_id_venta = i.fk_venta
        AND s.id = i.fk_servicio;

        UPDATE metodo_pago
        SET cantidad_millas = cantidad_millas + v_cantidad_millas
        WHERE fk_cliente = (SELECT v.fk_cliente from venta v where id_venta = i_id_venta)
        AND tipo_metodo_pago = 'milla'
        RETURNING id_metodo_pago into v_id_metodo_pago;

        INSERT into sistema_milla(cantidad_millas, fecha, tipo_transaccion, fk_metodo_pago, fk_cliente)
        VALUES (v_cantidad_millas,
                CURRENT_DATE,
                'credito',
                v_id_metodo_pago,
                (SELECT v.fk_cliente from venta v where id_venta = i_id_venta));
    END IF;

    RETURN new_pago_id;
END;
$$;

create or replace function rep_top_destinos_vendidos()
    returns TABLE(nombre_destino character varying, cantidad_vendida bigint, ingresos_en_bs numeric, denominacion character varying)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
    SELECT
        l.nombre AS nombre_destino,
        COUNT(i.id) AS cantidad_vendida,
        COALESCE(SUM(
            CASE
                WHEN s.denominacion != 'VEN' THEN
                    -- Convertir a Bs usando tasa de cambio
                    COALESCE(i.costo_especial, s.costo_servicio) *
                    COALESCE((SELECT * FROM rep_obtener_valor_tasa_cambio(s.denominacion)), 1) *
                    (1 - COALESCE((SELECT * FROM rep_obtener_valor_descuento(s.id)), 0)/100)
                ELSE
                    -- Ya está en Bs, solo aplicar descuento
                    COALESCE(i.costo_especial, s.costo_servicio) *
                    (1 - COALESCE((SELECT * FROM rep_obtener_valor_descuento(s.id)), 0)/100)
            END
        ), 0) AS ingresos_en_bs,
        'VEN'::VARCHAR AS denominacion  -- Todos convertidos a Bs
    FROM itinerario i
    JOIN venta v ON i.fk_venta = v.id_venta
    JOIN ven_est vest ON v.id_venta = vest.fk_venta
    JOIN estado e ON vest.fk_estado = e.id
    JOIN servicio s ON i.fk_servicio = s.id
    JOIN lugar l ON s.fk_lugar = l.id
    WHERE e.nombre = 'Pagado'
        AND vest.fecha_fin IS NULL  -- Solo estado actual
    GROUP BY l.nombre
    HAVING COUNT(i.id) > 0  -- Asegurar que hay ventas
    ORDER BY cantidad_vendida DESC, ingresos_en_bs DESC  -- Ordenar por cantidad primero, luego ingresos
    LIMIT 10;
END;
$$;

create or replace function rep_ventas_periodo(i_fecha_inicio date DEFAULT NULL::date, i_fecha_fin date DEFAULT NULL::date)
    returns TABLE(id_venta integer, fecha_venta date, cliente_nombre character varying, cliente_ci integer, monto_total numeric, cantidad_items bigint, estado character varying, denominacion character varying)
    language plpgsql
as
$$
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
        -- Convertir monto_total a Bs si es necesario
        COALESCE(
            (SELECT SUM(
                CASE
                    WHEN s.denominacion != 'VEN' THEN
                        COALESCE(i.costo_especial, s.costo_servicio) *
                        COALESCE((SELECT * FROM rep_obtener_valor_tasa_cambio(s.denominacion)), 1)
                    ELSE
                        COALESCE(i.costo_especial, s.costo_servicio)
                END
            )
            FROM itinerario i
            JOIN servicio s ON s.id = i.fk_servicio
            WHERE i.fk_venta = v.id_venta),
            v.monto_total::NUMERIC
        ) AS monto_total,
        (SELECT COUNT(*) FROM itinerario i WHERE i.fk_venta = v.id_venta) AS cantidad_items,
        COALESCE(e.nombre, 'Sin estado')::VARCHAR AS estado,
        'VEN'::VARCHAR AS denominacion  -- Todos convertidos a Bs
    FROM venta v
    JOIN cliente c ON c.id = v.fk_cliente
    LEFT JOIN ven_est ve ON ve.fk_venta = v.id_venta AND ve.fecha_fin IS NULL
    LEFT JOIN estado e ON e.id = ve.fk_estado
    WHERE
        (i_fecha_inicio IS NULL OR EXISTS (
            SELECT 1 FROM itinerario i
            WHERE i.fk_venta = v.id_venta
                AND i.fecha_hora_inicio >= i_fecha_inicio
        ))
        AND (i_fecha_fin IS NULL OR EXISTS (
            SELECT 1 FROM itinerario i
            WHERE i.fk_venta = v.id_venta
                AND i.fecha_hora_inicio <= i_fecha_fin
        ))
    ORDER BY fecha_venta DESC, cantidad_items DESC, monto_total DESC;  -- Ordenar por fecha más reciente primero, luego cantidad, luego monto
END;
$$;

create or replace function rep_clientes_activos(i_fecha_inicio date DEFAULT NULL::date, i_fecha_fin date DEFAULT NULL::date, limite integer DEFAULT 20)
    returns TABLE(id_cliente integer, nombre_completo character varying, ci integer, total_reservas bigint, monto_total_gastado numeric, ultima_reserva date, primera_reserva date, denominacion character varying)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS id_cliente,
        CONCAT(c.nombre_1, ' ', COALESCE(c.nombre_2, ''), ' ', c.apellido_1, ' ', COALESCE(c.apellido_2, ''))::VARCHAR AS nombre_completo,
        c.c_i AS ci,
        COUNT(DISTINCT v.id_venta) AS total_reservas,
        -- Convertir todos los montos a Bs
        COALESCE(SUM(
            CASE
                WHEN s.denominacion != 'VEN' THEN
                    COALESCE(i.costo_especial, s.costo_servicio) *
                    COALESCE((SELECT * FROM rep_obtener_valor_tasa_cambio(s.denominacion)), 1)
                ELSE
                    COALESCE(i.costo_especial, s.costo_servicio)
            END
        ), 0)::NUMERIC AS monto_total_gastado,
        MAX(i.fecha_hora_inicio)::DATE AS ultima_reserva,
        MIN(i.fecha_hora_inicio)::DATE AS primera_reserva,
        'VEN'::VARCHAR AS denominacion  -- Todos convertidos a Bs
    FROM cliente c
    JOIN venta v ON v.fk_cliente = c.id
    JOIN itinerario i ON i.fk_venta = v.id_venta
    JOIN servicio s ON s.id = i.fk_servicio
    WHERE
        (i_fecha_inicio IS NULL OR i.fecha_hora_inicio >= i_fecha_inicio)
        AND (i_fecha_fin IS NULL OR i.fecha_hora_inicio <= i_fecha_fin)
    GROUP BY c.id, c.nombre_1, c.nombre_2, c.apellido_1, c.apellido_2, c.c_i
    HAVING COUNT(DISTINCT v.id_venta) > 0
    ORDER BY total_reservas DESC, monto_total_gastado DESC  -- Ordenar por reservas primero, luego monto
    LIMIT COALESCE(limite, 20);
END;
$$;

create or replace function rep_proveedores_mas_vendidos(i_fecha_inicio date DEFAULT NULL::date, i_fecha_fin date DEFAULT NULL::date, limite integer DEFAULT 10)
    returns TABLE(id_proveedor integer, nombre_proveedor character varying, tipo_proveedor character varying, cantidad_servicios_vendidos bigint, ingresos_totales numeric, promedio_por_servicio numeric, denominacion character varying)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS id_proveedor,
        p.nombre_proveedor,
        p.tipo_proveedor::VARCHAR AS tipo_proveedor,
        COUNT(DISTINCT i.id) AS cantidad_servicios_vendidos,
        -- Convertir ingresos a Bs
        COALESCE(SUM(
            CASE
                WHEN s.denominacion != 'VEN' THEN
                    COALESCE(i.costo_especial, s.costo_servicio) *
                    COALESCE((SELECT * FROM rep_obtener_valor_tasa_cambio(s.denominacion)), 1)
                ELSE
                    COALESCE(i.costo_especial, s.costo_servicio)
            END
        ), 0)::NUMERIC AS ingresos_totales,
        -- Convertir promedio a Bs
        COALESCE(AVG(
            CASE
                WHEN s.denominacion != 'VEN' THEN
                    COALESCE(i.costo_especial, s.costo_servicio) *
                    COALESCE((SELECT * FROM rep_obtener_valor_tasa_cambio(s.denominacion)), 1)
                ELSE
                    COALESCE(i.costo_especial, s.costo_servicio)
            END
        ), 0)::NUMERIC AS promedio_por_servicio,
        'VEN'::VARCHAR AS denominacion  -- Todos convertidos a Bs
    FROM proveedor p
    JOIN servicio s ON s.fk_proveedor = p.id
    JOIN itinerario i ON i.fk_servicio = s.id
    JOIN venta v ON v.id_venta = i.fk_venta
    JOIN ven_est ve ON ve.fk_venta = v.id_venta AND ve.fecha_fin IS NULL
    JOIN estado e ON e.id = ve.fk_estado
    WHERE
        e.nombre IN ('Pagado', 'Completado')
        AND (i_fecha_inicio IS NULL OR i.fecha_hora_inicio >= i_fecha_inicio)
        AND (i_fecha_fin IS NULL OR i.fecha_hora_inicio <= i_fecha_fin)
    GROUP BY p.id, p.nombre_proveedor, p.tipo_proveedor
    HAVING COUNT(DISTINCT i.id) > 0  -- Asegurar que hay servicios vendidos
    ORDER BY cantidad_servicios_vendidos DESC, ingresos_totales DESC  -- Ordenar por cantidad primero, luego ingresos
    LIMIT COALESCE(limite, 10);
END;
$$;

create or replace function agregar_resena(id_itinerario integer, i_calificacion_resena numeric, i_comentario character varying) returns integer
    language plpgsql
as
$$
BEGIN
    IF EXISTS ( SELECT *
                FROM venta
                JOIN ven_est ON ven_est.fk_venta = venta.id_venta
                JOIN estado ON ven_est.fk_estado = estado.id
                JOIN itinerario ON venta.id_venta = itinerario.fk_venta
                WHERE itinerario.id = id_itinerario
                AND estado.nombre = 'Pagado' )
        THEN
        INSERT INTO resena(calificacion_resena, comentario, fk_itinerario)
        VALUES (i_calificacion_resena, i_comentario, id_itinerario);
    ELSE
        RAISE EXCEPTION 'No se puede agregar una reseña a un itinerario que no haya sido pagado';
    end if;
    RETURN 1;
end;
$$;

create or replace function agregar_reclamo(i_comentario character varying, id_cliente integer, id_tipo_reclamo integer, id_itinerario integer) returns integer
    language plpgsql
as
$$
DECLARE id_reclamo integer;
BEGIN
    INSERT INTO reclamo(comentario, fk_cliente, fk_tipo_reclamo, fk_itinerario)
    VALUES (i_comentario, id_cliente, id_tipo_reclamo, id_itinerario)
    RETURNING id INTO id_reclamo;
    INSERT INTO rec_est(fecha_inicio, fk_estado, fk_reclamo)
    VALUES (CURRENT_DATE, 8, id_reclamo); /*ESTADO 8 = En Espera*/
    RETURN 1;
END;
$$;

create or replace function cambiar_estado_reclamo(id_reclamo integer, id_estado integer) returns integer
    language plpgsql
as
$$
BEGIN
    UPDATE rec_est
        SET fecha_final = CURRENT_DATE
        WHERE fk_reclamo = id_reclamo
        AND fecha_final IS NULL;

    INSERT INTO rec_est(fecha_inicio, fk_estado, fk_reclamo)
    VALUES (CURRENT_DATE, id_estado, id_reclamo); /*ESTADO 8 = En Espera*/
    RETURN 1;
END;
$$;

create or replace function listar_deseos(i_fk_cliente integer, i_fk_lugar integer DEFAULT NULL::integer, i_fk_servicio integer DEFAULT NULL::integer) returns void
    language plpgsql
as
$$
BEGIN
    IF (i_fk_lugar IS NOT NULL AND i_fk_servicio IS NOT NULL) THEN
        RAISE EXCEPTION 'No se pueden asignar un lugar y un servicio al mismo tiempo.';
    END IF;

    IF (i_fk_lugar IS NULL AND i_fk_servicio IS NULL) THEN
        RAISE EXCEPTION 'Debe proporcionar al menos un ID de lugar o de servicio.';
    END IF;

    INSERT INTO lista_deseo (fk_cliente, fk_lugar, fk_servicio)
    VALUES (i_fk_cliente, i_fk_lugar, i_fk_servicio);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Error: Uno de los IDs proporcionados (cliente, lugar o servicio) no existe en la base de datos.';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Ocurrió un error inesperado: %', SQLERRM;
END;
$$;

create or replace procedure realizar_reembolso(i_id_venta integer)
    language plpgsql
as
$$
DECLARE
    v_monto_total bigint;
    v_id_reembolso integer;
    v_id_estado_pagado integer;
    v_id_estado_reembolsado integer;
    v_fk_metodo_pago integer;
    v_fk_cambio_moneda integer;
    v_denominacion varchar;
BEGIN
    SELECT monto_total INTO v_monto_total
    FROM venta
    WHERE id_venta = i_id_venta;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La venta con ID % no existe.', i_id_venta;
    END IF;

    SELECT id INTO v_id_estado_pagado FROM estado WHERE nombre = 'Pagado';
    SELECT id INTO v_id_estado_reembolsado FROM estado WHERE nombre = 'Reembolsado';

    -- Validar que la venta esté en estado 'Pagado' antes de reembolsar
    IF NOT EXISTS (
        SELECT 1 FROM ven_est
        WHERE fk_venta = i_id_venta AND fk_estado = v_id_estado_pagado AND fecha_fin IS NULL
    ) THEN
        RAISE EXCEPTION 'La venta % no se encuentra en estado "Pagado". No es posible realizar el reembolso.', i_id_venta;
    END IF;


    INSERT INTO reembolso (monto_reembolso, fk_venta)
    VALUES (v_monto_total, i_id_venta)
    RETURNING id_reembolso INTO v_id_reembolso;

    UPDATE ven_est
    SET fecha_fin = CURRENT_TIMESTAMP
    WHERE fk_venta = i_id_venta AND fecha_fin IS NULL;

    INSERT INTO ven_est (fk_estado, fk_venta, fecha_inicio)
    VALUES (v_id_estado_reembolsado, i_id_venta, CURRENT_TIMESTAMP);

    -- Registrar el movimiento en la tabla PAGO (Salida por reembolso)
    --
    SELECT fk_metodo_pago, fk_cambio_moneda, denominacion
    INTO v_fk_metodo_pago, v_fk_cambio_moneda, v_denominacion
    FROM pago
    WHERE fk_venta = i_id_venta
    LIMIT 1;

    INSERT INTO pago (monto, fecha_hora, denominacion, fk_cambio_moneda, fk_metodo_pago, fk_reembolso, fk_reembolso_venta_id)
    VALUES (v_monto_total, CURRENT_TIMESTAMP, v_denominacion, v_fk_cambio_moneda, v_fk_metodo_pago, v_id_reembolso, i_id_venta);

    RAISE NOTICE 'Procedimiento completado: La venta % ha sido reembolsada exitosamente por un monto de %.', i_id_venta, v_monto_total;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al procesar el reembolso: %', SQLERRM;
END;
$$;

create or replace procedure gestionar_restriccion_paquete(i_id_usuario integer, i_id_paquete integer, i_caracteristica character varying, i_operador character varying, i_valor character varying)
    language plpgsql
as
$$
DECLARE
    v_rol varchar;
    v_id_proveedor_u integer;
BEGIN
    -- Identifica al usuario y su rol
    SELECT r.nombre, u.fk_proveedor INTO v_rol, v_id_proveedor_u
    FROM usuario u
    JOIN rol r ON u.fk_rol = r.id
    WHERE u.id = i_id_usuario;

    /*-- Validar permisos
    IF v_rol = 'ADMIN' THEN
        NULL;
    ELSIF v_rol = 'PROVEEDOR' THEN
        IF NOT EXISTS (
            SELECT 1 FROM paquete_servicio ps
            JOIN servicio s ON ps.fk_servicio = s.id
            WHERE ps.fk_paquete = i_id_paquete AND s.fk_proveedor = v_id_proveedor_u
        ) THEN
            RAISE EXCEPTION 'Acceso denegado: Usted no es dueño de los servicios en este paquete.';
        END IF;
    ELSE
        RAISE EXCEPTION 'El rol % no tiene permisos para gestionar restricciones.', v_rol;
    END IF;*/

    -- Insertar la restricción en la tabla
    INSERT INTO restriccion (fk_paquete, caracteristica, operador, valor_restriccion)
    VALUES (i_id_paquete, LOWER(i_caracteristica), i_operador, LOWER(i_valor));

    RAISE NOTICE 'Restricción aplicada: El paquete % ahora requiere % % %',
                 i_id_paquete, i_caracteristica, i_operador, i_valor;
END;
$$;

create or replace function cliente_cumple_restricciones(i_id_cliente integer, i_id_paquete integer) returns boolean
    language plpgsql
as
$$
DECLARE
    v_res record;
    v_cliente record;
    v_cumple boolean;
BEGIN
    -- 1. Obtener datos que SÍ existen en la tabla cliente
    SELECT *, extract(year from age(fecha_nacimiento))::integer as edad
    INTO v_cliente FROM cliente WHERE id = i_id_cliente;

    -- 2. Revisar cada restricción del paquete
    FOR v_res IN (SELECT * FROM restriccion WHERE fk_paquete = i_id_paquete) LOOP

        -- VALIDACIÓN DE EDAD
        IF v_res.caracteristica = 'edad' THEN
            IF v_res.operador = '>' THEN v_cumple := (v_cliente.edad > v_res.valor_restriccion::integer);
            ELSIF v_res.operador = '<' THEN v_cumple := (v_cliente.edad < v_res.valor_restriccion::integer);
            ELSIF v_res.operador = '=' THEN v_cumple := (v_cliente.edad = v_res.valor_restriccion::integer);
            END IF;

            IF NOT v_cumple THEN
                RAISE EXCEPTION 'Bloqueado: El cliente tiene % años y se requiere % %',
                                v_cliente.edad, v_res.operador, v_res.valor_restriccion;
            END IF;

        -- VALIDACIÓN DE ESTADO CIVIL
        ELSIF v_res.caracteristica = 'estado_civil' THEN
            IF v_res.operador = '=' THEN
                v_cumple := (v_cliente.estado_civil::text = v_res.valor_restriccion);
            ELSIF v_res.operador = '!=' THEN
                v_cumple := (v_cliente.estado_civil::text != v_res.valor_restriccion);
            END IF;

            IF NOT v_cumple THEN
                RAISE EXCEPTION 'Bloqueado: El paquete es solo para personas %', v_res.valor_restriccion;
            END IF;


        ELSE
            RAISE NOTICE 'Nota: El paquete tiene una restricción de "%" que debe ser verificada manualmente.', v_res.caracteristica;
        END IF;

    END LOOP;

    RETURN true;
END;
$$;

create or replace function agregar_cuotas(i_id_venta integer, i_tasa_interes integer, num_cuotas integer) returns integer
    language plpgsql
as
$$
DECLARE id_plan integer;
        ids_cuotas integer;
        monto_venta bigint;
        monto_cuota_interes bigint;
BEGIN
    INSERT INTO plan_cuotas(tasa_interes, fk_venta)
    VALUES (i_tasa_interes,i_id_venta)
    RETURNING id_plan_cuotas into id_plan;

    monto_venta = (SELECT monto_total
                   FROM venta
                   WHERE id_venta = i_id_venta);

    monto_cuota_interes = (monto_venta * ((i_tasa_interes / 100)+1)) / num_cuotas;

    FOR i IN 1..num_cuotas
        LOOP
            INSERT INTO cuota(monto_cuota, fk_plan_cuotas, fecha_pagar)
            VALUES (monto_cuota_interes,id_plan,CURRENT_DATE+i*30)
            RETURNING id_cuota into ids_cuotas;

            INSERT INTO cuo_ecuo(fk_cuota, fk_estado, fecha_inicio)
            VALUES (ids_cuotas,1,CURRENT_DATE);
        end loop;
    RETURN 1;
end;
$$;

create or replace function pagar_cuota(i_id_cuota integer, monto bigint, i_fk_metodo_pago integer, i_denominacion character varying) returns integer
    language plpgsql
as
$$
BEGIN
    IF EXISTS ( SELECT *
                FROM venta
                JOIN ven_est ON ven_est.fk_venta = venta.id_venta
                JOIN estado ON ven_est.fk_estado = estado.id
                JOIN plan_cuotas ON venta.id_venta = plan_cuotas.fk_venta
                JOIN public.cuota c on plan_cuotas.id_plan_cuotas = c.fk_plan_cuotas
                WHERE c.id_cuota = i_id_cuota
                AND estado.nombre = 'pendiente')
    THEN
        IF (SELECT monto_cuota FROM cuota WHERE id_cuota = i_id_cuota) = monto THEN
            UPDATE cuo_ecuo
            SET fecha_fin = current_date
            WHERE fk_cuota = i_id_cuota;

            INSERT INTO cuo_ecuo(fk_cuota, fk_estado, fecha_inicio)
            VALUES (i_id_cuota,2,current_date);

            PERFORM registrar_pago((Select fk_venta
                                                    from plan_cuotas
                                                    JOIN cuota ON plan_cuotas.id_plan_cuotas = cuota.fk_plan_cuotas
                                                    where cuota.id_cuota = i_id_cuota)
                                        ,monto
                                        ,i_fk_metodo_pago
                                        ,i_denominacion);
        ELSE
            RAISE EXCEPTION 'El monto tiene que ser igual al de la cuota';
        end if;
    ELSE
        RAISE EXCEPTION 'No se puede pagar una cuota a una venta que ya haya sido pagada';
    end if;
    RETURN 1;
end;
$$;

create or replace function insertar_paquete(i_id_paquete integer, i_nombre character varying, i_descripcion character varying, i_tipo_paquete character varying, i_ids_servicios integer[]) returns integer
    language plpgsql
as
$$
DECLARE
    id_servicio integer;
BEGIN
    INSERT INTO paquete(id, nombre, descripcion, tipo_paquete)
    VALUES (i_id_paquete, i_nombre, i_descripcion, i_tipo_paquete);

    IF i_ids_servicios IS NOT NULL THEN
        FOREACH id_servicio IN ARRAY i_ids_servicios
        LOOP
            INSERT INTO paquete_servicio(fk_paquete, fk_servicio)
            VALUES (i_id_paquete, id_servicio);
        END LOOP;
    END IF;

    RETURN i_id_paquete;
END;
$$;


