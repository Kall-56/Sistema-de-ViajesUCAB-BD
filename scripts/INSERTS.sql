insert into public.banco (id_banco, nombre_banco)
values  (1, 'Bancaribe'),
        (2, 'Banesco'),
        (3, 'BBVA Provincial'),
        (4, 'Mercantil'),
        (5, 'Banco de Venezuela'),
        (6, 'Banco Nacional de Credito'),
        (7, 'Banco del tesoro'),
        (8, 'Bancamiga'),
        (9, 'Banco Venezolano de Credito'),
        (10, 'Wells Fargo');

insert into public.cambio_moneda (id_cambiom, cantidad_cambio, fecha_inicio, fecha_fin, denominacion)
values  (2, 190, '2025-12-01 00:00:00.000000', '2025-12-15 00:00:00.000000', 'EUR'),
        (3, 55, '2025-12-16 00:00:00.000000', '2025-12-31 00:00:00.000000', 'EUR'),
        (4, 36, '2025-12-01 00:00:00.000000', '2026-01-31 00:00:00.000000', 'MXN'),
        (5, 146, '2025-12-01 00:00:00.000000', '2025-12-05 00:00:00.000000', 'JPY'),
        (6, 146, '2025-12-06 00:00:00.000000', '2025-12-31 00:00:00.000000', 'JPY'),
        (7, 21, '2025-12-01 00:00:00.000000', null, 'EUR'),
        (8, 110, '2025-12-01 00:00:00.000000', '2025-12-31 00:00:00.000000', 'USD'),
        (9, 200, '2025-12-01 00:00:00.000000', '2026-06-30 00:00:00.000000', 'USD'),
        (10, 1, '2025-12-01 00:00:00.000000', null, 'MXN'),
        (1, 260, '2025-12-13 12:15:13.000000', null, 'USD'),
        (11,50,'2025-04-10 00:00:00.000000','2025-08-20 00:00:00.000000','milla'),
        (12,150,'2025-08-20 00:00:00.000000','2025-10-25 00:00:00.000000','milla'),
        (13,25,'2025-10-25 00:00:00.000000','2025-11-02 00:00:00.000000','milla'),
        (14,80,'2025-11-02 00:00:00.000000','2025-12-01 00:00:00.000000','milla'),
        (15,110,'2025-12-01 00:00:00.000000',null,'milla');


insert into public.estado (id, nombre)
values  (1, 'pendiente'),
        (2, 'Pagado'),
        (3, 'Aprobado'),
        (4, 'rechazado'),
        (5, 'Completado'),
        (6, 'Cancelado'),
        (7, 'En Proceso'),
        (8, 'En Espera'),
        (9, 'Enviado'),
        (10, 'Recibido');

insert into public.hotel (id, direccion, tipo_hotel)
values  (2, 'Dir. Hotel Moderno 1', 'Boutique'),
        (3, 'Dir. Hotel Moderno 2', 'Resort'),
        (4, 'Dir. Hotel Moderno 3', 'Boutique'),
        (5, 'Dir. Hotel Moderno 4', 'Resort'),
        (6, 'Dir. Hotel Moderno 5', 'Boutique'),
        (7, 'Dir. Hotel Moderno 6', 'Resort'),
        (8, 'Dir. Hotel Moderno 7', 'Boutique'),
        (9, 'Dir. Hotel Moderno 8', 'Resort'),
        (10, 'Dir. Hotel Moderno 9', 'Boutique'),
        (11, 'Marriott Hotel', 'Resort'),
        (16, 'Princess Mundo Imperial', 'Boutique'),
        (21, 'Hotel IEUD', 'Resort'),
        (17, 'Holiday Inn Express', 'Resort'),
        (15, 'King David Flat Hotel', 'Resort'),
        (14, 'Hotel Costa Mar', 'Boutique'),
        (12, 'EuroBuilding', 'Boutique'),
        (20, 'Hotel Casino Internacional', 'Boutique'),
        (19, 'MK Express', 'Resort'),
        (13, 'LVH', 'Resort'),
        (18, 'Four Points Flex', 'Boutique');

insert into public.lugar (id, nombre, tipo, fk_lugar)
values  
        (402,'America','continente',NULL),
        (403,'Europa','continente',NULL),
        (404,'Asia','continente',NULL),
        (405,'Oceania','continente',NULL),
        (406, 'Africa','continente',NULL),
        (1, 'Venezuela', 'país', 402),
        (2, 'España', 'país', 403),
        (3, 'Estados Unidos', 'país', 402),
        (4, 'Colombia', 'país', 402),
        (5, 'Argentina', 'país', 402),
        (6, 'México', 'país', 402),
        (7, 'Francia', 'país', 403),
        (8, 'Canadá', 'país', 402),
        (9, 'Japón', 'país', 404),
        (10, 'Brasil', 'país', 402),
        (11, 'Amazonas', 'estado', 1),
        (12, 'Anzoátegui', 'estado', 1),
        (13, 'Apure', 'estado', 1),
        (14, 'Aragua', 'estado', 1),
        (15, 'Barinas', 'estado', 1),
        (16, 'Bolívar', 'estado', 1),
        (17, 'Carabobo', 'estado', 1),
        (18, 'Cojedes', 'estado', 1),
        (19, 'Delta Amacuro', 'estado', 1),
        (20, 'Falcón', 'estado', 1),
        (21, 'Guárico', 'estado', 1),
        (22, 'Lara', 'estado', 1),
        (23, 'Mérida', 'estado', 1),
        (24, 'Miranda', 'estado', 1),
        (25, 'Monagas', 'estado', 1),
        (26, 'Nueva Esparta', 'estado', 1),
        (27, 'Portuguesa', 'estado', 1),
        (28, 'Sucre', 'estado', 1),
        (29, 'Táchira', 'estado', 1),
        (30, 'Trujillo', 'estado', 1),
        (31, 'Vargas', 'estado', 1),
        (32, 'Yaracuy', 'estado', 1),
        (33, 'Zulia', 'estado', 1),
        (34, 'Distrito Capital', 'estado', 1),
        (35, 'Dependencias Federales', 'estado', 1),
        (36, 'Madrid', 'provincia', 2),
        (37, 'Barcelona', 'provincia', 2),
        (38, 'Sevilla', 'provincia', 2),
        (39, 'Valencia', 'provincia', 2),
        (40, 'Alicante', 'provincia', 2),
        (41, 'New York', 'estado', 3),
        (42, 'Florida', 'estado', 3),
        (43, 'Texas', 'estado', 3),
        (44, 'California', 'estado', 3),
        (45, 'Ohio', 'estado', 3),
        (46, 'Antioquia', 'estado', 4),
        (47, 'Cundinamarca', 'estado', 4),
        (48, 'Magdalena', 'estado', 4),
        (49, 'Bolivar', 'estado', 4),
        (50, 'Valle de Cuaca', 'estado', 4),
        (51, 'Buenos Aires', 'provincia', 5),
        (52, 'Córdoba', 'provincia', 5),
        (53, 'Santa Fe', 'provincia', 5),
        (54, 'Mendoza', 'provincia', 5),
        (55, 'Tucuman', 'provincia', 5),
        (56, 'Ciudad de México', 'estado', 6),
        (57, 'Jalisco', 'estado', 6),
        (58, 'Quintana Roo', 'estado', 6),
        (59, 'Yucatan', 'estado', 6),
        (60, 'Puebla', 'estado', 6),
        (61, 'París', 'region', 7),
        (62, 'Lyon', 'region', 7),
        (63, 'Marsella', 'region', 7),
        (64, 'Orleans', 'region', 7),
        (65, 'Burdeos', 'region', 7),
        (66, 'Toronto', 'provincia', 8),
        (67, 'Ciudad de Quebec', 'provincia', 8),
        (68, 'Edmonton', 'provincia', 8),
        (69, 'Columbia Britanica', 'provincia', 8),
        (70, 'Manitoba', 'provincia', 8),
        (71, 'Kanto: Tokio', 'estado', 9),
        (72, 'Kansai: Kioto', 'estado', 9),
        (73, 'Kansai: Osaka', 'estado', 9),
        (74, 'Chugoku: Hiroshima', 'estado', 9),
        (75, 'Hokkaido: Aomori', 'estado', 9),
        (76, 'São Paulo', 'estado', 10),
        (77, 'Rio de Janeiro', 'estado', 10),
        (78, 'Minas Gerais', 'estado', 10),
        (79, 'Roraima', 'estado', 10),
        (80, 'Brasilia', 'estado', 10),
        (81, 'Alto Orinoco', 'municipio', 11),
        (82, 'Atabapo', 'municipio', 11),
        (83, 'Atures', 'municipio', 11),
        (84, 'Autana', 'municipio', 11),
        (85, 'Manapiare', 'municipio', 11),
        (86, 'Maroa', 'municipio', 11),
        (87, 'Río Negro', 'municipio', 11),
        (88, 'Anaco', 'municipio', 12),
        (89, 'Aragua', 'municipio', 12),
        (90, 'Bolívar', 'municipio', 12),
        (91, 'Bruzual', 'municipio', 12),
        (92, 'Cajigal', 'municipio', 12),
        (93, 'Carvajal', 'municipio', 12),
        (94, 'Guanape', 'municipio', 12),
        (95, 'Libertad', 'municipio', 12),
        (96, 'Miranda', 'municipio', 12),
        (97, 'Monagas', 'municipio', 12),
        (98, 'Peñalver', 'municipio', 12),
        (99, 'Píritu', 'municipio', 12),
        (100, 'San Juan de Capistrano', 'municipio', 12),
        (101, 'Santa Ana', 'municipio', 12),
        (102, 'Simón Rodríguez', 'municipio', 12),
        (103, 'Sotillo', 'municipio', 12),
        (104, 'Turístico Diego Bautista Urbaneja', 'municipio', 12),
        (105, 'Freites', 'municipio', 12),
        (106, 'Guanipa', 'municipio', 12),
        (107, 'Independencia', 'municipio', 12),
        (108, 'McGregor', 'municipio', 12),
        (109, 'Achaguas', 'municipio', 13),
        (110, 'Biruaca', 'municipio', 13),
        (111, 'Muñoz', 'municipio', 13),
        (112, 'Páez', 'municipio', 13),
        (113, 'Pedro Camejo', 'municipio', 13),
        (114, 'Rómulo Gallegos', 'municipio', 13),
        (115, 'San Fernando', 'municipio', 13),
        (116, 'Bolívar', 'municipio', 14),
        (117, 'Camatagua', 'municipio', 14),
        (118, 'Girardot', 'municipio', 14),
        (119, 'José Ángel Lamas', 'municipio', 14),
        (120, 'José Félix Ribas', 'municipio', 14),
        (121, 'José Rafael Revenga', 'municipio', 14),
        (122, 'Libertador', 'municipio', 14),
        (123, 'Mario Briceño Iragorry', 'municipio', 14),
        (124, 'San Casimiro', 'municipio', 14),
        (125, 'San Sebastián', 'municipio', 14),
        (126, 'Santiago Mariño', 'municipio', 14),
        (127, 'Santos Michelena', 'municipio', 14),
        (128, 'Sucre', 'municipio', 14),
        (129, 'Tovar', 'municipio', 14),
        (130, 'Urdaneta', 'municipio', 14),
        (131, 'Zamora', 'municipio', 14),
        (132, 'Alberto Arvelo Torrealba', 'municipio', 15),
        (133, 'Antonio José de Sucre', 'municipio', 15),
        (134, 'Arismendi', 'municipio', 15),
        (135, 'Barinas', 'municipio', 15),
        (136, 'Bolívar', 'municipio', 15),
        (137, 'Cruz Paredes', 'municipio', 15),
        (138, 'Ezequiel Zamora', 'municipio', 15),
        (139, 'Obispos', 'municipio', 15),
        (140, 'Pedraza', 'municipio', 15),
        (141, 'Rojas', 'municipio', 15),
        (142, 'Sosa', 'municipio', 15),
        (143, 'Caroní', 'municipio', 16),
        (144, 'Cedeño', 'municipio', 16),
        (145, 'Chaguarama', 'municipio', 16),
        (146, 'El Pao', 'municipio', 16),
        (147, 'Falcón', 'municipio', 16),
        (148, 'Herés', 'municipio', 16),
        (149, 'Roscio', 'municipio', 16),
        (150, 'Sifontes', 'municipio', 16),
        (151, 'Sucre', 'municipio', 16),
        (152, 'Padre Pedro Chien', 'municipio', 16),
        (153, 'Bejuma', 'municipio', 17),
        (154, 'Carlos Arvelo', 'municipio', 17),
        (155, 'Diego Ibarra', 'municipio', 17),
        (156, 'Guacara', 'municipio', 17),
        (157, 'Juan José Mora', 'municipio', 17),
        (158, 'Libertador', 'municipio', 17),
        (159, 'Los Guayos', 'municipio', 17),
        (160, 'Miranda', 'municipio', 17),
        (161, 'Montalbán', 'municipio', 17),
        (162, 'Naguanagua', 'municipio', 17),
        (163, 'Puerto Cabello', 'municipio', 17),
        (164, 'San Diego', 'municipio', 17),
        (165, 'San Joaquín', 'municipio', 17),
        (166, 'Valencia', 'municipio', 17),
        (167, 'Anzoátegui', 'municipio', 18),
        (168, 'Pao de San Juan Bautista', 'municipio', 18),
        (169, 'Ricaurte', 'municipio', 18),
        (170, 'San Carlos', 'municipio', 18),
        (171, 'Tinaco', 'municipio', 18),
        (172, 'Tinaquillo', 'municipio', 18),
        (173, 'Girasol', 'municipio', 18),
        (174, 'Antonio Díaz', 'municipio', 19),
        (175, 'Casacoima', 'municipio', 19),
        (176, 'Pedernales', 'municipio', 19),
        (177, 'Tucupita', 'municipio', 19),
        (178, 'Acosta', 'municipio', 20),
        (179, 'Bolívar', 'municipio', 20),
        (180, 'Buchivacoa', 'municipio', 20),
        (181, 'Cacique Manaure', 'municipio', 20),
        (182, 'Carirubana', 'municipio', 20),
        (183, 'Colina', 'municipio', 20),
        (184, 'Dabajuro', 'municipio', 20),
        (185, 'Democracia', 'municipio', 20),
        (186, 'Falcón', 'municipio', 20),
        (187, 'Federación', 'municipio', 20),
        (188, 'Iturriza', 'municipio', 20),
        (189, 'Jacura', 'municipio', 20),
        (190, 'Los Taques', 'municipio', 20),
        (191, 'Mauroa', 'municipio', 20),
        (192, 'Miranda', 'municipio', 20),
        (193, 'Monseñor Iturriza', 'municipio', 20),
        (194, 'Palma Sola', 'municipio', 20),
        (195, 'Petit', 'municipio', 20),
        (196, 'Píritu', 'municipio', 20),
        (197, 'San Francisco', 'municipio', 20),
        (198, 'Silva', 'municipio', 20),
        (199, 'Sucre', 'municipio', 20),
        (200, 'Tocópero', 'municipio', 20),
        (201, 'Unión', 'municipio', 20),
        (202, 'Urumaco', 'municipio', 20),
        (203, 'Zamora', 'municipio', 20),
        (204, 'Camaguán', 'municipio', 21),
        (205, 'Chaguaramas', 'municipio', 21),
        (206, 'El Socorro', 'municipio', 21),
        (207, 'Infante', 'municipio', 21),
        (208, 'Las Mercedes', 'municipio', 21),
        (209, 'Mellado', 'municipio', 21),
        (210, 'Miranda', 'municipio', 21),
        (211, 'Monagas', 'municipio', 21),
        (212, 'Ortiz', 'municipio', 21),
        (213, 'Ribas', 'municipio', 21),
        (214, 'San Jerónimo de Guayabal', 'municipio', 21),
        (215, 'San José de Guaribe', 'municipio', 21),
        (216, 'Santa María de Ipire', 'municipio', 21),
        (217, 'Zaraza', 'municipio', 21),
        (218, 'Andrés Eloy Blanco', 'municipio', 22),
        (219, 'Crespo', 'municipio', 22),
        (220, 'Iribarren', 'municipio', 22),
        (221, 'Jiménez', 'municipio', 22),
        (222, 'Morán', 'municipio', 22),
        (223, 'Palavecino', 'municipio', 22),
        (224, 'Simón Planas', 'municipio', 22),
        (225, 'Torres', 'municipio', 22),
        (226, 'Urdaneta', 'municipio', 22),
        (227, 'Alberto Adriani', 'municipio', 23),
        (228, 'Andrés Bello', 'municipio', 23),
        (229, 'Antonio Pinto Salinas', 'municipio', 23),
        (230, 'Aricagua', 'municipio', 23),
        (231, 'Arzobispo Chacón', 'municipio', 23),
        (232, 'Campo Elías', 'municipio', 23),
        (233, 'Caracciolo Parra Olmedo', 'municipio', 23),
        (234, 'Cardenal Quintero', 'municipio', 23),
        (235, 'Guaraque', 'municipio', 23),
        (236, 'Julio César Salas', 'municipio', 23),
        (237, 'Justo Briceño', 'municipio', 23),
        (238, 'Libertador', 'municipio', 23),
        (239, 'Miranda', 'municipio', 23),
        (240, 'Obispo Ramos de Lora', 'municipio', 23),
        (241, 'Padre Noguera', 'municipio', 23),
        (242, 'Pueblo Llano', 'municipio', 23),
        (243, 'Rangel', 'municipio', 23),
        (244, 'Rivas Dávila', 'municipio', 23),
        (245, 'Santos Marquina', 'municipio', 23),
        (246, 'Sucre', 'municipio', 23),
        (247, 'Tovar', 'municipio', 23),
        (248, 'Tulio Febres Cordero', 'municipio', 23),
        (249, 'Zea', 'municipio', 23),
        (250, 'Acevedo', 'municipio', 24),
        (251, 'Andrés Bello', 'municipio', 24),
        (252, 'Baruta', 'municipio', 24),
        (253, 'Brión', 'municipio', 24),
        (254, 'Buroz', 'municipio', 24),
        (255, 'Carrizal', 'municipio', 24),
        (256, 'Chacao', 'municipio', 24),
        (257, 'Cristóbal Rojas', 'municipio', 24),
        (258, 'El Hatillo', 'municipio', 24),
        (259, 'Guaicaipuro', 'municipio', 24),
        (260, 'Independencia', 'municipio', 24),
        (261, 'Lander', 'municipio', 24),
        (262, 'Los Salias', 'municipio', 24),
        (263, 'Páez', 'municipio', 24),
        (264, 'Paz Castillo', 'municipio', 24),
        (265, 'Pedro Gual', 'municipio', 24),
        (266, 'Plaza', 'municipio', 24),
        (267, 'Simón Bolívar', 'municipio', 24),
        (268, 'Sucre', 'municipio', 24),
        (269, 'Urdaneta', 'municipio', 24),
        (270, 'Zamora', 'municipio', 24),
        (271, 'Acosta', 'municipio', 25),
        (272, 'Aguasay', 'municipio', 25),
        (273, 'Bolívar', 'municipio', 25),
        (274, 'Caripe', 'municipio', 25),
        (275, 'Cedeño', 'municipio', 25),
        (276, 'Ezequiel Zamora', 'municipio', 25),
        (277, 'Libertador', 'municipio', 25),
        (278, 'Maturín', 'municipio', 25),
        (279, 'Piar', 'municipio', 25),
        (280, 'Punceres', 'municipio', 25),
        (281, 'Santa Bárbara', 'municipio', 25),
        (282, 'Sotillo', 'municipio', 25),
        (283, 'Uracoa', 'municipio', 25),
        (284, 'Antolín del Campo', 'municipio', 26),
        (285, 'Arismendi', 'municipio', 26),
        (286, 'García', 'municipio', 26),
        (287, 'Gómez', 'municipio', 26),
        (288, 'Maneiro', 'municipio', 26),
        (289, 'Marcano', 'municipio', 26),
        (290, 'Mariño', 'municipio', 26),
        (291, 'Macanao', 'municipio', 26),
        (292, 'Tubores', 'municipio', 26),
        (293, 'Villalba', 'municipio', 26),
        (294, 'Díaz', 'municipio', 26),
        (295, 'Aguasay', 'municipio', 27),
        (296, 'Esteller', 'municipio', 27),
        (297, 'Guanare', 'municipio', 27),
        (298, 'Guanarito', 'municipio', 27),
        (299, 'Monagas', 'municipio', 27),
        (300, 'Páez', 'municipio', 27),
        (301, 'Papelón', 'municipio', 27),
        (302, 'Santa Rosalía', 'municipio', 27),
        (303, 'Sucre', 'municipio', 27),
        (304, 'Undas', 'municipio', 27),
        (305, 'Turén', 'municipio', 27),
        (306, 'Andrés Eloy Blanco', 'municipio', 28),
        (307, 'Arismendi', 'municipio', 28),
        (308, 'Bermúdez', 'municipio', 28),
        (309, 'Bolívar', 'municipio', 28),
        (310, 'Cajigal', 'municipio', 28),
        (311, 'Cruces', 'municipio', 28),
        (312, 'Libertador', 'municipio', 28),
        (313, 'Mariño', 'municipio', 28),
        (314, 'Mejía', 'municipio', 28),
        (315, 'Montes', 'municipio', 28),
        (316, 'Ribero', 'municipio', 28),
        (317, 'Sucre', 'municipio', 28),
        (318, 'Valdez', 'municipio', 28),
        (319, 'Andrés Bello', 'municipio', 29),
        (320, 'Ayacucho', 'municipio', 29),
        (321, 'Bolívar', 'municipio', 29),
        (322, 'Cárdenas', 'municipio', 29),
        (323, 'Córdoba', 'municipio', 29),
        (324, 'Fernández Feo', 'municipio', 29),
        (325, 'García de Hevia', 'municipio', 29),
        (326, 'Gómez', 'municipio', 29),
        (327, 'Guásimos', 'municipio', 29),
        (328, 'Independencia', 'municipio', 29),
        (329, 'Jáuregui', 'municipio', 29),
        (330, 'Libertador', 'municipio', 29),
        (331, 'Lobatera', 'municipio', 29),
        (332, 'Michelena', 'municipio', 29),
        (333, 'Panamericano', 'municipio', 29),
        (334, 'Pedro María Ureña', 'municipio', 29),
        (335, 'Samuel Darío Maldonado', 'municipio', 29),
        (336, 'San Cristóbal', 'municipio', 29),
        (337, 'San Judas Tadeo', 'municipio', 29),
        (338, 'Seboruco', 'municipio', 29),
        (339, 'Simón Rodríguez', 'municipio', 29),
        (340, 'Sucre', 'municipio', 29),
        (341, 'Torbes', 'municipio', 29),
        (342, 'Uribante', 'municipio', 29),
        (343, 'Vargas', 'municipio', 29),
        (344, 'Antonio Rómulo Costa', 'municipio', 29),
        (345, 'Arjona', 'municipio', 29),
        (346, 'Andrés Eloy Blanco', 'municipio', 30),
        (347, 'Boconó', 'municipio', 30),
        (348, 'Bolívar', 'municipio', 30),
        (349, 'Carache', 'municipio', 30),
        (350, 'Escuque', 'municipio', 30),
        (351, 'Gibraltar', 'municipio', 30),
        (352, 'La Ceiba', 'municipio', 30),
        (353, 'Miranda', 'municipio', 30),
        (354, 'Monte Carmelo', 'municipio', 30),
        (355, 'Motatán', 'municipio', 30),
        (356, 'Pampán', 'municipio', 30),
        (357, 'Pampanito', 'municipio', 30),
        (358, 'Rafael Rangel', 'municipio', 30),
        (359, 'San Rafael de Carvajal', 'municipio', 30),
        (360, 'Sucre', 'municipio', 30),
        (361, 'Trujillo', 'municipio', 30),
        (362, 'Urdaneta', 'municipio', 30),
        (363, 'Valera', 'municipio', 30),
        (364, 'Vargas', 'municipio', 31),
        (365, 'Arístides Bastidas', 'municipio', 32),
        (366, 'Bolívar', 'municipio', 32),
        (367, 'Bruzual', 'municipio', 32),
        (368, 'Cocorote', 'municipio', 32),
        (369, 'Independencia', 'municipio', 32),
        (370, 'José Antonio Páez', 'municipio', 32),
        (371, 'La Trinidad', 'municipio', 32),
        (372, 'Manuel Monge', 'municipio', 32),
        (373, 'Nirgua', 'municipio', 32),
        (374, 'Peña', 'municipio', 32),
        (375, 'San Felipe', 'municipio', 32),
        (376, 'Sucre', 'municipio', 32),
        (377, 'Urachiche', 'municipio', 32),
        (378, 'Veroes', 'municipio', 32),
        (379, 'Almirante Padilla', 'municipio', 33),
        (380, 'Baralt', 'municipio', 33),
        (381, 'Cabimas', 'municipio', 33),
        (382, 'Catatumbo', 'municipio', 33),
        (383, 'Colón', 'municipio', 33),
        (384, 'Francisco Javier Pulgar', 'municipio', 33),
        (385, 'Jesús Enrique Lossada', 'municipio', 33),
        (386, 'Jesús María Semprún', 'municipio', 33),
        (387, 'La Cañada de Urdaneta', 'municipio', 33),
        (388, 'Lagunillas', 'municipio', 33),
        (389, 'Machiques de Perijá', 'municipio', 33),
        (390, 'Mara', 'municipio', 33),
        (391, 'Maracaibo', 'municipio', 33),
        (392, 'Miranda', 'municipio', 33),
        (393, 'Páez', 'municipio', 33),
        (394, 'Rosario de Perijá', 'municipio', 33),
        (395, 'San Francisco', 'municipio', 33),
        (396, 'Santa Rita', 'municipio', 33),
        (397, 'Simón Bolívar', 'municipio', 33),
        (398, 'Sucre', 'municipio', 33),
        (399, 'Valmore Rodríguez', 'municipio', 33),
        (400, 'Libertador', 'municipio', 34),
        (401, 'Dependencias Federales', 'municipio', 35);

insert into public.permiso (id, descripcion)
values  (1, 'USUARIOS_LISTAR'),
        (2, 'USUARIOS_CREAR'),
        (3, 'USUARIOS_EDITAR'),
        (4, 'USUARIOS_ELIMINAR'),
        (5, 'ROLES_LISTAR'),
        (6, 'ROLES_CREAR'),
        (7, 'ROLES_EDITAR'),
        (8, 'ROLES_ELIMINAR'),
        (9, 'PERMISOS_LISTAR'),
        (10, 'CLIENTES_LISTAR'),
        (11, 'CLIENTES_CREAR'),
        (12, 'CLIENTES_EDITAR'),
        (13, 'CLIENTES_ELIMINAR'),
        (14, 'PROVEEDORES_LISTAR'),
        (15, 'PROVEEDORES_CREAR'),
        (16, 'PROVEEDORES_EDITAR'),
        (17, 'PROVEEDORES_ELIMINAR');

insert into public.rol (id, nombre)
values  (2, 'PROVEEDOR'),
        (3, 'ADMIN'),
        (1, 'CLIENTE'),
        (4, 'Marketing'),
        (5, 'Analista'),
        (6, 'Editor basico'),
        (7, 'Agente de Ventas'),
        (8, 'Soporte Técnico'),
        (9, 'Finanzas'),
        (10, 'Recursos Humanos');

insert into public.permiso_rol (fk_permiso, fk_rol)
values  (10, 1),
        (11, 1),
        (12, 1),
        (13, 1),
        (14, 2),
        (15, 2),
        (16, 2),
        (17, 2),
        (1, 3),
        (2, 3),
        (3, 3),
        (4, 3),
        (5, 3),
        (6, 3),
        (7, 3),
        (8, 3),
        (9, 3),
        (10, 3),
        (11, 3),
        (12, 3),
        (13, 3),
        (14, 3),
        (15, 3),
        (16, 3),
        (17, 3),
        (1, 2),
        (2, 2),
        (3, 2),
        (4, 2);

insert into public.preferencia (id, nombre, descripcion)
values  (1, 'Viajes de Aventura', 'Prefiere actividades al aire libre y deportes extremos.'),
        (2, 'Gastronomía Local', 'Interés en probar comidas y restaurantes típicos de la región.'),
        (3, 'Relax y Spa', 'Busca hoteles con servicios de relajación y bienestar.'),
        (4, 'Cultura e Historia', 'Interés en museos, sitios históricos y tours guiados.'),
        (5, 'Vida Nocturna', 'Prefiere destinos con mucha actividad después del anochecer.'),
        (6, 'Ecoturismo', 'Interés en la naturaleza, conservación y turismo sostenible.'),
        (7, 'Deportes de Invierno', 'Busca esquí, snowboard y otros deportes de nieve.'),
        (8, 'Playas y Sol', 'Prefiere destinos costeros cálidos y actividades acuáticas.'),
        (9, 'Bajo Presupuesto', 'Busca opciones económicas y alojamientos sencillos.'),
        (10, 'Lujo Exclusivo', 'Prefiere servicios y alojamientos de alta gama.');

insert into public.restaurante (id, direccion)
values  (2, 'Restaurante 1 Plaza Central'),
        (3, 'Restaurante 2 Plaza Central'),
        (4, 'Restaurante 3 Plaza Central'),
        (5, 'Restaurante 4 Plaza Central'),
        (6, 'Restaurante 5 Plaza Central'),
        (7, 'Restaurante 6 Plaza Central'),
        (8, 'Restaurante 7 Plaza Central'),
        (9, 'Restaurante 8 Plaza Central'),
        (10, 'Restaurante 9 Plaza Central'),
        (19, 'Restaurante 8 Plaza Central'),
        (20, 'Restaurante 9 Plaza Central'),
        (21, 'Restaurante 10 Plaza Central'),
        (14, 'Restaurante Rio Chico'),
        (15, 'Restaurante Criollo'),
        (12, 'Restaurante El pulpo'),
        (13, 'Restaurante Texas Beef'),
        (11, 'Restaurante Denaona'),
        (17, 'Restaurante Peruano'),
        (18, 'Restaurante 7 mares'),
        (16, 'Restaurante Asiatico');

insert into public.tipo_comida (id, descripcion)
values  (1, 'Comida que incluye pasta, pizza, risotto y platos del Mediterráneo italiano.'),
        (2, 'Especializada en sushi, sashimi, ramen, y otros platos tradicionales japoneses.'),
        (3, 'Platillos basados en maíz, frijoles y chiles, como tacos, enchiladas y guacamole.'),
        (4, 'Combina elementos y técnicas culinarias de diferentes tradiciones o regiones del mundo.'),
        (5, 'Menús que excluyen la carne, pescado y aves, enfocándose en vegetales, frutas y granos.'),
        (6, 'Especialidad en cortes de carne, asados y parrilladas, típicamente de estilo americano o argentino.'),
        (7, 'Especializada en dulces, tartas, pasteles, helados y café gourmet, perfecta para el cierre de una cena.'),
        (8, 'Alta cocina tradicional basada en técnicas clásicas francesas, salsas complejas y delicadeza.'),
        (9, 'Platillos preparados y servidos rápidamente, como hamburguesas, patatas fritas y sándwiches, para llevar o consumir de forma casual.'),
        (10, 'Combina sabores dulces, picantes, ácidos y salados, utilizando curry, leche de coco y hierbas frescas.');

insert into public.r_tc (fk_restaurante, fk_tipo_comida)
values  (11, 2),
        (12, 8),
        (2, 1),
        (3, 3),
        (4, 4),
        (5, 9),
        (6, 5),
        (7, 7),
        (14, 10),
        (9, 6);

insert into public.tipo_documento (id, nombre, descripcion)
values  (1, 'Pasaporte Diplomatico', 'Para embajadores, altos funcionarios del Estado'),
        (2, 'Pasaporte nacional', 'Documento de identificación y viaje internacional.'),
        (3, 'Pasaporte Europeo', 'Documento que acredita la ciudadanía de uno de los 27 países de la Unión Europea'),
        (4, 'Pasaporte Colectivo', 'para grupos'),
        (5, 'Pasaporte Ejecutivo', 'más páginas, misma vigencia que el ordinario'),
        (6, 'Visa No Inmigrante', ' Para estancias temporales con fines específicos'),
        (7, 'Visa Americana', 'Permiso oficial que te permite solicitar la entrada a Estados Unidos para un propósito específico'),
        (8, 'Visa inmigrante', 'Para quienes buscan vivir permanentemente en el país'),
        (9, 'Visa Estudiante', 'Para estudiar en instituciones académicas o intercambios.'),
        (10, 'Visa de Empleo', 'Para profesionales, trabajadores calificados, inversionistas ');

insert into public.tipo_reclamo (id, descripcion)
values  (1, 'Retraso de Vuelo/Transporte'),
        (2, 'Problemas de Alojamiento (Hotel)'),
        (3, 'Error de Cobro/Facturación'),
        (4, 'Cancelación de Servicio'),
        (5, 'Mala Calidad de Comida'),
        (6, 'Problemas de Documentación'),
        (7, 'Actitud del Personal'),
        (8, 'Discrepancia en el Itinerario'),
        (9, 'Fallo en el Reembolso'),
        (10, 'Problemas con Millas/Puntos');

SELECT *
FROM insertar_proveedor('laser@mail.com', 'pwd123', 'Laser Airlines', ARRAY[5511987654321, 5511234567890], '2005-10-15', 1, 'aereo');

SELECT *
FROM insertar_proveedor('turpial@mail.com', 'safe456', 'Turpial Airlines', ARRAY[34911234567], '1998-03-20', 2, 'aereo');

SELECT *
FROM insertar_proveedor('globalflights@mail.com', 'pass789', 'Global Flights Services', ARRAY[12125550100], '1985-07-01', 3, 'aereo');

SELECT *
FROM insertar_proveedor('aero_solutions@mail.com', 'aero!1', 'Aero Solutions Group', ARRAY[4930123456789], '2010-11-30', 4, 'aereo');

SELECT *
FROM insertar_proveedor('wingspeed@mail.com', 'speedy22', 'WingSpeed Carriers', ARRAY[861098765432], '2001-04-18', 5, 'aereo');

SELECT *
FROM insertar_proveedor('jetstream@mail.com', 'jetpass', 'JetStream Aviation', ARRAY[442071234567], '1995-01-25', 6, 'aereo');

SELECT *
FROM insertar_proveedor('highsky@mail.com', 'hsky33', 'HighSky Air Freight', ARRAY[61298765432], '2015-09-05', 7, 'aereo');

SELECT *
FROM insertar_proveedor('flyfast@mail.com', 'fastfly', 'FlyFast Logistics', ARRAY[911122334455], '2008-06-12', 8, 'aereo');

SELECT *
FROM insertar_proveedor('transporte_aereo@mail.com', 'transaero', 'Transporte Aéreo SAS', ARRAY[57123456789], '1990-12-03', 9, 'aereo');

SELECT *
FROM insertar_proveedor('continental@mail.com', 'contpass', 'Continental Air Movers', ARRAY[525512345678], '1979-02-14', 10, 'aereo');

SELECT *
FROM insertar_proveedor('airxpress@mail.com', 'airxp1', 'AirXpress Worldwide', ARRAY[813512345678], '2003-08-28', 11, 'aereo');

SELECT *
FROM insertar_proveedor('cargoforce@mail.com', 'force!77', 'CargoForce Aviation', ARRAY[331401234567], '2012-05-10', 12, 'aereo');

SELECT *
FROM insertar_proveedor('zenithair@mail.com', 'zenithpwd', 'Zenith Air Services', ARRAY[46812345678], '1999-09-22', 13, 'aereo');

SELECT *
FROM insertar_proveedor('pionner_air@mail.com', 'pioair40', 'Pioneer Air Transport', ARRAY[271234567890], '1988-04-01', 14, 'aereo');

SELECT *
FROM insertar_proveedor('starflight@mail.com', 'starfly55', 'StarFlight Global', ARRAY[482212345678], '2006-01-19', 15, 'aereo');

SELECT *
FROM insertar_proveedor('velocity_cargo@mail.com', 'velo!pass', 'Velocity Cargo Co.', ARRAY[79512345678], '2018-10-07', 16, 'aereo');

SELECT *
FROM insertar_proveedor('eagle_trans@mail.com', 'eagle100', 'Eagle Air Transport', ARRAY[971123456789], '1993-03-08', 17, 'aereo');

SELECT *
FROM insertar_proveedor('cloudlink@mail.com', 'cloud99', 'CloudLink Freight', ARRAY[64912345678], '2000-07-29', 18, 'aereo');

SELECT *
FROM insertar_proveedor('intercontinental@mail.com', 'inter01', 'Intercontinental Air', ARRAY[39061234567], '1982-11-11', 19, 'aereo');

SELECT *
FROM insertar_proveedor('apex_air@mail.com', 'apexpass', 'Apex Air Solutions', ARRAY[43123456789], '2014-02-27', 20, 'aereo');

-- *** 20 Proveedores de Alquiler de Vehículos (Tipo: 'otro') ***

SELECT * FROM insertar_proveedor('rentacar1@mail.com', 'pwd21', 'WheelsOnDemand', ARRAY[11234567890], '2005-01-15', 21, 'otro');
SELECT * FROM insertar_proveedor('fastdrive@mail.com', 'pwd22', 'FastDrive Rentals', ARRAY[21345678901], '1998-05-20', 22, 'otro');
SELECT * FROM insertar_proveedor('globalcars@mail.com', 'pwd23', 'Global Car Hire', ARRAY[31456789012], '1985-07-01', 23, 'otro');
SELECT * FROM insertar_proveedor('roadtrip@mail.com', 'pwd24', 'RoadTrip Vehicles', ARRAY[41567890123], '2010-11-30', 24, 'otro');
SELECT * FROM insertar_proveedor('libertyrent@mail.com', 'pwd25', 'Liberty Fleet Rentals', ARRAY[51678901234], '2001-04-18', 25, 'otro');
SELECT * FROM insertar_proveedor('motorways@mail.com', 'pwd26', 'Motorways Car Co.', ARRAY[61789012345], '1995-01-25', 26, 'otro');
SELECT * FROM insertar_proveedor('easydrive@mail.com', 'pwd27', 'Easy Drive Leasing', ARRAY[71890123456], '2015-09-05', 27, 'otro');
SELECT * FROM insertar_proveedor('premiumwheels@mail.com', 'pwd28', 'Premium Wheels', ARRAY[81901234567], '2008-06-12', 28, 'otro');
SELECT * FROM insertar_proveedor('carxpress@mail.com', 'pwd29', 'CarXpress Rentals', ARRAY[91012345678], '1990-12-03', 29, 'otro');
SELECT * FROM insertar_proveedor('cityrentals@mail.com', 'pwd30', 'City Rentals Pro', ARRAY[10123456789], '1979-02-14', 30, 'otro');
SELECT * FROM insertar_proveedor('autoglobal@mail.com', 'pwd31', 'AutoGlobal Rent', ARRAY[11234567891], '2003-08-28', 31, 'otro');
SELECT * FROM insertar_proveedor('travelcars@mail.com', 'pwd32', 'Travel Cars & Vans', ARRAY[12345678912], '2012-05-10', 32, 'otro');
SELECT * FROM insertar_proveedor('bestchoice@mail.com', 'pwd33', 'Best Choice Car Hire', ARRAY[13456789123], '1999-09-22', 33, 'otro');
SELECT * FROM insertar_proveedor('transport_rent@mail.com', 'pwd34', 'Transport Rental Co', ARRAY[14567891234], '1988-04-01', 34, 'otro');
SELECT * FROM insertar_proveedor('coastcars@mail.com', 'pwd35', 'Coastline Cars', ARRAY[15678912345], '2006-01-19', 35, 'otro');
SELECT * FROM insertar_proveedor('fleetmax@mail.com', 'pwd36', 'FleetMax Vehicle Hire', ARRAY[16789123456], '2018-10-07', 36, 'otro');
SELECT * FROM insertar_proveedor('driveeasy@mail.com', 'pwd37', 'DriveEasy Leasing', ARRAY[17891234567], '1993-03-08', 37, 'otro');
SELECT * FROM insertar_proveedor('mobilitypro@mail.com', 'pwd38', 'Mobility Providers', ARRAY[18912345678], '2000-07-29', 38, 'otro');
SELECT * FROM insertar_proveedor('lux_rentals@mail.com', 'pwd39', 'Luxury Car Services', ARRAY[19123456789], '1982-11-11', 39, 'otro');
SELECT * FROM insertar_proveedor('rent2go@mail.com', 'pwd40', 'Rent2Go Vehicles', ARRAY[20123456789], '2014-02-27', 40, 'otro');

-- *** 20 Proveedores de Hoteles (Tipo: 'otro') ***

SELECT * FROM insertar_proveedor('grandplaza@mail.com', 'pwd41', 'Grand Plaza Hotels', ARRAY[21234567890], '2000-03-01', 41, 'otro');
SELECT * FROM insertar_proveedor('starresort@mail.com', 'pwd42', 'Star Resorts Group', ARRAY[22345678901], '1995-10-10', 42, 'otro');
SELECT * FROM insertar_proveedor('citysuites@mail.com', 'pwd43', 'City Suites Inn', ARRAY[23456789012], '1988-11-25', 43, 'otro');
SELECT * FROM insertar_proveedor('oceanview@mail.com', 'pwd44', 'Ocean View Luxury', ARRAY[24567890123], '2012-06-18', 44, 'otro');
SELECT * FROM insertar_proveedor('mountainlodge@mail.com', 'pwd45', 'Mountain Lodge Co.', ARRAY[25678901234], '2003-02-05', 45, 'otro');
SELECT * FROM insertar_proveedor('hotelboutique@mail.com', 'pwd46', 'Boutique Stays', ARRAY[26789012345], '2007-04-12', 46, 'otro');
SELECT * FROM insertar_proveedor('royalpalace@mail.com', 'pwd47', 'Royal Palace Inn', ARRAY[27890123456], '1975-08-30', 47, 'otro');
SELECT * FROM insertar_proveedor('comfortinn@mail.com', 'pwd48', 'Comfort Inns Int.', ARRAY[28901234567], '1992-09-01', 48, 'otro');
SELECT * FROM insertar_proveedor('lakeside@mail.com', 'pwd49', 'Lakeside Retreat', ARRAY[29012345678], '2014-01-21', 49, 'otro');
SELECT * FROM insertar_proveedor('executive@mail.com', 'pwd50', 'Executive Stays', ARRAY[30123456789], '1980-12-15', 50, 'otro');
SELECT * FROM insertar_proveedor('welcomestay@mail.com', 'pwd51', 'Welcome Stay Hotels', ARRAY[31234567891], '2016-05-17', 51, 'otro');
SELECT * FROM insertar_proveedor('zen_resorts@mail.com', 'pwd52', 'Zen Resorts', ARRAY[32345678912], '1997-03-29', 52, 'otro');
SELECT * FROM insertar_proveedor('riverbank@mail.com', 'pwd53', 'Riverbank Lodges', ARRAY[33456789123], '2009-11-04', 53, 'otro');
SELECT * FROM insertar_proveedor('traveler_hostel@mail.com', 'pwd54', 'Traveler Hostel', ARRAY[34567891234], '2019-07-07', 54, 'otro');
SELECT * FROM insertar_proveedor('heritage_hotel@mail.com', 'pwd55', 'Heritage Hotel', ARRAY[35678912345], '1965-04-02', 55, 'otro');
SELECT * FROM insertar_proveedor('sunnydays@mail.com', 'pwd56', 'Sunny Days Resorts', ARRAY[36789123456], '1994-10-23', 56, 'otro');
SELECT * FROM insertar_proveedor('theloft@mail.com', 'pwd57', 'The Loft Accommodations', ARRAY[37891234567], '2011-08-16', 57, 'otro');
SELECT * FROM insertar_proveedor('sunsetplaza@mail.com', 'pwd58', 'Sunset Plaza Inn', ARRAY[38912345678], '2004-12-09', 58, 'otro');
SELECT * FROM insertar_proveedor('central_park@mail.com', 'pwd59', 'Central Park Residence', ARRAY[39123456789], '1983-06-26', 59, 'otro');
SELECT * FROM insertar_proveedor('goldenkeys@mail.com', 'pwd60', 'Golden Keys Hotels', ARRAY[40123456789], '2017-09-14', 60, 'otro');

-- *** 10 Proveedores de Parques (Tipo: 'otro') ***

SELECT * FROM insertar_proveedor('adventure_land@mail.com', 'pwd61', 'Adventure Land Park', ARRAY[41234567890], '1999-07-10', 61, 'otro');
SELECT * FROM insertar_proveedor('wild_nature@mail.com', 'pwd62', 'Wild Nature Reserve', ARRAY[42345678901], '1980-05-01', 62, 'otro');
SELECT * FROM insertar_proveedor('waterworld@mail.com', 'pwd63', 'WaterWorld Fun Park', ARRAY[43456789012], '2005-08-15', 63, 'otro');
SELECT * FROM insertar_proveedor('eco_tours@mail.com', 'pwd64', 'Eco Green Park', ARRAY[44567890123], '2011-02-28', 64, 'otro');
SELECT * FROM insertar_proveedor('fantasy_park@mail.com', 'pwd65', 'Fantasy Dream Park', ARRAY[45678901234], '1992-04-03', 65, 'otro');
SELECT * FROM insertar_proveedor('mountain_trails@mail.com', 'pwd66', 'Mountain Trails Park', ARRAY[46789012345], '2000-11-20', 66, 'otro');
SELECT * FROM insertar_proveedor('citygarden@mail.com', 'pwd67', 'City Botanical Garden', ARRAY[47890123456], '1970-01-20', 67, 'otro');
SELECT * FROM insertar_proveedor('sci_park@mail.com', 'pwd68', 'Science Discovery Center', ARRAY[48901234567], '2007-09-08', 68, 'otro');
SELECT * FROM insertar_proveedor('pettingzoo@mail.com', 'pwd69', 'Happy Petting Zoo', ARRAY[49012345678], '1996-03-17', 69, 'otro');
SELECT * FROM insertar_proveedor('historic_village@mail.com', 'pwd70', 'Historic Village Park', ARRAY[50123456789], '1985-12-05', 70, 'otro');

-- *** 20 Proveedores de Servicios Turísticos (Tours) (Tipo: 'otro') ***

SELECT * FROM insertar_proveedor('tour_adventures@mail.com', 'pwd71', 'Tour Adventures Co.', ARRAY[51234567890], '2006-05-15', 71, 'otro');
SELECT * FROM insertar_proveedor('local_guides@mail.com', 'pwd72', 'Local Guides Experts', ARRAY[52345678901], '1998-09-01', 72, 'otro');
SELECT * FROM insertar_proveedor('walking_tours@mail.com', 'pwd73', 'Historical Walking Tours', ARRAY[53456789012], '1989-02-14', 73, 'otro');
SELECT * FROM insertar_proveedor('city_sightseeing@mail.com', 'pwd74', 'City Sightseeing Bus', ARRAY[54567890123], '2013-04-20', 74, 'otro');
SELECT * FROM insertar_proveedor('culinary_tours@mail.com', 'pwd75', 'Culinary Tour Experiences', ARRAY[55678901234], '2004-10-05', 75, 'otro');
SELECT * FROM insertar_proveedor('extreme_sports@mail.com', 'pwd76', 'Extreme Sports Tours', ARRAY[56789012345], '1997-11-18', 76, 'otro');
SELECT * FROM insertar_proveedor('daytrips@mail.com', 'pwd77', 'Best Day Trips', ARRAY[57890123456], '2010-01-22', 77, 'otro');
SELECT * FROM insertar_proveedor('private_travel@mail.com', 'pwd78', 'Private Travel Services', ARRAY[58901234567], '2002-03-03', 78, 'otro');
SELECT * FROM insertar_proveedor('culture_trips@mail.com', 'pwd79', 'Culture & History Trips', ARRAY[59012345678], '1985-06-19', 79, 'otro');
SELECT * FROM insertar_proveedor('bus_tours@mail.com', 'pwd80', 'Grand Bus Excursions', ARRAY[60123456789], '2015-12-12', 80, 'otro');
SELECT * FROM insertar_proveedor('discover_tours@mail.com', 'pwd81', 'Discover Tours Int.', ARRAY[61234567891], '2008-07-25', 81, 'otro');
SELECT * FROM insertar_proveedor('jungle_exp@mail.com', 'pwd82', 'Jungle Expeditions', ARRAY[62345678912], '1994-08-10', 82, 'otro');
SELECT * FROM insertar_proveedor('wine_tours@mail.com', 'pwd83', 'Regional Wine Tours', ARRAY[63456789123], '2017-01-30', 83, 'otro');
SELECT * FROM insertar_proveedor('museum_guides@mail.com', 'pwd84', 'Museum Guided Visits', ARRAY[64567891234], '1990-12-24', 84, 'otro');
SELECT * FROM insertar_proveedor('sailing_exp@mail.com', 'pwd85', 'Sailing Tour Experiences', ARRAY[65678912345], '2000-04-05', 85, 'otro');
SELECT * FROM insertar_proveedor('photography_tours@mail.com', 'pwd86', 'Photo Tour Guides', ARRAY[66789123456], '2019-03-16', 86, 'otro');
SELECT * FROM insertar_proveedor('mountain_hikes@mail.com', 'pwd87', 'Mountain Hiking Trips', ARRAY[67891234567], '1993-05-09', 87, 'otro');
SELECT * FROM insertar_proveedor('street_food@mail.com', 'pwd88', 'Street Food Tours', ARRAY[68912345678], '2016-11-28', 88, 'otro');
SELECT * FROM insertar_proveedor('island_hopping@mail.com', 'pwd89', 'Island Hopping Tours', ARRAY[69123456789], '1981-09-01', 89, 'otro');
SELECT * FROM insertar_proveedor('custom_travel@mail.com', 'pwd90', 'Custom Travel Planners', ARRAY[70123456789], '2018-02-13', 90, 'otro');

-- *** 5 Proveedores de Cruceros (Tipo: 'maritimo') ***

SELECT *
FROM insertar_proveedor('oceandream@mail.com', 'oceanpwd1', 'Ocean Dream Cruises', ARRAY[71234567890], '1995-03-10', 91, 'maritimo');

SELECT *
FROM insertar_proveedor('seascapetours@mail.com', 'seascap2', 'SeaScape Marine Tours', ARRAY[81345678901], '2005-08-25', 92, 'maritimo');

SELECT *
FROM insertar_proveedor('globalvoyages@mail.com', 'globalv3', 'Global Voyages Lines', ARRAY[91456789012], '1988-11-05', 93, 'maritimo');

SELECT *
FROM insertar_proveedor('bluehorizont@mail.com', 'blueh4', 'Blue Horizon Cruises', ARRAY[72567890123], '2010-06-18', 94, 'maritimo');

SELECT *
FROM insertar_proveedor('mariner@mail.com', 'mari5', 'Mariner Cruise Ship Co.', ARRAY[82678901234], '1999-01-20', 95, 'maritimo');

-- Servicio para Proveedor Aéreo 1: Laser Airlines (id_proveedor=1, id_lugar=1)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Caracas - Porlamar',
    'Vuelo comercial desde Caracas a Porlamar, ideal para vacaciones.',
    150,
    20,
    'USD',
    50, 
    26,
    1,
    'Boeing 737',
    150,
    'Aeropuerto Internacional de Maiquetía Simón Bolívar',
    34,
    ARRAY['link_img_1a', 'link_img_1b']
);

-- Servicio para Proveedor Aéreo 2: Turpial Airlines (id_proveedor=2, id_lugar=2)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Valencia - Maracaibo',
    'Vuelo comercial desde Valencia a Maracaibo.',
    120,
    15,
    'USD',
    40,
    33,
    2, 
    'Boeing 737',
    140,
    'Aeropuerto Internacional Arturo Michelena',
    17,
    ARRAY['link_img_2a']
);

-- Servicio para Proveedor Aéreo 3: Global Flights Services (id_proveedor=3, id_lugar=3)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Caracas - Madrid',
    'Vuelo internacional desde Caracas a Madrid.',
    800,
    100,
    'EUR',
    300,
    36,
    3, 
    'Airbus A330',
    250,
    'Aeropuerto Internacional de Maiquetía Simón Bolívar',
    34,
    ARRAY['link_img_3a', 'link_img_3b']
);

-- Servicio para Proveedor Aéreo 4: Aero Solutions Group (id_proveedor=4, id_lugar=4)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Bogotá - Medellín',
    'Vuelo nacional en Colombia desde Bogotá a Medellín.',
    80, 
    10,
    'USD',
    30,
    46,
    4, 
    'ATR 72',
    70,
    'Aeropuerto Internacional El Dorado',
    47,
    ARRAY['link_img_4a']
);

-- Servicio para Proveedor Aéreo 5: WingSpeed Carriers (id_proveedor=5, id_lugar=5)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Chárter',
    'Alquiler de una aeronave para un grupo privado',
    1850,
    200,
    'EUR',
    50,
    5,
    5,
    'ATR 72',
    25,
    'Terminal 2 Carga',
    105,
    ARRAY['link_img_5a', 'link_img_5b']
);

-- Servicio para Proveedor Aéreo 6: JetStream Aviation (id_proveedor=6, id_lugar=6)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Fotografía Aérea Turística',
    'Sesión de fotos o video desde una avioneta o helicóptero para capturar paisajes',
    5500,
    750,
    'VEN',
    180,
    6,
    6,
    'Bombardier CRJ-700',
    15,
    'Health Cargo Dock',
    106,
    ARRAY['link_img_6a']
);

-- Servicio para Proveedor Aéreo 7: HighSky Air Freight (id_proveedor=7, id_lugar=7)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Acrobático Recreativo',
    'Experiencia emocionante donde un piloto experto realiza maniobras y acrobacias con el turista a bordo.',
    3950,
    550,
    'VEN',
    120,
    7,
    7,
    'Embraer 190F',
    40,
    'Terminal A Domestic',
    107,
    ARRAY['link_img_7a', 'link_img_7b']
);

-- Servicio para Proveedor Aéreo 8: FlyFast Logistics (id_proveedor=8, id_lugar=8)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Observación de Vida Silvestre Aérea',
    'Sobrevuelo a distancia respetuosa de reservas naturales para observar migraciones o manadas de animales',
    2500,
    350,
    'VEN',
    90,
    8,
    8,
    'Boeing 767-300F',
    55,
    'Terminal Cargo Norte',
    108,
    ARRAY['link_img_8a']
);

-- Servicio para Proveedor Aéreo 9: Transporte Aéreo SAS (id_proveedor=9, id_lugar=9)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Transporte a Pistas de Esquí (Heliskiing)',
    'Uso de helicópteros para acceder a pistas de esquí vírgenes y remotas en alta montaña.',
    1900,
    280,
    'VEN',
    70,
    9,
    9,
    'CASA C-295',
    30,
    'Terminal Nacional Carga',
    109,
    ARRAY['link_img_9a', 'link_img_9b']
);

-- Servicio para Proveedor Aéreo 10: Continental Air Movers (id_proveedor=10, id_lugar=10)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Excursión a Islas Remotas',
    'Transporte aéreo a archipiélagos o islas de difícil acceso para buceo, exploración o estancias exclusivas.',
    4900,
    650,
    'MXN',
    140,
    10,
    10,
    'McDonnell Douglas MD-11F',
    45,
    'Terminal Cargo 1',
    110,
    ARRAY['link_img_10a']
);

-- Servicio para Proveedor Aéreo 11: AirXpress Worldwide (id_proveedor=11, id_lugar=11)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo en Biplano Clásico',
    'Paseo nostálgico en una avioneta de época, a menudo con cabina abierta, para una experiencia de vuelo vintage.',
    6500,
    900,
    'JPY',
    220,
    11,
    11,
    'Boeing 747-8F',
    20,
    'International Cargo Hub',
    111,
    ARRAY['link_img_11a', 'link_img_11b']
);

-- Servicio para Proveedor Aéreo 12: CargoForce Aviation (id_proveedor=12, id_lugar=12)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Tour de Volcanes Activos',
    'Sobrevuelo de cráteres y flujos de lava de volcanes activos, realizado a una distancia segura para una vista impresionante.',
    7800,
    1000,
    'EUR',
    250,
    12,
    12,
    'Airbus A300-600F',
    12, 
    'Pharma Cargo Gate',
    112,
    ARRAY['link_img_12a']
);

-- Servicio para Proveedor Aéreo 13: Zenith Air Services (id_proveedor=13, id_lugar=13)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Caracas - Sao Paulo',
    'Vuelo Comercial de Caracas Venezuela - Sao paulo Brasil',
    3100,
    450,
    'VEN',
    110,
    76,
    13,
    'Fokker F27',
    28,
    'Aeropuerto Maiquetia',
    113,
    ARRAY['link_img_13a', 'link_img_13b']
);

-- Servicio para Proveedor Aéreo 14: Pioneer Air Transport (id_proveedor=14, id_lugar=14)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Margarita - Paris',
    'Vuelo Comercial de Margarita Venezuela - Paris Francia',
    4300,
    620,
    'VEN',
    130,
    61,
    14,
    'Douglas DC-8',
    33,
    'Special Handling Bay',
    114,
    ARRAY['link_img_14a']
);

-- Servicio para Proveedor Aéreo 15: StarFlight Global (id_proveedor=15, id_lugar=15)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Caracas - Buenos Aires',
    'Vuelo Comercial de Caracas Venezuela - Buenos Aires Argentina',
    12000,
    1500,
    'VEN',
    300,
    15,
    15,
    'Boeing 747-400',
    5, 
    'Private Cargo Apron',
    115,
    ARRAY['link_img_15a', 'link_img_15b']
);

-- Servicio para Proveedor Aéreo 16: Velocity Cargo Co. (id_proveedor=16, id_lugar=16)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Caracas - Rio de Janeiro',
    'Vuelo Comercial de Caracas Venezuela - Rio de Janeiro Brasil',
    2700,
    380,
    'VEN',
    95,
    16,
    16,
    'Boeing 747-400',
    18,
    'Regional Cargo Site',
    116,
    ARRAY['link_img_16a']
);

-- Servicio para Proveedor Aéreo 17: Eagle Air Transport (id_proveedor=17, id_lugar=17)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Tour de Glaciares en Avioneta',
    'Vuelo Comercial de Caracas Venezuela - New York USA',
    8800,
    1100,
    'VEN',
    280,
    17,
    17,
    'Boeing 747-400',
    8,
    'HAZMAT Loading Zone',
    117,
    ARRAY['link_img_17a', 'link_img_17b']
);

-- Servicio para Proveedor Aéreo 18: CloudLink Freight (id_proveedor=18, id_lugar=18)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Caracas - Tokio',
    'Vuelvo Comercial desde Caracas venezuela - Tokio Japon',
    5200,
    700,
    'VEN',
    160,
    18,
    18,
    'Airbus A310F',
    22,
    'Tech Terminal',
    118,
    ARRAY['link_img_18a']
);

-- Servicio para Proveedor Aéreo 19: Intercontinental Air (id_proveedor=19, id_lugar=19)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Caracas - Puebla',
    'Vuelo Comercial de Caracas Venezuela - Puebla Mexico',
    3600,
    520,
    'EUR',
    135,
    19,
    19,
    'Lockheed L-1011',
    48,
    'Mid-Sized Bay',
    119,
    ARRAY['link_img_19a', 'link_img_19b']
);

-- Servicio para Proveedor Aéreo 20: Apex Air Solutions (id_proveedor=20, id_lugar=20)
SELECT *
FROM insertar_servicio_viaje_aereolinea(
    'Vuelo Caracas - Toronto',
    'Vuelo Comercial de Caracas Venezuela - Toronto Canada',
    6000,
    850,
    'VEN',
    200,
    20,
    20,
    'Gulfstream G650',
    10,
    'Executive Cargo Ramp',
    120,
    ARRAY['link_img_20a']
);

SELECT *
FROM insertar_cliente(
        'luis.silva@email.com',
        'pass123',
        'Luis',
        'Alberto',
        'Silva',
        'Rojas',
        10000001,
        ARRAY[4125550001, 2415550001]::BIGINT[],
        'Sector Central, Municipio Alto Orinoco, Amazonas', -- Municipio 81
        'casado',
        '1985-06-15'::DATE
     );

SELECT *
FROM insertar_cliente(
        'ana.gomez@email.com',
        'pass123',
        'Ana',
        'Carolina',
        'Gomez',
        'Castro',
        10000002,
        ARRAY[4145550002, 2125550002]::BIGINT[],
        'Calle Principal, Municipio Atabapo, Amazonas', -- Municipio 82
        'soltero',
        '1992-03-22'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 3 y 4 (ESTADO 12: Anzoátegui)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'juan.leon@email.com',
        'pass123',
        'Juan',
        'Pablo',
        'Leon',
        'Peña',
        10000003,
        ARRAY[4165550003, 2815550003]::BIGINT[],
        'Avenida Sur, Municipio Anaco, Anzoátegui', -- Municipio 88
        'divorciado',
        '1978-11-05'::DATE
     );

SELECT *
FROM insertar_cliente(
        'sofia.barrios@email.com',
        'pass123',
        'Sofia',
        'Antonieta',
        'Barrios',
        'Flores',
        10000004,
        ARRAY[4245550004, 2835550004]::BIGINT[],
        'Residencias Este, Municipio Aragua, Anzoátegui', -- Municipio 89
        'viudo',
        '1965-09-10'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 5 y 6 (ESTADO 13: Apure)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'carlos.mata@email.com',
        'pass123',
        'Carlos',
        'Eduardo',
        'Mata',
        'Rivas',
        10000005,
        ARRAY[4125550005, 2715550005]::BIGINT[],
        'Urb. Las Palmas, Municipio Achaguas, Apure', -- Municipio 109
        'casado',
        '1988-02-28'::DATE
     );

SELECT *
FROM insertar_cliente(
        'elena.blanco@email.com',
        'pass123',
        'Elena',
        'Victoria',
        'Blanco',
        'Díaz',
        10000006,
        ARRAY[4145550006, 2725550006]::BIGINT[],
        'Caserío Norte, Municipio Biruaca, Apure', -- Municipio 110
        'soltero',
        '1995-07-19'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 7 y 8 (ESTADO 14: Aragua)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'gabriel.herrera@email.com',
        'pass123',
        'Gabriel',
        'Jesús',
        'Herrera',
        'Soto',
        10000007,
        ARRAY[4165550007, 2435550007]::BIGINT[],
        'Calle 5, Municipio Bolívar, Aragua', -- Municipio 116
        'divorciado',
        '1975-04-12'::DATE
     );

SELECT *
FROM insertar_cliente(
        'paula.marquez@email.com',
        'pass123',
        'Paula',
        'Andrea',
        'Marquez',
        'Rodríguez',
        10000008,
        ARRAY[4245550008, 2445550008]::BIGINT[],
        'Bloque 14, Municipio Camatagua, Aragua', -- Municipio 117
        'casado',
        '1982-10-30'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 9 y 10 (ESTADO 15: Barinas)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'ricardo.pinto@email.com',
        'pass123',
        'Ricardo',
        'Andrés',
        'Pinto',
        'Guzman',
        10000009,
        ARRAY[4125550009, 2735550009]::BIGINT[],
        'Hacienda Viejas, Municipio Alberto Arvelo Torrealba, Barinas', -- Municipio 132
        'soltero',
        '1998-01-01'::DATE
     );

SELECT *
FROM insertar_cliente(
        'isabel.salazar@email.com',
        'pass123',
        'Isabel',
        'Alejandra',
        'Salazar',
        'Torres',
        10000010,
        ARRAY[4145550010, 2785550010]::BIGINT[],
        'Zona Industrial, Municipio Antonio José de Sucre, Barinas', -- Municipio 133
        'viudo',
        '1959-08-25'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 11 y 12 (ESTADO 16: Bolívar)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'andres.vargas@email.com',
        'pass123',
        'Andres',
        'Felipe',
        'Vargas',
        'Mendoza',
        10000011,
        ARRAY[4165550011, 2865550011]::BIGINT[],
        'Carrera 10, Municipio Caroní, Bolívar', -- Municipio 143
        'casado',
        '1971-05-18'::DATE
     );

SELECT *
FROM insertar_cliente(
        'maria.rodriguez@email.com',
        'pass123',
        'Maria',
        'Fernanda',
        'Rodríguez',
        'Briceno',
        10000012,
        ARRAY[4245550012, 2875550012]::BIGINT[],
        'Barrio Obrero, Municipio Cedeño, Bolívar', -- Municipio 144
        'soltero',
        '2001-12-03'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 13 y 14 (ESTADO 17: Carabobo)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'jose.perez@email.com',
        'pass123',
        'Jose',
        'Miguel',
        'Pérez',
        'Martinez',
        10000013,
        ARRAY[4125550013, 2455550013]::BIGINT[],
        'El Palmar, Municipio Bejuma, Carabobo', -- Municipio 153
        'divorciado',
        '1968-09-07'::DATE
     );

SELECT *
FROM insertar_cliente(
        'laura.gil@email.com',
        'pass123',
        'Laura',
        'Gisela',
        'Gil',
        'Linares',
        10000014,
        ARRAY[4145550014, 2465550014]::BIGINT[],
        'Parcelamiento, Municipio Carlos Arvelo, Carabobo', -- Municipio 154
        'casado',
        '1989-02-14'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 15 y 16 (ESTADO 18: Cojedes)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'miguel.diaz@email.com',
        'pass123',
        'Miguel',
        'David',
        'Díaz',
        'Campos',
        10000015,
        ARRAY[4165550015, 2585550015]::BIGINT[],
        'Finca San Juan, Municipio Anzoátegui, Cojedes', -- Municipio 167
        'soltero',
        '1993-06-20'::DATE
     );

SELECT *
FROM insertar_cliente(
        'carmen.soto@email.com',
        'pass123',
        'Carmen',
        'Emilia',
        'Soto',
        'Navarro',
        10000016,
        ARRAY[4245550016, 2585550016]::BIGINT[],
        'Via Principal, Municipio Pao de San Juan Bautista, Cojedes', -- Municipio 168
        'viudo',
        '1961-03-04'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 17 y 18 (ESTADO 19: Delta Amacuro)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'diego.flores@email.com',
        'pass123',
        'Diego',
        'Alonso',
        'Flores',
        'Ortega',
        10000017,
        ARRAY[4125550017, 2875550017]::BIGINT[],
        'Muelle del Río, Municipio Antonio Díaz, Delta Amacuro', -- Municipio 174
        'casado',
        '1974-11-29'::DATE
     );

SELECT *
FROM insertar_cliente(
        'patricia.mendez@email.com',
        'pass123',
        'Patricia',
        'Isabella',
        'Méndez',
        'Zambrano',
        10000018,
        ARRAY[4145550018, 2875550018]::BIGINT[],
        'Sector Las Moras, Municipio Casacoima, Delta Amacuro', -- Municipio 175
        'soltero',
        '1990-12-11'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 19 y 20 (ESTADO 20: Falcón)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'fernando.rojas@email.com',
        'pass123',
        'Fernando',
        'Javier',
        'Rojas',
        'Quintero',
        10000019,
        ARRAY[4165550019, 2685550019]::BIGINT[],
        'Casa de Arena, Municipio Acosta, Falcón', -- Municipio 178
        'divorciado',
        '1963-08-03'::DATE
     );

SELECT *
FROM insertar_cliente(
        'andrea.lopez@email.com',
        'pass123',
        'Andrea',
        'Josefina',
        'López',
        'Guerrero',
        10000020,
        ARRAY[4245550020, 2685550020]::BIGINT[],
        'El Cardón, Municipio Bolívar, Falcón', -- Municipio 179
        'casado',
        '1980-05-24'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 21 y 22 (ESTADO 21: Guárico)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'pablo.marcano@email.com',
        'pass123',
        'Pablo',
        'Rafael',
        'Marcano',
        'Bastidas',
        10000021,
        ARRAY[4125550021, 2465550021]::BIGINT[],
        'Calle Larga, Municipio Camaguán, Guárico', -- Municipio 204
        'soltero',
        '1996-04-16'::DATE
     );

SELECT *
FROM insertar_cliente(
        'valeria.escalona@email.com',
        'pass123',
        'Valeria',
        'Beatriz',
        'Escalona',
        'Rincón',
        10000022,
        ARRAY[4145550022, 2465550022]::BIGINT[],
        'Granja La Fe, Municipio Chaguaramas, Guárico', -- Municipio 205
        'viudo',
        '1970-01-09'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 23 y 24 (ESTADO 22: Lara)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'pedro.guerra@email.com',
        'pass123',
        'Pedro',
        'Alfonso',
        'Guerra',
        'Nieves',
        10000023,
        ARRAY[4165550023, 2515550023]::BIGINT[],
        'Edificio Central, Municipio Andrés Eloy Blanco, Lara', -- Municipio 218
        'casado',
        '1984-11-21'::DATE
     );

SELECT *
FROM insertar_cliente(
        'claudia.briceno@email.com',
        'pass123',
        'Claudia',
        'Gabriela',
        'Briceño',
        'Bravo',
        10000024,
        ARRAY[4245550024, 2515550024]::BIGINT[],
        'Av. Libertador, Municipio Crespo, Lara', -- Municipio 219
        'divorciado',
        '1977-07-13'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 25 y 26 (ESTADO 23: Mérida)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'manuel.gonzalez@email.com',
        'pass123',
        'Manuel',
        'Alejandro',
        'González',
        'Vivas',
        10000025,
        ARRAY[4125550025, 2745550025]::BIGINT[],
        'Aldea Alta, Municipio Alberto Adriani, Mérida', -- Municipio 227
        'soltero',
        '1999-05-08'::DATE
     );

SELECT *
FROM insertar_cliente(
        'rosa.hernandez@email.com',
        'pass123',
        'Rosa',
        'Elvira',
        'Hernández',
        'Montero',
        10000026,
        ARRAY[4145550026, 2745550026]::BIGINT[],
        'Calle El Sol, Municipio Andrés Bello, Mérida', -- Municipio 228
        'casado',
        '1986-01-27'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 27 y 28 (ESTADO 24: Miranda)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'enrique.jimenez@email.com',
        'pass123',
        'Enrique',
        'Ramón',
        'Jiménez',
        'Urdaneta',
        10000027,
        ARRAY[4165550027, 2125550027]::BIGINT[],
        'Colinas de Carrizal, Municipio Acevedo, Miranda', -- Municipio 250
        'viudo',
        '1967-10-02'::DATE
     );

SELECT *
FROM insertar_cliente(
        'teresa.castillo@email.com',
        'pass123',
        'Teresa',
        'María',
        'Castillo',
        'Páez',
        10000028,
        ARRAY[4245550028, 2125550028]::BIGINT[],
        'Urbanización Los Naranjos, Municipio Andrés Bello, Miranda', -- Municipio 251
        'soltero',
        '1991-03-17'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 29 y 30 (ESTADO 25: Monagas)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'hector.rivas@email.com',
        'pass123',
        'Héctor',
        'José',
        'Rivas',
        'Carrasco',
        10000029,
        ARRAY[4125550029, 2915550029]::BIGINT[],
        'Vía Cedeño, Municipio Acosta, Monagas', -- Municipio 271
        'casado',
        '1983-12-06'::DATE
     );

SELECT *
FROM insertar_cliente(
        'irene.aguilar@email.com',
        'pass123',
        'Irene',
        'Luisa',
        'Aguilar',
        'Contreras',
        10000030,
        ARRAY[4145550030, 2925550030]::BIGINT[],
        'Casas Viejas, Municipio Aguasay, Monagas', -- Municipio 272
        'divorciado',
        '1972-09-29'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 31 y 32 (ESTADO 26: Nueva Esparta)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'ramon.velasquez@email.com',
        'pass123',
        'Ramón',
        'Alfredo',
        'Velásquez',
        'Paredes',
        10000031,
        ARRAY[4165550031, 2955550031]::BIGINT[],
        'Playa El Agua, Municipio Antolín del Campo, Nueva Esparta', -- Municipio 284
        'soltero',
        '1997-04-04'::DATE
     );

SELECT *
FROM insertar_cliente(
        'daniela.rojas@email.com',
        'pass123',
        'Daniela',
        'Sofía',
        'Rojas',
        'Fuentes',
        10000032,
        ARRAY[4245550032, 2955550032]::BIGINT[],
        'Margarita Village, Municipio Arismendi, Nueva Esparta', -- Municipio 285
        'casado',
        '1981-08-19'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 33 y 34 (ESTADO 27: Portuguesa)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'oscar.hernandez@email.com',
        'pass123',
        'Oscar',
        'Javier',
        'Hernández',
        'Cordero',
        10000033,
        ARRAY[4125550033, 2575550033]::BIGINT[],
        'Calle 3, Municipio Aguasay, Portuguesa', -- Municipio 295
        'viudo',
        '1955-06-25'::DATE
     );

SELECT *
FROM insertar_cliente(
        'evelyn.sanchez@email.com',
        'pass123',
        'Evelyn',
        'Carolina',
        'Sánchez',
        'Rangel',
        10000034,
        ARRAY[4145550034, 2575550034]::BIGINT[],
        'Sector La Manga, Municipio Esteller, Portuguesa', -- Municipio 296
        'soltero',
        '1994-11-01'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 35 y 36 (ESTADO 28: Sucre)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'gustavo.figueroa@email.com',
        'pass123',
        'Gustavo',
        'Antonio',
        'Figueroa',
        'Salinas',
        10000035,
        ARRAY[4165550035, 2935550035]::BIGINT[],
        'Pueblo del Mar, Municipio Andrés Eloy Blanco, Sucre', -- Municipio 306
        'casado',
        '1979-03-10'::DATE
     );

SELECT *
FROM insertar_cliente(
        'adriana.morales@email.com',
        'pass123',
        'Adriana',
        'Elena',
        'Morales',
        'Pereira',
        10000036,
        ARRAY[4245550036, 2935550036]::BIGINT[],
        'Barrio El Centro, Municipio Arismendi, Sucre', -- Municipio 307
        'divorciado',
        '1969-07-31'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 37 y 38 (ESTADO 29: Táchira)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'alvaro.castro@email.com',
        'pass123',
        'Álvaro',
        'Jesús',
        'Castro',
        'Vivas',
        10000037,
        ARRAY[4125550037, 2765550037]::BIGINT[],
        'Sector Montaña, Municipio Andrés Bello, Táchira', -- Municipio 319
        'soltero',
        '2000-02-05'::DATE
     );

SELECT *
FROM insertar_cliente(
        'marcela.torres@email.com',
        'pass123',
        'Marcela',
        'Victoria',
        'Torres',
        'Duarte',
        10000038,
        ARRAY[4145550038, 2765550038]::BIGINT[],
        'Edif. Nevado, Municipio Ayacucho, Táchira', -- Municipio 320
        'casado',
        '1987-12-01'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 39 y 40 (ESTADO 30: Trujillo)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'rafael.rodriguez@email.com',
        'pass123',
        'Rafael',
        'Ignacio',
        'Rodríguez',
        'Molina',
        10000039,
        ARRAY[4165550039, 2715550039]::BIGINT[],
        'Hato Ganadero, Municipio Andrés Eloy Blanco, Trujillo', -- Municipio 346
        'divorciado',
        '1966-04-20'::DATE
     );

SELECT *
FROM insertar_cliente(
        'genesis.silva@email.com',
        'pass123',
        'Génesis',
        'Corina',
        'Silva',
        'Alvarado',
        10000040,
        ARRAY[4245550040, 2715550040]::BIGINT[],
        'Las Cumbres, Municipio Boconó, Trujillo', -- Municipio 347
        'soltero',
        '1993-08-14'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 41 y 42 (ESTADO 31: Vargas / La Guaira)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'hector.acosta@email.com',
        'pass123',
        'Hector',
        'Daniel',
        'Acosta',
        'Marrero',
        10000041,
        ARRAY[4125550041, 2125550041]::BIGINT[],
        'Urbanización Las Tunas, Municipio Vargas, La Guaira', -- Municipio 364
        'viudo',
        '1958-09-03'::DATE
     );

SELECT *
FROM insertar_cliente(
        'karina.ramirez@email.com',
        'pass123',
        'Karina',
        'Elizabeth',
        'Ramírez',
        'Páez',
        10000042,
        ARRAY[4145550042, 2125550042]::BIGINT[],
        'Avenida Principal, Municipio Vargas, La Guaira', -- Municipio 364
        'casado',
        '1985-06-28'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 43 y 44 (ESTADO 32: Yaracuy)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'mauricio.sierra@email.com',
        'pass123',
        'Mauricio',
        'David',
        'Sierra',
        'Cedeño',
        10000043,
        ARRAY[4165550043, 2545550043]::BIGINT[],
        'Hacienda Palo Alto, Municipio Arístides Bastidas, Yaracuy', -- Municipio 365
        'soltero',
        '1990-10-18'::DATE
     );

SELECT *
FROM insertar_cliente(
        'yuleisy.castillo@email.com',
        'pass123',
        'Yuleisy',
        'Yajaira',
        'Castillo',
        'García',
        10000044,
        ARRAY[4245550044, 2545550044]::BIGINT[],
        'Sector La Pradera, Municipio Bolívar, Yaracuy', -- Municipio 366
        'divorciado',
        '1976-01-23'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 45 y 46 (ESTADO 33: Zulia)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'guillermo.martinez@email.com',
        'pass123',
        'Guillermo',
        'Antonio',
        'Martínez',
        'Pérez',
        10000045,
        ARRAY[4125550045, 2615550045]::BIGINT[],
        'Isla de Pájaros, Municipio Almirante Padilla, Zulia', -- Municipio 379
        'casado',
        '1988-03-09'::DATE
     );

SELECT *
FROM insertar_cliente(
        'maribel.ruiz@email.com',
        'pass123',
        'Maribel',
        'De Los Ángeles',
        'Ruiz',
        'Chávez',
        10000046,
        ARRAY[4145550046, 2615550046]::BIGINT[],
        'Campo Petrolero, Municipio Baralt, Zulia', -- Municipio 380
        'soltero',
        '1995-12-07'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 47 y 48 (ESTADO 34: Distrito Capital)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'alejandro.leon@email.com',
        'pass123',
        'Alejandro',
        'Jesús',
        'Leon',
        'Méndez',
        10000047,
        ARRAY[4165550047, 2125550047]::BIGINT[],
        'Av. Sucre, Municipio Libertador, Distrito Capital', -- Municipio 400
        'viudo',
        '1964-05-15'::DATE
     );

SELECT *
FROM insertar_cliente(
        'eugenia.silva@email.com',
        'pass123',
        'Eugenia',
        'Beatriz',
        'Silva',
        'Quintero',
        10000048,
        ARRAY[4245550048, 2125550048]::BIGINT[],
        'C.C. El Recreo, Municipio Libertador, Distrito Capital', -- Municipio 400
        'casado',
        '1982-11-20'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 49 y 50 (ESTADO 35: Dependencias Federales)
-- ***************************************************************

SELECT *
FROM insertar_cliente(
        'camilo.ortega@email.com',
        'pass123',
        'Camilo',
        'Andrés',
        'Ortega',
        'Vargas',
        10000049,
        ARRAY[4125550049, 4145550049]::BIGINT[],
        'Isla La Tortuga, Municipio Dependencias Federales', -- Municipio 401
        'soltero',
        '1997-07-07'::DATE
     );

SELECT *
FROM insertar_cliente(
        'adriana.diaz@email.com',
        'pass123',
        'Adriana',
        'Lucía',
        'Díaz',
        'León',
        10000050,
        ARRAY[4165550050, 4265550050]::BIGINT[],
        'Archipiélago Los Roques, Municipio Dependencias Federales', -- Municipio 401
        'divorciado',
        '1973-04-10'::DATE
     );

-- Estructura de la función:
-- insertar_documento_cliente(num_documento integer, id_tipo_documento integer, id_lugar integer, id_cliente integer, i_fecha_emision date, i_fecha_expiracion date)

-- ID_TIPO_DOCUMENTO = 2 (Pasaporte nacional)
-- Validez: 10 años.
-- ID_LUGAR: Estado de residencia del cliente.

-- ***************************************************************
-- ***** CLIENTES 1 y 2 (ESTADO 11: Amazonas)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000001, -- num_documento
        2,         -- id_tipo_documento (Pasaporte Nacional)
        11,        -- id_lugar (Amazonas)
        1,         -- id_cliente
        '2022-01-10'::DATE, -- i_fecha_emision
        '2032-01-10'::DATE  -- i_fecha_expiracion (10 años después)
     );

SELECT *
FROM insertar_documento_cliente(
        200000002,
        2,
        11,        -- id_lugar (Amazonas)
        2,
        '2021-05-25'::DATE,
        '2031-05-25'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 3 y 4 (ESTADO 12: Anzoátegui)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000003,
        2,
        12,        -- id_lugar (Anzoátegui)
        3,
        '2023-08-01'::DATE,
        '2033-08-01'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000004,
        2,
        12,        -- id_lugar (Anzoátegui)
        4,
        '2020-03-15'::DATE,
        '2030-03-15'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 5 y 6 (ESTADO 13: Apure)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000005,
        2,
        13,        -- id_lugar (Apure)
        5,
        '2021-11-11'::DATE,
        '2031-11-11'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000006,
        2,
        13,        -- id_lugar (Apure)
        6,
        '2022-07-30'::DATE,
        '2032-07-30'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 7 y 8 (ESTADO 14: Aragua)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000007,
        2,
        14,        -- id_lugar (Aragua)
        7,
        '2023-01-20'::DATE,
        '2033-01-20'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000008,
        2,
        14,        -- id_lugar (Aragua)
        8,
        '2020-09-09'::DATE,
        '2030-09-09'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 9 y 10 (ESTADO 15: Barinas)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000009,
        2,
        15,        -- id_lugar (Barinas)
        9,
        '2024-02-14'::DATE,
        '2034-02-14'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000010,
        2,
        15,        -- id_lugar (Barinas)
        10,
        '2021-04-18'::DATE,
        '2031-04-18'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 11 y 12 (ESTADO 16: Bolívar)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000011,
        2,
        16,        -- id_lugar (Bolívar)
        11,
        '2023-06-05'::DATE,
        '2033-06-05'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000012,
        2,
        16,        -- id_lugar (Bolívar)
        12,
        '2022-03-21'::DATE,
        '2032-03-21'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 13 y 14 (ESTADO 17: Carabobo)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000013,
        2,
        17,        -- id_lugar (Carabobo)
        13,
        '2020-12-04'::DATE,
        '2030-12-04'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000014,
        2,
        17,        -- id_lugar (Carabobo)
        14,
        '2023-10-17'::DATE,
        '2033-10-17'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 15 y 16 (ESTADO 18: Cojedes)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000015,
        2,
        18,        -- id_lugar (Cojedes)
        15,
        '2021-08-29'::DATE,
        '2031-08-29'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000016,
        2,
        18,        -- id_lugar (Cojedes)
        16,
        '2022-04-02'::DATE,
        '2032-04-02'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 17 y 18 (ESTADO 19: Delta Amacuro)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000017,
        2,
        19,        -- id_lugar (Delta Amacuro)
        17,
        '2023-03-19'::DATE,
        '2033-03-19'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000018,
        2,
        19,        -- id_lugar (Delta Amacuro)
        18,
        '2020-07-27'::DATE,
        '2030-07-27'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 19 y 20 (ESTADO 20: Falcón)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000019,
        2,
        20,        -- id_lugar (Falcón)
        19,
        '2021-12-22'::DATE,
        '2031-12-22'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000020,
        2,
        20,        -- id_lugar (Falcón)
        20,
        '2022-09-06'::DATE,
        '2032-09-06'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 21 y 22 (ESTADO 21: Guárico)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000021,
        2,
        21,        -- id_lugar (Guárico)
        21,
        '2023-05-13'::DATE,
        '2033-05-13'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000022,
        2,
        21,        -- id_lugar (Guárico)
        22,
        '2020-06-01'::DATE,
        '2030-06-01'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 23 y 24 (ESTADO 22: Lara)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000023,
        2,
        22,        -- id_lugar (Lara)
        23,
        '2021-09-28'::DATE,
        '2031-09-28'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000024,
        2,
        22,        -- id_lugar (Lara)
        24,
        '2022-11-19'::DATE,
        '2032-11-19'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 25 y 26 (ESTADO 23: Mérida)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000025,
        2,
        23,        -- id_lugar (Mérida)
        25,
        '2023-02-10'::DATE,
        '2033-02-10'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000026,
        2,
        23,        -- id_lugar (Mérida)
        26,
        '2020-04-24'::DATE,
        '2030-04-24'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 27 y 28 (ESTADO 24: Miranda)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000027,
        2,
        24,        -- id_lugar (Miranda)
        27,
        '2021-07-07'::DATE,
        '2031-07-07'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000028,
        2,
        24,        -- id_lugar (Miranda)
        28,
        '2022-08-16'::DATE,
        '2032-08-16'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 29 y 30 (ESTADO 25: Monagas)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000029,
        2,
        25,        -- id_lugar (Monagas)
        29,
        '2023-09-04'::DATE,
        '2033-09-04'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000030,
        2,
        25,        -- id_lugar (Monagas)
        30,
        '2020-11-25'::DATE,
        '2030-11-25'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 31 y 32 (ESTADO 26: Nueva Esparta)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000031,
        2,
        26,        -- id_lugar (Nueva Esparta)
        31,
        '2021-06-14'::DATE,
        '2031-06-14'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000032,
        2,
        26,        -- id_lugar (Nueva Esparta)
        32,
        '2022-02-08'::DATE,
        '2032-02-08'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 33 y 34 (ESTADO 27: Portuguesa)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000033,
        2,
        27,        -- id_lugar (Portuguesa)
        33,
        '2023-07-21'::DATE,
        '2033-07-21'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000034,
        2,
        27,        -- id_lugar (Portuguesa)
        34,
        '2020-05-18'::DATE,
        '2030-05-18'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 35 y 36 (ESTADO 28: Sucre)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000035,
        2,
        28,        -- id_lugar (Sucre)
        35,
        '2021-10-03'::DATE,
        '2031-10-03'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000036,
        2,
        28,        -- id_lugar (Sucre)
        36,
        '2022-12-28'::DATE,
        '2032-12-28'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 37 y 38 (ESTADO 29: Táchira)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000037,
        2,
        29,        -- id_lugar (Táchira)
        37,
        '2023-01-08'::DATE,
        '2033-01-08'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000038,
        2,
        29,        -- id_lugar (Táchira)
        38,
        '2020-03-30'::DATE,
        '2030-03-30'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 39 y 40 (ESTADO 30: Trujillo)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000039,
        2,
        30,        -- id_lugar (Trujillo)
        39,
        '2021-05-09'::DATE,
        '2031-05-09'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000040,
        2,
        30,        -- id_lugar (Trujillo)
        40,
        '2022-07-05'::DATE,
        '2032-07-05'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 41 y 42 (ESTADO 31: Vargas / La Guaira)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000041,
        2,
        31,        -- id_lugar (Vargas/La Guaira)
        41,
        '2023-08-28'::DATE,
        '2033-08-28'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000042,
        2,
        31,        -- id_lugar (Vargas/La Guaira)
        42,
        '2020-10-12'::DATE,
        '2030-10-12'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 43 y 44 (ESTADO 32: Yaracuy)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000043,
        2,
        32,        -- id_lugar (Yaracuy)
        43,
        '2021-11-20'::DATE,
        '2031-11-20'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000044,
        2,
        32,        -- id_lugar (Yaracuy)
        44,
        '2022-04-14'::DATE,
        '2032-04-14'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 45 y 46 (ESTADO 33: Zulia)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000045,
        2,
        33,        -- id_lugar (Zulia)
        45,
        '2023-06-16'::DATE,
        '2033-06-16'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000046,
        2,
        33,        -- id_lugar (Zulia)
        46,
        '2020-01-28'::DATE,
        '2030-01-28'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 47 y 48 (ESTADO 34: Distrito Capital)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000047,
        2,
        34,        -- id_lugar (Distrito Capital)
        47,
        '2021-03-01'::DATE,
        '2031-03-01'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000048,
        5,         -- id_tipo_documento (Pasaporte Ejecutivo, con más páginas)
        34,        -- id_lugar (Distrito Capital)
        48,
        '2022-05-10'::DATE,
        '2032-05-10'::DATE
     );

-- ***************************************************************
-- ***** CLIENTES 49 y 50 (ESTADO 35: Dependencias Federales)
-- ***************************************************************

SELECT *
FROM insertar_documento_cliente(
        200000049,
        2,
        35,        -- id_lugar (Dependencias Federales)
        49,
        '2023-11-03'::DATE,
        '2033-11-03'::DATE
     );

SELECT *
FROM insertar_documento_cliente(
        200000050,
        2,
        35,        -- id_lugar (Dependencias Federales)
        50,
        '2020-02-17'::DATE,
        '2030-02-17'::DATE
     );

insert into public.tipo_billetera_digital (id_tbd, descripcion_tbd)
values  (1, 'Billetera Móvil (Pago por SMS o App)'),
        (2, 'Billetera de Criptomonedas (Hot Wallet)'),
        (3, 'Billetera de Criptomonedas (Cold Wallet)'),
        (4, 'Billetera de Plataforma E-commerce (PayPal, MercadoPago)'),
        (5, 'Billetera P2P (Persona a Persona)'),
        (6, 'Billetera para Pagos Internacionales'),
        (7, 'Billetera NFC (Contactless)'),
        (8, 'Billetera de Fidelidad/Puntos'),
        (9, 'Billetera INVER'),
        (10, 'Billetera de Banco Digital (Neobancos)');

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 1 (Luis Alberto Silva Rojas)
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_tarjeta(
        1,
        4111222233331001,
        123,
        '2029-12-01'::DATE,
        'LUIS ALBERTO SILVA ROJAS',
        'VISA',
        1
     );

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 2 (Ana Carolina Gomez Castro)
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_tarjeta(
        2, -- i_fk_cliente
        5111222233331002, -- i_numero_tarjeta (Simulado MASTERCARD)
        456, -- i_codigo_seguridad
        '2028-09-01'::DATE, -- i_fecha_vencimiento
        'ANA CAROLINA GOMEZ CASTRO', -- i_titular
        'MASTERCARD', -- i_emisor
        2 -- i_fk_banco (Asumido ID 2 para MASTERCARD)
     );

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 3 (Juan Pablo Leon Peña)
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_tarjeta(
        3, -- i_fk_cliente
        3444555566661003, -- i_numero_tarjeta (Simulado AMEX)
        789, -- i_codigo_seguridad
        '2027-06-01'::DATE, -- i_fecha_vencimiento
        'JUAN PABLO LEON PEÑA', -- i_titular
        'VISA', -- i_emisor
        3 -- i_fk_banco (Asumido ID 3 para AMEX)
     );

-- Estructura de la función:
-- insertar_metodo_pago_deposito(i_fk_cliente, i_numero_referencia, i_numero_cuenta_destino, i_fk_banco)

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 4 (Sofia Antonieta Barrios Flores)
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_deposito(
        4, -- i_fk_cliente
        80000004, -- i_numero_referencia (Simulado)
        1020304050, -- i_numero_cuenta_destino (Simulado)
        4 -- i_fk_banco (Asumido ID 4 para Banco Comercial)
     );

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 5 (Carlos Eduardo Mata Rivas)
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_deposito(
        5, -- i_fk_cliente
        80000005, -- i_numero_referencia (Simulado)
        6070809100, -- i_numero_cuenta_destino (Simulado)
        5 -- i_fk_banco (Asumido ID 5 para Banco Universal)
     );

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 6 (Elena Victoria Blanco Díaz)
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_deposito(
        6, -- i_fk_cliente
        80000006, -- i_numero_referencia (Simulado)
        1112131415, -- i_numero_cuenta_destino (Simulado)
        6 -- i_fk_banco (Asumido ID 6 para Banco de Inversión)
     );

-- Estructura de la función:
-- insertar_metodo_pago_billetera(i_fk_cliente, i_numero_confirmacion, i_fk_tbd, i_fk_banco)

-- Clientes:
-- 7: Gabriel Jesús Herrera Soto
-- 8: Paula Andrea Marquez Rodríguez

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 7 (Gabriel Jesús Herrera Soto)
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_billetera(
        7, -- i_fk_cliente
        90000007, -- i_numero_confirmacion (Simulado)
        1, -- i_fk_tbd (1: Billetera Móvil)
        7 -- i_fk_banco (Asumido ID 7 para el banco/entidad asociada)
     );

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 8 (Paula Andrea Marquez Rodríguez)
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_billetera(
        8, -- i_fk_cliente
        90000008, -- i_numero_confirmacion (Simulado)
        4, -- i_fk_tbd (4: Billetera de Plataforma E-commerce)
        8 -- i_fk_banco (Asumido ID 8 para el banco/entidad asociada)
     );

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 9 (Ricardo Andrés Pinto Guzman) - CHEQUE
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_cheque(
        9, -- i_fk_cliente
        50505050, -- i_codigo_cuenta (Código de cuenta simulado)
        1000009, -- i_numero_cheque (Número de cheque simulado)
        9 -- i_fk_banco (Asumido ID 9 para el banco emisor del cheque)
     );

-- ***************************************************************
-- ***** INSERCIÓN PARA CLIENTE 10 (Isabel Alejandra Salazar Torres) - CRIPTO
-- ***************************************************************

SELECT *
FROM insertar_metodo_pago_cripto(
        10, -- i_fk_cliente
        'Bitcoin', -- i_nombre_criptomoneda
        'bc1qxyzpqrstuvwxyzabcdefghijkl0010' -- i_direccion_billetera (Dirección BTC simulada)
     );

-- Estructura de la función:
-- iniciar_venta(i_id_cliente integer)

-- ***************************************************************
-- ***** INICIO DE VENTAS PARA CLIENTES 1 A 10
-- ***************************************************************

SELECT * FROM iniciar_venta(1); -- Cliente 1: Luis Alberto Silva Rojas
SELECT * FROM iniciar_venta(2); -- Cliente 2: Ana Carolina Gomez Castro
SELECT * FROM iniciar_venta(3); -- Cliente 3: Juan Pablo Leon Peña
SELECT * FROM iniciar_venta(4); -- Cliente 4: Sofia Antonieta Barrios Flores
SELECT * FROM iniciar_venta(5); -- Cliente 5: Carlos Eduardo Mata Rivas
SELECT * FROM iniciar_venta(6); -- Cliente 6: Elena Victoria Blanco Díaz
SELECT * FROM iniciar_venta(7); -- Cliente 7: Gabriel Jesús Herrera Soto
SELECT * FROM iniciar_venta(8); -- Cliente 8: Paula Andrea Marquez Rodríguez
SELECT * FROM iniciar_venta(9); -- Cliente 9: Ricardo Andrés Pinto Guzman
SELECT * FROM iniciar_venta(10); -- Cliente 10: Isabel Alejandra Salazar Torres

-- Estructura de la función:
-- agregar_item_itinerario(i_id_venta integer, i_id_servicio integer, i_fecha_inicio date)

-- ***************************************************************
-- ***** VENTA 1 (CLIENTE 1) - Itinerario del 2024-10-01 al 2024-10-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(1, 1, '2024-10-01'::DATE);
SELECT * FROM agregar_item_itinerario(1, 2, '2024-10-02'::DATE);
SELECT * FROM agregar_item_itinerario(1, 3, '2024-10-03'::DATE);
SELECT * FROM agregar_item_itinerario(1, 4, '2024-10-04'::DATE);
SELECT * FROM agregar_item_itinerario(1, 5, '2024-10-05'::DATE);
SELECT * FROM agregar_item_itinerario(1, 6, '2024-10-06'::DATE);
SELECT * FROM agregar_item_itinerario(1, 7, '2024-10-07'::DATE);
SELECT * FROM agregar_item_itinerario(1, 8, '2024-10-08'::DATE);
SELECT * FROM agregar_item_itinerario(1, 9, '2024-10-09'::DATE);
SELECT * FROM agregar_item_itinerario(1, 10, '2024-10-10'::DATE);

-- ***************************************************************
-- ***** VENTA 2 (CLIENTE 2) - Itinerario del 2024-11-01 al 2024-11-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(2, 11, '2024-11-01'::DATE);
SELECT * FROM agregar_item_itinerario(2, 12, '2024-11-02'::DATE);
SELECT * FROM agregar_item_itinerario(2, 13, '2024-11-03'::DATE);
SELECT * FROM agregar_item_itinerario(2, 14, '2024-11-04'::DATE);
SELECT * FROM agregar_item_itinerario(2, 15, '2024-11-05'::DATE);
SELECT * FROM agregar_item_itinerario(2, 16, '2024-11-06'::DATE);
SELECT * FROM agregar_item_itinerario(2, 17, '2024-11-07'::DATE);
SELECT * FROM agregar_item_itinerario(2, 18, '2024-11-08'::DATE);
SELECT * FROM agregar_item_itinerario(2, 19, '2024-11-09'::DATE);
SELECT * FROM agregar_item_itinerario(2, 20, '2024-11-10'::DATE);

-- ***************************************************************
-- ***** VENTA 3 (CLIENTE 3) - Itinerario del 2024-12-01 al 2024-12-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(3, 1, '2024-12-01'::DATE);
SELECT * FROM agregar_item_itinerario(3, 20, '2024-12-02'::DATE);
SELECT * FROM agregar_item_itinerario(3, 13, '2024-12-03'::DATE);
SELECT * FROM agregar_item_itinerario(3, 4, '2024-12-04'::DATE);
SELECT * FROM agregar_item_itinerario(3, 15, '2024-12-05'::DATE);
SELECT * FROM agregar_item_itinerario(3, 6, '2024-12-06'::DATE);
SELECT * FROM agregar_item_itinerario(3, 7, '2024-12-07'::DATE);
SELECT * FROM agregar_item_itinerario(3, 18, '2024-12-08'::DATE);
SELECT * FROM agregar_item_itinerario(3, 19, '2024-12-09'::DATE);
SELECT * FROM agregar_item_itinerario(3, 10, '2024-12-10'::DATE);

-- ***************************************************************
-- ***** VENTA 4 (CLIENTE 4) - Itinerario del 2025-01-01 al 2025-01-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(4, 10, '2025-01-01'::DATE);
SELECT * FROM agregar_item_itinerario(4, 20, '2025-01-02'::DATE);
SELECT * FROM agregar_item_itinerario(4, 13, '2025-01-03'::DATE);
SELECT * FROM agregar_item_itinerario(4, 14, '2025-01-04'::DATE);
SELECT * FROM agregar_item_itinerario(4, 5, '2025-01-05'::DATE);
SELECT * FROM agregar_item_itinerario(4, 6, '2025-01-06'::DATE);
SELECT * FROM agregar_item_itinerario(4, 17, '2025-01-07'::DATE);
SELECT * FROM agregar_item_itinerario(4, 8, '2025-01-08'::DATE);
SELECT * FROM agregar_item_itinerario(4, 9, '2025-01-09'::DATE);
SELECT * FROM agregar_item_itinerario(4, 11, '2025-01-10'::DATE);

-- ***************************************************************
-- ***** VENTA 5 (CLIENTE 5) - Itinerario del 2025-02-01 al 2025-02-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(5, 1, '2025-02-01'::DATE);
SELECT * FROM agregar_item_itinerario(5, 2, '2025-02-02'::DATE);
SELECT * FROM agregar_item_itinerario(5, 3, '2025-02-03'::DATE);
SELECT * FROM agregar_item_itinerario(5, 14, '2025-02-04'::DATE);
SELECT * FROM agregar_item_itinerario(5, 15, '2025-02-05'::DATE);
SELECT * FROM agregar_item_itinerario(5, 16, '2025-02-06'::DATE);
SELECT * FROM agregar_item_itinerario(5, 17, '2025-02-07'::DATE);
SELECT * FROM agregar_item_itinerario(5, 8, '2025-02-08'::DATE);
SELECT * FROM agregar_item_itinerario(5, 9, '2025-02-09'::DATE);
SELECT * FROM agregar_item_itinerario(5, 10, '2025-02-10'::DATE);

-- ***************************************************************
-- ***** VENTA 6 (CLIENTE 6) - Itinerario del 2025-03-01 al 2025-03-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(6, 11, '2025-03-01'::DATE);
SELECT * FROM agregar_item_itinerario(6, 12, '2025-03-02'::DATE);
SELECT * FROM agregar_item_itinerario(6, 13, '2025-03-03'::DATE);
SELECT * FROM agregar_item_itinerario(6, 4, '2025-03-04'::DATE);
SELECT * FROM agregar_item_itinerario(6, 5, '2025-03-05'::DATE);
SELECT * FROM agregar_item_itinerario(6, 6, '2025-03-06'::DATE);
SELECT * FROM agregar_item_itinerario(6, 7, '2025-03-07'::DATE);
SELECT * FROM agregar_item_itinerario(6, 18, '2025-03-08'::DATE);
SELECT * FROM agregar_item_itinerario(6, 19, '2025-03-09'::DATE);
SELECT * FROM agregar_item_itinerario(6, 1, '2025-03-10'::DATE);

-- ***************************************************************
-- ***** VENTA 7 (CLIENTE 7) - Itinerario del 2025-04-01 al 2025-04-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(7, 10, '2025-04-01'::DATE);
SELECT * FROM agregar_item_itinerario(7, 12, '2025-04-02'::DATE);
SELECT * FROM agregar_item_itinerario(7, 3, '2025-04-03'::DATE);
SELECT * FROM agregar_item_itinerario(7, 4, '2025-04-04'::DATE);
SELECT * FROM agregar_item_itinerario(7, 5, '2025-04-05'::DATE);
SELECT * FROM agregar_item_itinerario(7, 16, '2025-04-06'::DATE);
SELECT * FROM agregar_item_itinerario(7, 7, '2025-04-07'::DATE);
SELECT * FROM agregar_item_itinerario(7, 18, '2025-04-08'::DATE);
SELECT * FROM agregar_item_itinerario(7, 9, '2025-04-09'::DATE);
SELECT * FROM agregar_item_itinerario(7, 10, '2025-04-10'::DATE);

-- ***************************************************************
-- ***** VENTA 8 (CLIENTE 8) - Itinerario del 2025-05-01 al 2025-05-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(8, 11, '2025-05-01'::DATE);
SELECT * FROM agregar_item_itinerario(8, 20, '2025-05-02'::DATE);
SELECT * FROM agregar_item_itinerario(8, 13, '2025-05-03'::DATE);
SELECT * FROM agregar_item_itinerario(8, 4, '2025-05-04'::DATE);
SELECT * FROM agregar_item_itinerario(8, 5, '2025-05-05'::DATE);
SELECT * FROM agregar_item_itinerario(8, 16, '2025-05-06'::DATE);
SELECT * FROM agregar_item_itinerario(8, 17, '2025-05-07'::DATE);
SELECT * FROM agregar_item_itinerario(8, 18, '2025-05-08'::DATE);
SELECT * FROM agregar_item_itinerario(8, 9, '2025-05-09'::DATE);
SELECT * FROM agregar_item_itinerario(8, 1, '2025-05-10'::DATE);

-- ***************************************************************
-- ***** VENTA 9 (CLIENTE 9) - Itinerario del 2025-06-01 al 2025-06-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(9, 1, '2025-06-01'::DATE);
SELECT * FROM agregar_item_itinerario(9, 2, '2025-06-02'::DATE);
SELECT * FROM agregar_item_itinerario(9, 13, '2025-06-03'::DATE);
SELECT * FROM agregar_item_itinerario(9, 4, '2025-06-04'::DATE);
SELECT * FROM agregar_item_itinerario(9, 15, '2025-06-05'::DATE);
SELECT * FROM agregar_item_itinerario(9, 6, '2025-06-06'::DATE);
SELECT * FROM agregar_item_itinerario(9, 7, '2025-06-07'::DATE);
SELECT * FROM agregar_item_itinerario(9, 18, '2025-06-08'::DATE);
SELECT * FROM agregar_item_itinerario(9, 9, '2025-06-09'::DATE);
SELECT * FROM agregar_item_itinerario(9, 20, '2025-06-10'::DATE);

-- ***************************************************************
-- ***** VENTA 10 (CLIENTE 10) - Itinerario del 2025-07-01 al 2025-07-10
-- ***************************************************************
SELECT * FROM agregar_item_itinerario(10, 11, '2025-07-01'::DATE);
SELECT * FROM agregar_item_itinerario(10, 20, '2025-07-02'::DATE);
SELECT * FROM agregar_item_itinerario(10, 13, '2025-07-03'::DATE);
SELECT * FROM agregar_item_itinerario(10, 4, '2025-07-04'::DATE);
SELECT * FROM agregar_item_itinerario(10, 5, '2025-07-05'::DATE);
SELECT * FROM agregar_item_itinerario(10, 16, '2025-07-06'::DATE);
SELECT * FROM agregar_item_itinerario(10, 7, '2025-07-07'::DATE);
SELECT * FROM agregar_item_itinerario(10, 8, '2025-07-08'::DATE);
SELECT * FROM agregar_item_itinerario(10, 19, '2025-07-09'::DATE);
SELECT * FROM agregar_item_itinerario(10, 10, '2025-07-10'::DATE);

SELECT *
FROM insertar_paquete(
        1,
        'Escapada Romántica Cienfueguera',
        'Un viaje pensado para parejas, incluye vuelo, alojamiento de lujo, un paseo guiado por la ciudad y una cena romántica.',
        'Romántico',
        ARRAY['Mínimo 2 personas', 'No aplica en temporada alta']::CHARACTER VARYING[],
        ARRAY[1, 2, 3, 8]::INTEGER[]
     );

-- 2. Paquete de Aventura (Incluye Vuelo, Traslado, Aventura y Seguro Premium)
SELECT *
FROM insertar_paquete(
        2,
        'Aventura Andina Extrema',
        'Perfecto para amantes de la adrenalina. Incluye vuelos, traslados privados, actividad de aventura (ej. paracaidismo) y seguro completo.',
        'Aventura',
        ARRAY['Certificado médico requerido', 'Edad mínima 18 años']::CHARACTER VARYING[],
        ARRAY[1, 4, 7, 10]::INTEGER[]
     );

-- 3. Paquete Lujo Internacional (Vuelo Int., Hotel, Traslado, Cena, Seguro Premium)
SELECT *
FROM insertar_paquete(
        3,
        'Luna de Miel Caribeña VIP',
        'Paquete de lujo con vuelo internacional y todos los servicios premium en un destino de playa exclusivo.',
        'Lujo',
        ARRAY['Requiere pasaporte vigente', 'Tarifa sujeta a disponibilidad aérea']::CHARACTER VARYING[],
        ARRAY[9, 2, 4, 8, 10]::INTEGER[]
     );

-- 4. Paquete Gastronómico (Vuelo, Hotel, Tour de comida)
SELECT *
FROM insertar_paquete(
        4,
        'Ruta del Cacao y Café',
        'Experiencia inmersiva en la cultura y sabores locales. Incluye vuelos, alojamiento y un tour temático gastronómico.',
        'Gastronómico',
        ARRAY['Notificar alergias alimentarias']::CHARACTER VARYING[],
        ARRAY[1, 2, 3]::INTEGER[]
     );

-- 5. Paquete Económico (Vuelo, Hotel, Seguro Básico)
SELECT *
FROM insertar_paquete(
        5,
        'Fin de Semana Low Cost',
        'La opción más económica. Incluye lo esencial: vuelo, hotel estándar y seguro básico.',
        'Económico',
        ARRAY['Equipaje de mano únicamente', 'Hotel 3 estrellas']::CHARACTER VARYING[],
        ARRAY[1, 2, 5]::INTEGER[]
     );

-- 6. Paquete Terrestre (Alquiler, Hotel, Seguro Básico)
SELECT *
FROM insertar_paquete(
        6,
        'Road Trip Llanero',
        'Para explorar por tierra. Incluye alquiler de vehículo 4x4, alojamiento en posadas y seguro de viaje básico.',
        'Terrestre',
        ARRAY['Licencia de conducir vigente', 'Depósito de garantía por el vehículo']::CHARACTER VARYING[],
        ARRAY[6, 2, 5]::INTEGER[]
     );

-- 7. Paquete Cultural (Vuelo, Hotel, Tour, Traslado)
SELECT *
FROM insertar_paquete(
        7,
        'Inmersión Cultural Urbana',
        'Descubre el corazón de una metrópolis. Vuelo, hotel céntrico, tour cultural y traslados cómodos.',
        'Cultural',
        ARRAY['Se recomienda calzado cómodo']::CHARACTER VARYING[],
        ARRAY[1, 2, 3, 4]::INTEGER[]
     );

-- 8. Paquete Ecológico (Vuelo, Hotel, Aventura/Ecológica)
SELECT *
FROM insertar_paquete(
        8,
        'Safari Amazónico Fotográfico',
        'Experiencia de contacto con la naturaleza. Incluye vuelo, alojamiento tipo cabaña y actividades ecológicas/aventura.',
        'Ecológico',
        ARRAY['Vacuna contra la fiebre amarilla', 'No apto para menores de 12 años']::CHARACTER VARYING[],
        ARRAY[1, 2, 7]::INTEGER[]
     );

-- 9. Paquete Ejecutivo (Vuelo, Hotel, Traslado, Seguro Básico)
SELECT *
FROM insertar_paquete(
        9,
        'Negocios Express + Seguro',
        'Enfocado en viajeros de negocios. Rapidez y cobertura. Vuelo, hotel cerca del centro de negocios y traslados ejecutivos.',
        'Ejecutivo',
        ARRAY['Sólo en días laborables']::CHARACTER VARYING[],
        ARRAY[1, 2, 4, 5]::INTEGER[]
     );

-- 10. Paquete Completo (Todos los 10 servicios)
SELECT *
FROM insertar_paquete(
        10,
        'Vuelta al Mundo (Servicios Totales)',
        'El paquete más completo. Incluye una muestra de cada servicio: desde vuelos nacionales e internacionales, hasta cenas y seguros premium.',
        'Global',
        ARRAY['Mínimo 30 días de viaje', 'Requiere planificación anticipada']::CHARACTER VARYING[],
        ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]::INTEGER[]
     );

-- Cliente 1 (Venta 1)
SELECT *
FROM agregar_pasajero(
        1,
        'Luis Alberto',
        'Silva Rojas',
        10000001,
        'Sector Central, Municipio Alto Orinoco, Amazonas',
        '1985-06-15'::DATE,
        'casado'::ESTADO_CIVIL_ENUM -- Se asume la existencia del tipo ENUM
     );

-- Cliente 2 (Venta 2)
SELECT *
FROM agregar_pasajero(
        2,
        'Ana Carolina',
        'Gomez Castro',
        10000002,
        'Calle Principal, Municipio Atabapo, Amazonas',
        '1992-03-22'::DATE,
        'soltero'::ESTADO_CIVIL_ENUM
     );

-- Cliente 3 (Venta 3)
SELECT *
FROM agregar_pasajero(
        3,
        'Juan Pablo',
        'Leon Peña',
        10000003,
        'Avenida Sur, Municipio Anaco, Anzoátegui',
        '1978-11-05'::DATE,
        'divorciado'::ESTADO_CIVIL_ENUM
     );

-- Cliente 4 (Venta 4)
SELECT *
FROM agregar_pasajero(
        4,
        'Sofia Antonieta',
        'Barrios Flores',
        10000004,
        'Residencias Este, Municipio Aragua, Anzoátegui',
        '1965-09-10'::DATE,
        'viudo'::ESTADO_CIVIL_ENUM
     );

-- Cliente 5 (Venta 5)
SELECT *
FROM agregar_pasajero(
        5,
        'Carlos Eduardo',
        'Mata Rivas',
        10000005,
        'Urb. Las Palmas, Municipio Achaguas, Apure',
        '1988-02-28'::DATE,
        'casado'::ESTADO_CIVIL_ENUM
     );

-- Cliente 6 (Venta 6)
SELECT *
FROM agregar_pasajero(
        6,
        'Elena Victoria',
        'Blanco Díaz',
        10000006,
        'Caserío Norte, Municipio Biruaca, Apure',
        '1995-07-19'::DATE,
        'soltero'::ESTADO_CIVIL_ENUM
     );

-- Cliente 7 (Venta 7)
SELECT *
FROM agregar_pasajero(
        7,
        'Gabriel Jesús',
        'Herrera Soto',
        10000007,
        'Calle 5, Municipio Bolívar, Aragua',
        '1975-04-12'::DATE,
        'divorciado'::ESTADO_CIVIL_ENUM
     );

-- Cliente 8 (Venta 8)
SELECT *
FROM agregar_pasajero(
        8,
        'Paula Andrea',
        'Marquez Rodríguez',
        10000008,
        'Bloque 14, Municipio Camatagua, Aragua',
        '1982-10-30'::DATE,
        'casado'::ESTADO_CIVIL_ENUM
     );

-- Cliente 9 (Venta 9)
SELECT *
FROM agregar_pasajero(
        9,
        'Ricardo Andrés',
        'Pinto Guzman',
        10000009,
        'Hacienda Viejas, Municipio Alberto Arvelo Torrealba, Barinas',
        '1998-01-01'::DATE,
        'soltero'::ESTADO_CIVIL_ENUM
     );

-- Cliente 10 (Venta 10)
SELECT *
FROM agregar_pasajero(
        10,
        'Isabel Alejandra',
        'Salazar Torres',
        10000010,
        'Zona Industrial, Municipio Antonio José de Sucre, Barinas',
        '1959-08-25'::DATE,
        'viudo'::ESTADO_CIVIL_ENUM
     );

SELECT *
FROM vender_paquete(
        1, -- i_id_cliente
        1, -- i_id_paquete (Escapada Romántica Cienfueguera)
        ARRAY['2026-01-01', '2026-01-02', '2026-01-03','2026-01-06']::timestamp without time zone[]
     );

-- 2. Cliente 2 compra Paquete 2 (4 Servicios: 1, 4, 7, 10)
SELECT *
FROM vender_paquete(
        2, -- i_id_cliente
        2, -- i_id_paquete (Aventura Andina Extrema)
        ARRAY['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04']::timestamp without time zone[]
     );

-- 3. Cliente 3 compra Paquete 3 (5 Servicios: 9, 2, 4, 8, 10)
SELECT *
FROM vender_paquete(
        3, -- i_id_cliente
        3, -- i_id_paquete (Luna de Miel Caribeña VIP)
        ARRAY['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05']::timestamp without time zone[]
     );

-- 4. Cliente 4 compra Paquete 4 (3 Servicios: 1, 2, 3)
SELECT *
FROM vender_paquete(
        4, -- i_id_cliente
        4, -- i_id_paquete (Ruta del Cacao y Café)
        ARRAY['2026-04-01', '2026-04-02', '2026-04-03']::timestamp without time zone[]
     );

-- 5. Cliente 5 compra Paquete 5 (3 Servicios: 1, 2, 5)
SELECT *
FROM vender_paquete(
        5, -- i_id_cliente
        5, -- i_id_paquete (Fin de Semana Low Cost)
        ARRAY['2026-05-01', '2026-05-02', '2026-05-03']::timestamp without time zone[]
     );

-- 6. Cliente 6 compra Paquete 6 (3 Servicios: 6, 2, 5)
SELECT *
FROM vender_paquete(
        6, -- i_id_cliente
        6, -- i_id_paquete (Road Trip Llanero)
        ARRAY['2026-06-01', '2026-06-02', '2026-06-03']::timestamp without time zone[]
     );

-- 7. Cliente 7 compra Paquete 7 (4 Servicios: 1, 2, 3, 4)
SELECT *
FROM vender_paquete(
        7, -- i_id_cliente
        7, -- i_id_paquete (Inmersión Cultural Urbana)
        ARRAY['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04']::timestamp without time zone[]
     );

-- 8. Cliente 8 compra Paquete 8 (3 Servicios: 1, 2, 7)
SELECT *
FROM vender_paquete(
        8, -- i_id_cliente
        8, -- i_id_paquete (Safari Amazónico Fotográfico)
        ARRAY['2026-08-01', '2026-08-02', '2026-08-03']::timestamp without time zone[]
     );

-- 9. Cliente 9 compra Paquete 9 (4 Servicios: 1, 2, 4, 5)
SELECT *
FROM vender_paquete(
        9, -- i_id_cliente
        9, -- i_id_paquete (Negocios Express + Seguro)
        ARRAY['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04']::timestamp without time zone[]
     );

-- 10. Cliente 10 compra Paquete 10 (10 Servicios: 1 al 10)
SELECT *
FROM vender_paquete(
        10, -- i_id_cliente
        10, -- i_id_paquete (Vuelta al Mundo - Servicios Totales)
        ARRAY['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10']::timestamp without time zone[]
     );

-- Estructura de la función:
-- registrar_pago(i_id_venta, i_monto_pago, i_fk_metodo_pago, i_denominacion)

-- VENTA 1: Pago Completo ($1070)
SELECT *
FROM registrar_pago(1, 40333, 1, 'USD');

-- VENTA 2: Pago Completo ($880)
SELECT *
FROM registrar_pago(2, 6937200, 2, 'VEN');

-- VENTA 3: Pago Completo ($1700)
SELECT *
FROM registrar_pago(3, 1700, 3, 'USD');

-- VENTA 4: Pago Completo ($950)
SELECT *
FROM registrar_pago(4, 950, 4, 'USD');

-- VENTA 5: Pago Completo ($850)
SELECT *
FROM registrar_pago(5, 25778, 5, 'EUR');

-- VENTA 6: Pago Completo ($750)
SELECT *
FROM registrar_pago(6, 9685500, 6, 'VEN');

-- VENTA 7: Pago Completo ($1030)
SELECT *
FROM registrar_pago(7, 32164, 7, 'EUR');

-- VENTA 8: Pago Incompleto ($1000)
SELECT *
FROM registrar_pago(8, 1000, 8, 'USD');

-- VENTA 9: Pago Incompleto ($700)
SELECT *
FROM registrar_pago(9, 700, 9, 'EUR');

-- VENTA 10: Pago Incompleto ($2000)
SELECT *
FROM registrar_pago(10, 2000, 10, 'MXN');

insert into public.alquiler_vehiculo (id, direccion_vehiculo)
values  (1, 'Recogida en Aeropuerto Sede 1'),
        (2, 'Recogida en Aeropuerto Sede 2'),
        (3, 'Recogida en Aeropuerto Sede 3'),
        (4, 'Recogida en Aeropuerto Sede 4'),
        (7, 'Recogida en Aeropuerto Sede 7'),
        (8, 'Recogida en Aeropuerto Sede 8'),
        (9, 'Recogida en Aeropuerto Sede 9'),
        (10, 'Recogida en Aeropuerto Sede 10'),
        (19, 'Europcar'),
        (18, 'Alamo'),
        (20, 'Avis'),
        (5, 'Puerto Barco 1'),
        (6, 'Puerto Barco 2'),
        (17, 'Budget Sede'),
        (16, 'Enterprise Sede'),
        (11, 'Aco Rent a Car Sede'),
        (13, 'Hertz Sede'),
        (15, 'RentAuto Sede'),
        (14, 'Localiza: Rent a Car Sede'),
        (12, 'Arval Sede');

insert into public.auditoria (id, tabla_afectada, fecha_tiempo, descripcion, id_tabla_afectada, fk_usuario)
values  (1, 'cliente', '2025-12-14 02:03:44.360124', 'Creación de Cliente Juan Pérez', 1, 9),
        (2, 'venta', '2025-12-14 02:03:44.499370', 'Creación de Venta ID 1', 1, 1),
        (3, 'servicio', '2025-12-14 02:03:44.633795', 'Actualización de Costo Servicio 3', 3, 7),
        (4, 'rol', '2025-12-14 02:03:44.768961', 'Modificación de Rol 4', 4, 10),
        (5, 'metodo_pago', '2025-12-14 02:03:44.903299', 'Inserción de Tarjeta Cliente 2', 2, 2),
        (6, 'proveedor', '2025-12-14 02:03:45.040353', 'Modificación de Dirección Proveedor 5', 5, 8),
        (7, 'paquete', '2025-12-14 02:03:45.177323', 'Creación de Paquete ID 10', 10, 9),
        (8, 'usuario', '2025-12-14 02:03:45.316272', 'Cambio de Contraseña Usuario 5', 5, 5),
        (9, 'venta', '2025-12-14 02:03:45.451993', 'Estado de Venta 4 a Pagado', 4, 10),
        (10, 'reembolso', '2025-12-14 02:03:45.591017', 'Procesamiento Reembolso Venta 2', 1, 10);

insert into public.plan_cuotas (id_plan_cuotas, tasa_interes, fk_venta)
values  (1, 10, 1),
        (2, 5, 3),
        (3, 8, 5),
        (4, 12, 7),
        (5, 15, 9),
        (6, 10, 2),
        (7, 5, 4),
        (8, 8, 6),
        (9, 12, 8),
        (10, 15, 10);

insert into public.cuota (id_cuota, monto_cuota, fk_plan_cuotas)
values  (1, 750, 1),
        (3, 1500, 2),
        (5, 600, 3),
        (7, 2250, 4),
        (9, 450, 5),
        (2, 1150, 6),
        (6, 675, 8),
        (4, 500, 7),
        (8, 3050, 9),
        (10, 892, 10);

insert into public.cuo_ecuo (fk_cuota, fk_estado, fecha_inicio, fecha_fin)
values  (1, 1, '2026-01-01', '2026-02-01'),
        (1, 2, '2026-02-01', null),
        (2, 1, '2026-02-01', '2026-03-01'),
        (2, 4, '2026-03-01', null),
        (3, 7, '2026-01-15', null),
        (4, 6, '2026-02-15', null),
        (5, 4, '2026-03-05', null),
        (6, 1, '2026-04-01', null),
        (7, 5, '2026-05-10', null),
        (8, 3, '2026-06-01', null);

insert into public.c_pre (fk_cliente, fk_preferencia)
values  (1, 8),
        (2, 2),
        (3, 4),
        (4, 3),
        (5, 9),
        (6, 1),
        (7, 5),
        (8, 6),
        (9, 7),
        (10, 10);

insert into public.descuento (id, porcentaje_descuento, fecha_vencimiento, fk_servicio)
values  (1, 40.00, '2025-12-15', 20),
        (2, 15.00, '2026-03-31', 1),
        (3, 10.00, '2026-01-31', 2),
        (4, 20.00, '2026-06-30', 3),
        (5, 5.00, '2026-02-28', 4),
        (6, 25.00, '2026-04-15', 5),
        (7, 10.00, '2026-03-01', 6),
        (8, 0.00, '2026-12-31', 7),
        (9, 15.00, '2026-05-20', 8),
        (10, 30.00, '2026-07-01', 9),
        (11, 10.00, '2026-01-15', 10);

insert into public.lista_deseo (fk_cliente, fk_lugar, fk_servicio)
values  (1, 10, null),
        (2, null, 1),
        (3, 1, null),
        (4, null, 5),
        (5, 2, null),
        (6, null, 3),
        (7, 3, null),
        (8, null, 9),
        (9, 4, null),
        (10, null, 10);

insert into public.reclamo (id, comentario, fk_cliente, fk_tipo_reclamo, fk_itinerario)
values  (1, 'El vuelo se retrasó 4 horas sin explicación.', 1, 1, 1),
        (2, 'La suite no era la prometida, mucho más pequeña.', 3, 2, 3),
        (3, 'Me cobraron de más por el tour del río.', 7, 3, 9),
        (4, 'La actividad de surf fue cancelada a último momento.', 10, 4, 10),
        (5, 'La comida del restaurante era de mala calidad.', 2, 5, 7),
        (6, 'El boleto aéreo tenía el nombre mal escrito.', 4, 6, 2),
        (7, 'El personal de la agencia fue grosero al teléfono.', 5, 7, 5),
        (8, 'El vehículo alquilado no correspondía con la reserva.', 6, 8, 6),
        (9, 'No se ha procesado mi reembolso por el tour.', 8, 9, 8),
        (10, 'Las millas otorgadas por el vuelo son incorrectas.', 9, 10, 4);

insert into public.rec_est (fecha_inicio, fecha_final, fk_estado, fk_reclamo)
values  ('2025-12-10', '2025-12-11', 8, 1),
        ('2025-12-11', null, 7, 1),
        ('2025-12-12', null, 1, 2),
        ('2025-12-13', null, 8, 3),
        ('2025-12-14', null, 5, 3),
        ('2025-12-15', null, 9, 4),
        ('2025-12-16', null, 7, 5),
        ('2025-12-17', null, 1, 6),
        ('2025-12-18', null, 7, 7),
        ('2025-12-19', null, 9, 8);

insert into public.reembolso (id_reembolso, monto_reembolso, fk_venta)
values  (1, 50, 2),
        (2, 100, 4),
        (3, 20, 6),
        (4, 10, 8),
        (5, 0, 10),
        (6, 50, 1),
        (7, 100, 3),
        (8, 20, 5),
        (9, 10, 7),
        (10, 0, 9);

insert into public.ambiente (nombre)
values  ('Familiar'),
        ('Romántico'),
        ('De negocios'),
        ('Informal'),
        ('Lujoso'),
        ('Llanero'),
        ('Clasico'),
        ('Futurista'),
        ('Infantil'),
        ('Regional');

insert into public.r_a (fk_restaurante, fk_ambiente)
values  (11, 2),
        (12, 5),
        (13, 1),
        (14, 4),
        (15, 3),
        (1, 6),
        (9, 8),
        (5, 7),
        (3, 10),
        (2, 9);

insert into public.resena (calificacion_resena, comentario, fk_itinerario_servicio)
values  (4.5, 'El servicio fue excelente, muy puntuales y amables.', 1),
        (3.0, 'El hotel estaba bien, pero la comida no fue de mi agrado.', 2),
        (5.0, '¡Una experiencia inolvidable! El guía fue fantástico.', 3),
        (2.5, 'El vehículo alquilado tenía problemas mecánicos.', 4),
        (4.8, 'La cena romántica superó nuestras expectativas. Totalmente recomendado.', 5),
        (4.2, 'El vuelo de regreso tuvo un pequeño retraso, pero el personal fue muy atento.', 6),
        (3.5, 'La habitación del hotel era más pequeña de lo esperado, pero estaba limpia.', 7),
        (5.0, 'El tour por la ciudad fue increíble, el guía sabía mucho de historia.', 8),
        (2.0, 'El coche de alquiler no estaba limpio y olía a tabaco.', 9),
        (4.9, 'La comida en el restaurante fue excepcional, una de las mejores que he probado.', 10);

SELECT * from insertar_usuario('admin@test.com','123',3,0,0);