// PATATA CALIENTE — banco de preguntas y comprobación de respuestas.
// Cada lista va de lo más típico a lo más raro: cuanto más al final, más rara es la respuesta (y más puntos da).
// Las respuestas se separan con comas; los sinónimos de una misma respuesta con "/".

const L = {};

L.paises = `España, Francia, Italia, Alemania, Portugal, Estados Unidos/EEUU/EE UU/USA, México/Méjico, Argentina, Brasil, China,
Japón, Reino Unido/Gran Bretaña, Inglaterra, Rusia, Canadá, Colombia, Chile, Perú, Venezuela, Cuba, Marruecos, Grecia, Suiza,
Bélgica, Países Bajos/Holanda, Suecia, Noruega, Australia, India, Egipto, Uruguay, Paraguay, Bolivia, Ecuador, Irlanda,
Dinamarca, Finlandia, Austria, Polonia, Turquía, Corea del Sur/Corea, Corea del Norte, Israel, Ucrania, Escocia, Gales,
Islandia, Croacia, República Dominicana, Puerto Rico, Nueva Zelanda, Sudáfrica, Nigeria, Argelia, Túnez, Senegal, Camerún,
Ghana, Kenia, Etiopía, Costa Rica, Panamá, Honduras, Guatemala, El Salvador, Nicaragua, Filipinas, Tailandia, Vietnam,
Indonesia, Malasia, Singapur, Pakistán, Irán, Irak, Arabia Saudí/Arabia Saudita, Catar/Qatar, Emiratos Árabes Unidos/Emiratos,
Siria, Líbano, Jordania, Afganistán, Hungría, República Checa/Chequia, Eslovaquia, Rumanía/Rumania, Bulgaria, Serbia,
Eslovenia, Bosnia/Bosnia y Herzegovina, Montenegro, Albania, Macedonia del Norte/Macedonia, Kosovo, Lituania, Letonia, Estonia,
Bielorrusia, Moldavia, Georgia, Armenia, Azerbaiyán, Kazajistán, Uzbekistán, Mongolia, Nepal, Bután, Bangladés/Bangladesh,
Sri Lanka, Maldivas, Birmania/Myanmar, Camboya, Laos, Taiwán, Luxemburgo, Malta, Chipre, Andorra, Mónaco, San Marino,
Liechtenstein, Vaticano/Ciudad del Vaticano, Jamaica, Haití, Bahamas, Barbados, Trinidad y Tobago, Granada, Belice, Guyana,
Surinam, Libia, Sudán, Sudán del Sur, Malí, Níger, Chad, Mauritania, Somalia, Yibuti, Eritrea, Uganda, Ruanda, Burundi,
Tanzania, Mozambique, Angola, Zambia, Zimbabue, Botsuana, Namibia, Madagascar, Mauricio, Seychelles, Cabo Verde, Guinea,
Guinea Ecuatorial, Guinea-Bisáu/Guinea Bisau, Gambia, Sierra Leona, Liberia, Costa de Marfil, Burkina Faso, Togo, Benín, Gabón,
Congo, República Democrática del Congo, República Centroafricana, Lesoto, Esuatini/Suazilandia, Comoras, Santo Tomé y Príncipe,
Omán, Yemen, Kuwait, Baréin/Bahréin, Tayikistán, Kirguistán, Turkmenistán, Timor Oriental, Brunéi, Papúa Nueva Guinea, Fiyi,
Samoa, Tonga, Vanuatu, Islas Salomón, Kiribati, Tuvalu, Nauru, Palaos, Micronesia, Islas Marshall, Dominica, Santa Lucía,
San Vicente y las Granadinas, Antigua y Barbuda, San Cristóbal y Nieves, Groenlandia, Palestina`;

L.capitales = `Madrid, París, Roma, Londres, Berlín, Lisboa, Atenas, Ámsterdam, Bruselas, Viena, Dublín, Praga, Varsovia, Moscú,
Estocolmo, Oslo, Copenhague, Helsinki, Berna, Budapest, Kiev/Kyiv, Bucarest, Sofía, Belgrado, Zagreb, Andorra la Vieja,
Mónaco, Luxemburgo, Edimburgo, Liubliana, Sarajevo, Tirana, Bratislava, Vilna/Vilnius, Riga, Tallin, Minsk, Reikiavik,
La Valeta/Valeta, Nicosia, San Marino, Ciudad del Vaticano/Vaticano, Skopie, Podgorica, Pristina, Chisináu/Chisinau, Vaduz,
Cardiff, Belfast, Ankara, Tiflis, Ereván`;

L.frutas = `Manzana, Plátano/Banana, Naranja, Fresa, Pera, Uva, Sandía, Melón, Piña, Kiwi, Mango, Cereza, Melocotón/Durazno,
Limón, Mandarina, Frambuesa, Mora, Arándano, Ciruela, Albaricoque/Damasco, Higo, Granada, Papaya, Coco, Aguacate/Palta, Lima,
Pomelo/Toronja, Nectarina, Maracuyá/Fruta de la pasión, Chirimoya, Caqui/Kaki, Níspero, Guayaba, Lichi, Pitaya/Fruta del dragón,
Grosella, Membrillo, Kumquat, Carambola, Physalis/Fisalis/Uchuva, Tamarindo, Dátil, Paraguayo, Mangostán, Rambután, Durián, Yaca,
Feijoa, Guanábana, Zarzamora, Endrina, Madroño, Acerola, Aceituna/Oliva, Tomate`;

L.verduras = `Lechuga, Tomate, Zanahoria, Patata/Papa, Cebolla, Pimiento, Pepino, Calabacín, Berenjena, Brócoli, Coliflor, Espinaca,
Ajo, Judía verde/Judías verdes/Judía, Guisante, Maíz, Champiñón, Calabaza, Puerro, Apio, Alcachofa, Espárrago, Col/Repollo,
Rábano, Remolacha, Acelga, Boniato/Batata, Nabo, Coles de Bruselas/Col de Bruselas, Berro, Endibia/Endivia, Rúcula, Canónigos,
Escarola, Lombarda, Chirivía, Hinojo, Kale/Col rizada, Pak choi/Bok choy, Haba, Okra/Quimbombó, Cardo, Borraja, Chalota,
Cebolleta, Jengibre, Alcaparra, Guindilla/Chile, Yuca, Colinabo, Ñame, Tirabeque, Brotes de soja/Germinados, Seta, Garbanzo, Lenteja`;

L.mamiferos = `Perro, Gato, León, Tigre, Elefante, Caballo, Vaca, Cerdo, Oveja, Mono, Jirafa, Oso, Lobo, Zorro, Conejo, Ratón, Rata,
Ballena, Delfín, Cebra, Hipopótamo, Rinoceronte, Canguro, Koala, Panda/Oso panda, Camello, Cabra, Burro, Ardilla, Murciélago,
Ciervo, Jabalí, Leopardo, Guepardo, Puma, Jaguar, Gorila, Chimpancé, Orangután, Nutria, Castor, Erizo, Hámster, Cobaya/Conejillo de Indias,
Llama, Alpaca, Bisonte, Búfalo, Alce, Reno, Hiena, Foca, Morsa, León marino, Mapache, Mofeta, Tejón, Comadreja, Hurón, Topo, Lince,
Armadillo, Oso hormiguero, Perezoso, Tapir, Okapi, Suricato, Lémur, Chinchilla, Ornitorrinco, Equidna, Wombat, Marmota, Gamo,
Cabra montés, Rebeco, Ñu, Antílope, Gacela, Impala, Yak, Dromedario, Mangosta, Manatí, Narval, Orca, Cachalote, Beluga, Puercoespín,
Zarigüeya, Coatí, Capibara/Carpincho, Vicuña, Guanaco, Pangolín, Ocelote, Caracal, Serval, Gibón, Mandril, Babuino, Tarsero,
Musaraña, Lirón, Visón, Marta, Glotón, Dingo, Chacal, Coyote, Fénec, Oso polar, Leopardo de las nieves, Jerbo, Ualabí`;

L.marinos = `Tiburón, Ballena, Delfín, Pulpo, Calamar, Medusa, Cangrejo, Estrella de mar, Caballito de mar, Pez payaso, Foca, Orca,
Tortuga marina/Tortuga, Gamba/Camarón, Langosta, Mejillón, Almeja, Ostra, Sepia, Atún, Sardina, Salmón, Merluza, Bacalao,
Boquerón/Anchoa, Raya, Manta raya/Manta, Pez espada, Morena, Erizo de mar, Coral, Esponja, Anémona, Lubina, Dorada, Rape,
Lenguado, Rodaballo, Besugo, Caballa, Jurel, Pez globo, Barracuda, Narval, Cachalote, Beluga, Morsa, León marino, Nutria marina,
Manatí, Dugongo, Percebe, Nécora, Centollo/Centolla, Bogavante, Cigala, Langostino, Vieira, Berberecho, Navaja, Caracola, Anguila,
Angula, Pez luna, Pez martillo/Tiburón martillo, Tiburón ballena, Pez remo, Krill, Plancton, Pingüino, Nautilo, Pez volador,
Pez loro, Pez cirujano, Mero, Congrio, Salmonete, Pez linterna, Pez rata, Arenque, Gallo, Pulpo dumbo, Calamar gigante`;

L.aves = `Águila, Paloma, Gorrión, Loro, Pingüino, Búho, Lechuza, Gallina, Gallo, Pato, Cisne, Flamenco, Avestruz, Halcón, Cuervo,
Golondrina, Gaviota, Pavo, Pavo real, Colibrí, Tucán, Canario, Periquito, Cigüeña, Buitre, Urraca, Pelícano, Petirrojo, Mirlo,
Jilguero, Oca/Ganso, Codorniz, Perdiz, Faisán, Pájaro carpintero/Carpintero, Abubilla, Kiwi, Emú, Cóndor, Garza, Grulla, Albatros,
Cacatúa, Guacamayo, Ruiseñor, Alondra, Vencejo, Estornino, Abejaruco, Martín pescador, Quebrantahuesos, Milano, Cernícalo, Gavilán,
Azor, Ñandú, Frailecillo, Cormorán, Cotorra, Tórtola, Arrendajo, Herrerillo, Carbonero, Lavandera, Somormujo, Avutarda, Ibis,
Espátula, Correcaminos, Kookaburra, Ave del paraíso, Quetzal, Pinzón, Verderón, Gorrión molinero, Chotacabras, Autillo`;

L.insectos = `Mosca, Mosquito, Hormiga, Abeja, Avispa, Mariposa, Cucaracha, Araña, Escarabajo, Mariquita, Saltamontes, Grillo,
Libélula, Polilla, Pulga, Piojo, Chinche, Garrapata, Escorpión/Alacrán, Ciempiés, Milpiés, Gusano, Lombriz, Caracol, Babosa,
Luciérnaga, Termita, Mantis/Mantis religiosa, Cigarra/Chicharra, Abejorro, Tijereta, Cochinilla, Oruga, Avispón, Tábano, Langosta,
Pececillo de plata, Efímera, Zapatero, Ácaro, Carcoma, Gorgojo, Escarabajo pelotero, Ciervo volante, Insecto palo, Tarántula,
Viuda negra, Procesionaria, Mosca tsetsé, Chinche de campo, Pulgón, Mosca de la fruta`;

L.colores = `Rojo, Azul, Verde, Amarillo, Negro, Blanco, Naranja, Rosa, Morado, Gris, Marrón, Violeta, Celeste, Beige, Turquesa,
Granate, Dorado, Plateado, Fucsia, Lila, Burdeos, Cian, Magenta, Ocre, Salmón, Crema, Caqui, Verde lima/Lima, Mostaza, Coral,
Añil/Índigo, Carmesí, Esmeralda, Ámbar, Aguamarina, Marfil, Bermellón, Ceniza, Champán, Chocolate, Terracota, Verde oliva/Oliva,
Azul marino, Azul cielo, Lavanda, Perla, Sepia, Cobre, Bronce, Rubí, Zafiro, Púrpura, Malva, Berenjena, Hueso, Arena, Teja, Cereza,
Frambuesa, Vino, Caoba, Nácar, Visón, Topo, Pistacho, Menta, Verde botella, Azul eléctrico, Rosa palo, Gris perla`;

L.deportes = `Fútbol, Baloncesto, Tenis, Natación, Ciclismo, Atletismo, Voleibol/Vóley, Balonmano, Golf, Boxeo, Pádel, Rugby,
Béisbol, Esquí, Surf, Judo, Kárate, Taekwondo, Gimnasia, Hockey, Fórmula 1/Fórmula uno/F1, Motociclismo, Escalada, Remo,
Piragüismo, Vela, Waterpolo, Esgrima, Tiro con arco, Halterofilia, Triatlón, Maratón, Patinaje, Snowboard, Skate/Skateboard,
Bádminton, Tenis de mesa/Ping pong, Fútbol sala, Polo, Equitación, Lucha libre, Crossfit, Curling, Bobsleigh, Biatlón, Pentatlón,
Decatlón, Lacrosse, Críquet/Cricket, Squash, Frontenis, Pelota vasca, Petanca, Bolos, Billar, Dardos, Ajedrez, Sumo, Kickboxing,
MMA, Parkour, Kitesurf, Windsurf, Buceo, Paracaidismo, Rally, Motocross, Ultimate, Fútbol americano, Softbol, Salto de altura,
Salto de longitud, Salto con pértiga/Pértiga, Korfball, Hurling, Alpinismo, Senderismo, Running, Spinning, Yoga, Pilates, Zumba,
Gimnasia rítmica, Natación sincronizada/Natación artística, Aikido, Capoeira, Jiu jitsu, Muay thai, Bodyboard, Wakeboard, Pesca,
Lanzamiento de jabalina/Jabalina, Lanzamiento de peso, Lanzamiento de disco, Lanzamiento de martillo, Hockey hielo, Pickleball`;

L.instrumentos = `Guitarra, Piano, Batería, Violín, Flauta, Trompeta, Saxofón/Saxo, Bajo, Violonchelo/Chelo, Arpa, Clarinete,
Tambor, Acordeón, Ukelele, Armónica, Xilófono, Trombón, Tuba, Oboe, Fagot, Contrabajo, Viola, Órgano, Teclado, Sintetizador,
Pandereta, Castañuelas, Triángulo, Platillos, Timbal, Bongó/Bongos, Cajón/Cajón flamenco, Maracas, Gaita, Banjo, Mandolina, Laúd,
Bandurria, Sitar, Didgeridoo, Trompa, Corneta, Flauta travesera, Flauta dulce, Flautín/Piccolo, Gong, Marimba, Campanas, Cascabel,
Güiro, Charango, Quena, Zampoña, Balalaica, Theremín, Kalimba, Hang, Tabla, Darbuka, Yembé/Djembe, Txalaparta, Dulzaina, Timple,
Vibráfono, Celesta, Clavecín/Clave, Clavicordio, Guitarra eléctrica, Bombo, Caja, Cencerro, Zambomba, Carraca`;

L.profesiones = `Médico, Profesor, Abogado, Policía, Bombero, Enfermero, Ingeniero, Arquitecto, Cocinero, Camarero, Periodista,
Dentista, Veterinario, Piloto, Carpintero, Fontanero, Electricista, Mecánico, Panadero, Carnicero, Pescadero, Frutero, Peluquero,
Actor, Cantante, Futbolista, Pintor, Escritor, Juez, Farmacéutico, Psicólogo, Fisioterapeuta, Informático/Programador, Contable,
Economista, Banquero, Cajero, Dependiente, Taxista, Camionero/Conductor, Cartero, Soldado/Militar, Astronauta, Científico,
Biólogo, Químico, Físico, Matemático, Historiador, Arqueólogo, Traductor, Intérprete, Fotógrafo, Diseñador, Modelo, Azafato/Azafata,
Jardinero, Agricultor/Granjero, Pastor, Pescador, Minero, Albañil, Cerrajero, Sastre, Costurero/Costurera, Zapatero, Joyero,
Relojero, Barrendero, Basurero, Socorrista, Guardia civil, Detective, Notario, Político, Alcalde, Presidente, Cura/Sacerdote, Monja,
Payaso, Mago, Malabarista, DJ/Pinchadiscos, Youtuber/Influencer, Streamer, Entrenador, Árbitro, Comercial, Recepcionista,
Secretario, Administrativo, Funcionario, Investigador, Maestro, Cirujano, Pediatra, Ginecólogo, Oftalmólogo/Oculista, Óptico,
Podólogo, Logopeda, Nutricionista, Matrona, Celador, Cuidador, Niñera, Limpiador, Portero, Conserje, Vigilante, Guardaespaldas,
Chef, Sumiller, Barman/Coctelero, Repartidor, Mensajero, Estibador, Marinero, Capitán, Torero, Jinete, Domador, Buzo, Herrero,
Soldador, Tornero, Tatuador, Masajista, Esteticista, Maquillador, Estilista, Guionista, Director de cine, Productor, Editor,
Locutor, Presentador, Reportero, Community manager, Analista, Consultor, Auditor, Actuario, Registrador, Procurador, Diplomático,
Embajador, Ministro, Concejal, Senador, Diputado, Espía, Escultor, Bailarín, Músico, Poeta, Carnicero, Charcutero, Pastelero,
Heladero, Quiosquero, Librero, Bibliotecario, Archivero, Farero, Leñador, Apicultor, Viticultor, Enólogo, Geólogo, Astrónomo,
Meteorólogo, Controlador aéreo, Ebanista, Tapicero, Cristalero, Fumigador, Deshollinador, Afilador, Pregonero, Verdugo`;

L.cuerpo = `Mano, Pie, Cabeza, Brazo, Pierna, Ojo, Nariz, Boca, Oreja, Dedo, Rodilla, Codo, Hombro, Cuello, Espalda, Pecho,
Barriga/Tripa/Abdomen, Corazón, Cerebro, Pulmón, Hígado, Riñón, Diente, Lengua, Labio, Ceja, Pestaña, Pelo/Cabello, Uña, Tobillo,
Muñeca, Cadera, Culo/Trasero/Glúteo, Ombligo, Frente, Mejilla/Moflete, Barbilla/Mentón, Piel, Hueso, Músculo, Sangre, Vena,
Arteria, Talón, Planta del pie, Palma, Pulgar, Meñique, Índice, Anular, Estómago, Garganta, Nuca, Sien, Mandíbula, Encía,
Paladar, Amígdalas, Campanilla/Úvula, Laringe, Faringe, Esófago, Intestino, Colon, Apéndice, Vejiga, Páncreas, Bazo, Vesícula,
Tiroides, Columna/Columna vertebral, Vértebra, Costilla, Clavícula, Esternón, Fémur, Tibia, Peroné, Rótula, Cráneo, Pelvis,
Omóplato/Escápula, Axila/Sobaco, Ingle, Pantorrilla/Gemelo, Muslo, Antebrazo, Bíceps, Tríceps, Nudillo, Iris, Pupila, Retina,
Córnea, Tímpano, Lóbulo, Tendón, Ligamento, Menisco, Cartílago, Neurona, Nervio, Diafragma, Próstata, Útero, Ovario, Coxis,
Húmero, Cúbito, Radio, Metacarpo, Falange, Tendón de Aquiles, Hipotálamo, Cerebelo, Médula`;

L.ropa = `Camiseta, Pantalón, Falda, Vestido, Camisa, Chaqueta, Abrigo, Jersey/Suéter, Sudadera, Calcetín, Zapato, Zapatilla,
Bota, Sandalia, Chancla, Braga, Calzoncillo, Sujetador, Gorra, Sombrero, Bufanda, Guante, Cinturón, Corbata, Pijama, Bañador,
Bikini, Vaqueros/Tejanos/Vaquero, Chándal, Leggings/Mallas, Medias, Pantalón corto/Bermudas/Shorts, Chaleco, Americana/Blazer,
Traje, Gabardina, Cazadora, Plumífero/Anorak, Polo, Top, Blusa, Gorro, Boina, Pañuelo, Chubasquero, Mocasín, Tacones, Alpargata,
Deportivas, Chaquetón, Poncho, Kimono, Toga, Delantal, Bata, Albornoz, Peto, Mono, Body, Corsé, Liguero, Tanga, Calentadores,
Orejeras, Pasamontañas, Capa, Sari, Babuchas, Zuecos, Botines, Manoletinas, Crocs, Chilaba, Camisón, Kilt/Falda escocesa,
Pajarita, Tirantes, Fular, Rebeca, Chupa, Parka, Esmoquin, Frac, Mantilla, Peineta, Riñonera, Pantuflas, Mitones`;

L.coches = `Seat, Renault, Toyota, Ford, BMW, Mercedes/Mercedes-Benz, Audi, Volkswagen, Peugeot, Citroën, Opel, Fiat, Ferrari,
Lamborghini, Porsche, Tesla, Nissan, Honda, Hyundai, Kia, Mazda, Dacia, Skoda, Volvo, Jaguar, Land Rover, Jeep, Chevrolet,
Mitsubishi, Suzuki, Subaru, Lexus, Mini, Alfa Romeo, Maserati, Bugatti, Aston Martin, Bentley, Rolls-Royce, McLaren, Lancia,
Smart, Cupra, DS, Chrysler, Dodge, Cadillac, Lincoln, Buick, Tata, BYD, MG, Lynk & Co, Polestar, Genesis, Infiniti, Acura, Saab,
Pagani, Koenigsegg, Lotus, SsangYong, Isuzu, Lada, Trabant, Pontiac, Hummer, Rivian, Lucid, Xpeng, Nio, Geely, Chery, Omoda,
Alpine, Abarth, Hispano Suiza, Santana, Pegaso, Ebro, Daewoo, Rover, Talbot, Simca`;

L.equipos = `Real Madrid/Madrid, Barcelona/Barça/Barca, Atlético de Madrid/Atlético/Atleti, Sevilla, Valencia, Betis/Real Betis,
Athletic/Athletic de Bilbao/Athletic Club, Real Sociedad, Villarreal, Celta/Celta de Vigo, Osasuna, Getafe, Espanyol, Mallorca,
Rayo Vallecano/Rayo, Girona, Las Palmas, Alavés, Cádiz, Granada, Almería, Valladolid/Real Valladolid, Leganés,
Deportivo/Deportivo de La Coruña/Depor, Málaga, Zaragoza/Real Zaragoza, Sporting/Sporting de Gijón, Oviedo/Real Oviedo,
Racing/Racing de Santander, Elche, Eibar, Levante, Tenerife, Huesca, Numancia, Albacete, Burgos, Mirandés, Córdoba,
Recreativo/Recre/Recreativo de Huelva, Xerez, Hércules, Castellón, Cartagena, Ponferradina, Lugo, Alcorcón, Fuenlabrada, Eldense,
Racing de Ferrol/Ferrol, Andorra, Amorebieta, Nàstic/Gimnàstic de Tarragona, Sabadell, Salamanca, Murcia/Real Murcia,
Extremadura, Logroñés, Compostela, Mérida, Badajoz, Sestao, Real Unión, Algeciras, Marbella, Linares, Jaén, Ourense, Pontevedra`;

L.provincias = `Madrid, Barcelona, Valencia, Sevilla, Málaga, Alicante, Murcia, Cádiz, Vizcaya/Bizkaia, La Coruña/A Coruña/Coruña,
Asturias, Baleares/Islas Baleares, Las Palmas, Santa Cruz de Tenerife/Tenerife, Zaragoza, Pontevedra, Granada, Tarragona, Córdoba,
Girona/Gerona, Guipúzcoa/Gipuzkoa, Toledo, Almería, Badajoz, Navarra, Jaén, Cantabria, Castellón, Valladolid, Ciudad Real,
Huelva, León, Lleida/Lérida, Cáceres, Albacete, Burgos, Salamanca, Lugo, La Rioja/Rioja, Ourense/Orense, Guadalajara, Huesca,
Cuenca, Zamora, Palencia, Ávila, Segovia, Teruel, Soria, Álava/Araba, Ceuta, Melilla`;

L.comunidades = `Andalucía, Cataluña, Madrid/Comunidad de Madrid, Comunidad Valenciana/Valencia, Galicia, Castilla y León,
País Vasco/Euskadi, Canarias/Islas Canarias, Castilla-La Mancha/Castilla La Mancha, Murcia/Región de Murcia, Aragón, Extremadura,
Asturias, Baleares/Islas Baleares, Navarra, Cantabria, La Rioja/Rioja, Ceuta, Melilla`;

L.ciudades = `Madrid, Barcelona, Valencia, Sevilla, Zaragoza, Málaga, Murcia, Palma/Palma de Mallorca, Bilbao, Alicante, Córdoba,
Valladolid, Vigo, Gijón, Granada, La Coruña/A Coruña/Coruña, Vitoria, Elche, Oviedo, Santander, Pamplona, San Sebastián/Donostia,
Salamanca, Burgos, León, Cádiz, Almería, Huelva, Jaén, Toledo, Cartagena, Marbella, Benidorm, Ibiza, Santiago de Compostela/Santiago,
Tarragona, Girona, Lleida, Castellón, Logroño, Badajoz, Cáceres, Mérida, Albacete, Ciudad Real, Cuenca, Guadalajara, Segovia,
Ávila, Soria, Zamora, Palencia, Teruel, Huesca, Lugo, Ourense, Pontevedra, Ferrol, Jerez/Jerez de la Frontera, Algeciras, Sabadell,
Terrassa, L'Hospitalet/Hospitalet, Badalona, Móstoles, Alcalá de Henares, Fuenlabrada, Leganés, Getafe, Alcorcón, Torrejón,
Parla, Alcobendas, Las Rozas, Pozuelo, Majadahonda, Aranjuez, Talavera, Reus, Torrevieja, Ronda, Estepona, Fuengirola,
Torremolinos, Nerja, Motril, Linares, Úbeda, Baeza, Lorca, Avilés, Ponferrada, Sitges, Figueres, Mataró, Manresa, Vic, Sagunto,
Gandía, Denia, Jávea, Calpe, Alcoy, Orihuela, Elda, Santa Cruz de Tenerife, Las Palmas de Gran Canaria/Las Palmas, La Laguna,
Ceuta, Melilla, Mahón, Ciudadela, Tudela, Irún, Eibar, Getxo, Barakaldo, Zarautz, Laredo, Castro Urdiales, Torrelavega,
Benicàssim/Benicasim, Peñíscola, Calatayud, Jaca, Astorga, Plasencia, Trujillo, Antequera, Écija, Osuna, Carmona, Lucena`;

L.platos = `Paella, Tortilla/Tortilla de patatas, Gazpacho, Jamón, Croquetas, Salmorejo, Cocido/Cocido madrileño, Fabada,
Pulpo a la gallega/Pulpo a feira, Patatas bravas/Bravas, Churros, Gambas al ajillo, Pisto, Migas, Empanada, Calamares,
Bocadillo de calamares, Pimientos de Padrón, Cochinillo, Lentejas, Albóndigas, Pan con tomate/Pa amb tomàquet, Escalivada,
Crema catalana, Ensaladilla rusa/Ensaladilla, Huevos rotos, Callos, Rabo de toro, Fideuá, Arroz negro, Sobrasada, Ensaimada,
Pescaíto frito, Boquerones en vinagre, Pinchos morunos, Gachas, Sopa de ajo, Marmitako, Bacalao al pil pil, Txangurro, Pintxos,
Cachopo, Papas arrugadas, Mojo picón, Gofio, Lacón con grelos, Caldo gallego, Morcilla, Chorizo, Fuet, Butifarra, Calçots,
Romesco, Alioli/Allioli, Porra antequerana, Ajoblanco, Espinacas con garbanzos, Potaje, Olla podrida, Lechazo/Cordero asado,
Judiones, Botillo, Cecina, Carrillada, Flamenquín, Pipirrana, Tumbet, Cocido maragato, Arroz a banda, Arroz con costra,
Zarangollo, Michirones, Caldereta, Escudella, Suquet, Bienmesabe, Patatas a lo pobre, Revuelto de setas, Torreznos`;

L.bebidas = `Agua, Cerveza, Vino, Coca-Cola/Cocacola/Coca cola, Zumo, Café, Té, Leche, Fanta, Sprite, Tinto de verano, Sangría,
Cava, Champán/Champagne, Whisky, Vodka, Ron, Ginebra/Gin, Tequila, Sidra, Horchata, Batido, Cola Cao/Colacao, Limonada,
Gaseosa, Agua con gas, Red Bull, Monster, Aquarius, Nestea, Kas, Trina, Kombucha, Mojito, Calimocho/Kalimotxo,
Gin tonic/Gintonic, Cubata, Licor de hierbas, Orujo, Pacharán, Anís, Vermut/Vermú, Jerez/Fino, Mosto, Granizado, Smoothie,
Infusión, Manzanilla, Poleo, Tila, Chocolate caliente, Bitter Kas, Clara, Absenta, Sake, Baileys, Jägermeister/Jager,
Licor 43, Brandy/Coñac, Aguardiente, Mezcal, Pisco, Caipiriña/Caipirinha, Margarita, Piña colada, Cosmopolitan, Daiquiri,
Agua de Valencia, Rebujito, Mate/Yerba mate, Chai, Matcha, Kéfir, Bebida de avena/Leche de avena, Bebida de soja/Leche de soja,
Isotónica, Gatorade, Powerade, Tónica/Schweppes, Ginger ale, 7up/Seven up, Pepsi, Dr Pepper, Kalimotxo, Carajillo, Cortado,
Bombón, Leche merengada, Zarzaparrilla, Agua de coco, Hidromiel, Grog, Ponche, Kvas, Ayran, Lassi`;

L.cocina = `Cuchillo, Tenedor, Cuchara, Sartén, Olla, Cazo, Plato, Vaso, Taza, Espátula, Cucharón, Colador, Rallador,
Tabla de cortar/Tabla, Abrelatas, Sacacorchos, Batidora, Licuadora, Tostadora, Microondas, Horno, Nevera/Frigorífico,
Lavavajillas, Cafetera, Exprimidor, Tijeras, Pelador, Rodillo, Mortero, Molde, Bandeja, Fuente, Ensaladera, Jarra, Botella,
Termo, Servilleta, Mantel, Delantal, Manopla/Guante de horno, Trapo/Paño, Estropajo, Vitrocerámica/Vitro, Fogón, Freidora,
Freidora de aire, Thermomix, Olla exprés/Olla a presión, Wok, Paellera, Cacerola, Escurridor, Embudo, Varillas/Batidor, Pinzas,
Cuchillo jamonero, Afilador, Báscula/Peso, Temporizador, Termómetro, Molinillo, Salero, Pimentero, Aceitera, Vinagrera,
Especiero, Hervidor, Yogurtera, Sandwichera, Gofrera, Plancha, Parrilla, Barbacoa, Cuenco/Bol, Táper/Tupper/Tupperware,
Papel de aluminio/Papel albal, Film transparente, Mandolina, Cubitera, Abrebotellas/Abridor, Decantador, Puchero, Cazuela,
Cazuela de barro, Jamonero, Brocheta, Manga pastelera, Tamiz, Cuchillo de pan, Hacha de cocina, Robot de cocina`;

L.muebles = `Mesa, Silla, Sofá, Cama, Armario, Estantería, Escritorio, Mesilla/Mesita de noche, Cómoda, Sillón, Taburete, Banco,
Lámpara, Espejo, Perchero, Librería, Aparador, Vitrina, Zapatero, Butaca, Puf/Puff, Hamaca, Mecedora, Litera, Cuna, Cabecero,
Colchón, Cajonera, Baúl, Tocador, Recibidor, Mueble de la tele/Mueble TV, Biombo, Alfombra, Cortina, Chaise longue, Futón,
Sofá cama, Diván, Reposapiés, Atril, Consola, Rinconera, Galán de noche, Persiana, Estor, Mesa camilla, Aparador, Escabel,
Banqueta, Trona, Mesa de centro, Revistero, Paragüero, Joyero, Secreter, Bargueño, Canapé, Somier, Otomana`;

L.carreras = `Medicina, Derecho, Informática/Ingeniería informática, ADE/Administración y dirección de empresas, Psicología, Enfermería,
Arquitectura, Economía, Periodismo, Magisterio, Biología, Química, Física, Matemáticas, Historia, Filología, Filosofía,
Bellas Artes, Farmacia, Odontología, Veterinaria, Fisioterapia, Ingeniería industrial, Ingeniería civil/Caminos,
Ingeniería aeroespacial/Aeronáutica, Ingeniería mecánica, Telecomunicaciones/Teleco, Biotecnología, Bioquímica,
Comunicación audiovisual, Publicidad, Marketing, Turismo, Traducción/Traducción e interpretación, Educación social,
Trabajo social, Sociología, Ciencias políticas/Políticas, Relaciones internacionales, Criminología, Geografía, Geología,
Ciencias ambientales, Nutrición, Óptica, Podología, Logopedia, Terapia ocupacional, CAFYD/INEF/Ciencias del deporte, Diseño,
Moda, Historia del arte, Arqueología, Antropología, Música, Ingeniería química, Ingeniería eléctrica, Ingeniería electrónica,
Agronomía/Ingeniería agrónoma, Ingeniería forestal, Náutica, Estadística, Finanzas, Contabilidad, Relaciones laborales,
Humanidades, Estudios ingleses, Lenguas modernas, Gastronomía, Ciencia de datos, Inteligencia artificial, Videojuegos,
Bioinformática, Biomedicina, Genética, Ciencias del mar, Astrofísica, Teología, Protocolo`;

L.idiomas = `Español/Castellano, Inglés, Francés, Alemán, Italiano, Portugués, Chino/Mandarín, Japonés, Ruso, Árabe, Catalán,
Euskera/Vasco, Gallego, Valenciano, Coreano, Hindi, Griego, Latín, Turco, Holandés/Neerlandés, Sueco, Noruego, Danés,
Finlandés, Polaco, Checo, Rumano, Húngaro, Hebreo, Persa/Farsi, Suajili/Swahili, Urdu, Bengalí, Tailandés, Vietnamita,
Indonesio, Malayo, Tagalo, Ucraniano, Búlgaro, Serbio, Croata, Esloveno, Eslovaco, Albanés, Armenio, Georgiano, Islandés,
Irlandés/Gaélico, Galés, Bretón, Quechua, Guaraní, Náhuatl, Aimara, Maya, Esperanto, Klingon, Sánscrito, Amárico, Zulú,
Afrikáans, Yoruba, Cantonés, Tamil, Asturiano/Bable, Aragonés, Occitano/Aranés, Lituano, Letón, Estonio, Maltés,
Luxemburgués, Bereber/Amazigh, Kurdo, Pastún, Mongol, Tibetano, Lengua de signos, Élfico, Dothraki`;

L.elementos = `Oxígeno, Hidrógeno, Carbono, Nitrógeno, Hierro, Oro, Plata, Cobre, Helio, Sodio, Calcio, Potasio, Cloro, Aluminio,
Zinc/Cinc, Plomo, Mercurio, Uranio, Plutonio, Azufre, Fósforo, Silicio, Magnesio, Litio, Neón, Argón, Titanio, Níquel, Estaño,
Platino, Yodo, Flúor, Cobalto, Cromo, Manganeso, Radio, Radón, Kriptón, Xenón, Boro, Berilio, Bromo, Arsénico, Selenio,
Wolframio/Tungsteno, Bario, Cesio, Estroncio, Francio, Rubidio, Vanadio, Escandio, Galio, Germanio, Circonio, Molibdeno,
Paladio, Cadmio, Indio, Antimonio, Telurio, Lantano, Cerio, Neodimio, Europio, Gadolinio, Iridio, Osmio, Bismuto, Polonio,
Astato, Torio, Americio, Curio, Einstenio, Fermio, Mendelevio, Nobelio, Oganesón, Tecnecio, Rodio, Rutenio, Hafnio, Tantalio,
Renio, Talio, Actinio, Protactinio, Neptunio, Berkelio, Californio, Laurencio, Rutherfordio, Dubnio, Seaborgio, Bohrio, Hassio,
Meitnerio, Darmstatio, Roentgenio, Copernicio, Nihonio, Flerovio, Moscovio, Livermorio, Teneso, Praseodimio, Prometio, Samario,
Terbio, Disprosio, Holmio, Erbio, Tulio, Iterbio, Lutecio, Itrio, Niobio`;

L.heroes = `Spiderman/Spider-Man/Hombre Araña, Superman, Batman, Iron Man, Hulk, Thor, Capitán América, Wonder Woman/Mujer Maravilla,
Flash, Aquaman, Lobezno/Wolverine, Deadpool, Viuda Negra, Black Panther/Pantera Negra, Doctor Strange, Ant-Man/Antman,
Ojo de Halcón, Antorcha Humana, La Cosa, Mister Fantástico, Mujer Invisible, Cíclope, Tormenta, Profesor X/Profesor Xavier,
Magneto, Joker, Harley Quinn, Catwoman, Robin, Batgirl, Supergirl, Linterna Verde/Green Lantern, Cyborg, Shazam, Thanos, Loki,
Venom, Duende Verde, Doctor Octopus, Lex Luthor, Pingüino, Enigma, Dos Caras, Bane, Ultrón, Visión, Bruja Escarlata/Scarlet Witch,
Capitana Marvel/Capitán Marvel, Star-Lord/Star Lord, Groot, Rocket, Gamora, Drax, Nebula, Daredevil, Punisher/Castigador,
Ghost Rider/Motorista Fantasma, Blade, Estela Plateada/Silver Surfer, Galactus, Apocalipsis, Mística, Pícara/Rogue, Gambito,
Bestia, Coloso, Jean Grey/Fénix, Cable, Hellboy, Invencible, Omni-Man, Homelander/Patriota, Hombre de Hielo, Falcon/Halcón,
Soldado de Invierno, Máquina de Guerra/War Machine, Shang-Chi, Ms Marvel, She-Hulk/Hulka, Nick Fury, Kick-Ass,
Chapulín Colorado, Superlópez, Capitán Trueno, Mr Increíble, Frozono/Frozone, Elastigirl/Elastichica, Darkseid, Doomsday,
Sinestro, Mysterio, Kraven, Electro, Buitre, Rino, Kang, Doctor Doom/Doctor Muerte, Mandarín, Calavera Roja, Sandman/Hombre de Arena`;

L.apps = `Instagram, TikTok, WhatsApp, Twitter/X, Facebook, YouTube, Snapchat, Telegram, Spotify, Netflix, LinkedIn, Pinterest,
Twitch, Discord, Reddit, Tinder, BeReal, Threads, Wallapop, Vinted, Amazon, Google Maps, Uber, Cabify, Glovo, Just Eat,
Uber Eats, Shein, AliExpress, Temu, Duolingo, ChatGPT, Gmail, Outlook, Zoom, Teams, Skype, Signal, Bumble, Hinge, Tumblr,
Vimeo, SoundCloud, Shazam, Waze, Airbnb, Booking, Idealista, Milanuncios, Bizum, Revolut, PayPal, Candy Crush, Clash Royale,
Pokémon GO, Brawl Stars, Among Us, Wordle, Strava, MyFitnessPal, Notion, Trello, Slack, Dropbox, Google Drive, iCloud, Canva,
CapCut, VSCO, Lightroom, Kahoot, Quizlet, Moodle, Bluesky, Mastodon, Fotocasa, Too Good To Go, Bolt, Lime, BlaBlaCar, Renfe,
Ryanair, Vueling, Prime Video, Disney+/Disney Plus, HBO/Max, Movistar+, Filmin, Apple Music, Deezer, Tidal, Clubhouse, Line,
WeChat, Kick, OnlyFans, Patreon, Grindr, Happn, Badoo, Meetic`;

L.transportes = `Coche, Moto, Bicicleta/Bici, Autobús/Bus, Tren, Avión, Barco, Metro, Taxi, Camión, Tranvía, Helicóptero, Patinete,
Furgoneta, Ferry, Yate, Velero, Submarino, Cohete, Globo/Globo aerostático, Monopatín, Caballo, Carro, Carruaje, Tractor,
Ambulancia, Autocaravana, Caravana, Teleférico, Funicular, AVE, Cercanías, Lancha, Canoa, Kayak, Piragua, Crucero, Avioneta,
Dirigible/Zepelín, Quad, Ciclomotor/Vespa, Segway, Hoverboard, Rickshaw, Tuk tuk, Trineo, Motonieve, Moto de agua, Catamarán,
Hidroavión, Planeador, Parapente, Ala delta, Nave espacial, Ovni, Limusina, Todoterreno, Tanque, Camello, Burro, Patines,
Telesilla, Góndola, Balsa, Jet privado, Autocar, Tándem, Monociclo, Triciclo, Carricoche, Alfombra voladora, Escoba voladora`;

L.flores = `Rosa, Margarita, Girasol, Tulipán, Clavel, Orquídea, Lirio, Amapola, Violeta, Jazmín, Lavanda, Geranio, Hortensia,
Cactus, Aloe vera, Helecho, Potus/Poto, Bambú, Hiedra, Crisantemo, Gardenia, Magnolia, Azucena, Dalia, Petunia, Buganvilla,
Camelia, Narciso, Jacinto, Gladiolo, Begonia, Azalea, Peonía, Lila, Nenúfar, Flor de loto/Loto, Edelweiss, Siempreviva, Malva,
Diente de león, Trébol, Romero, Tomillo, Albahaca, Menta/Hierbabuena, Orégano, Perejil, Cilantro, Laurel, Ortiga, Musgo,
Césped, Bonsái, Suculenta, Monstera, Ficus, Espatifilo, Anturio, Calathea, Sansevieria/Lengua de suegra, Drago, Palmera,
Pensamiento, Alhelí, Verbena, Caléndula, Manzanilla, Adelfa, Hibisco, Flor de Pascua/Poinsettia, Nomeolvides, Campanilla,
Madreselva, Glicinia, Mimosa, Retama, Brezo, Tojo, Jara, Cardo, Celinda, Gerbera, Fresia, Estrelitzia/Ave del paraíso, Lirio de agua`;

L.arboles = `Pino, Roble, Olivo, Encina, Abeto, Manzano, Naranjo, Sauce/Sauce llorón, Palmera, Almendro, Castaño, Nogal, Haya,
Chopo/Álamo, Eucalipto, Cerezo, Limonero, Plátano de sombra, Acacia, Olmo, Fresno, Abedul, Ciprés, Cedro, Secuoya, Baobab,
Arce, Alcornoque, Higuera, Peral, Ciruelo, Melocotonero, Avellano, Tilo, Magnolio, Jacaranda, Ficus, Laurel, Acebo, Tejo,
Sabina, Enebro, Pino piñonero, Cocotero, Ombú, Ceiba, Caoba, Ébano, Teca, Drago, Algarrobo, Granado, Membrillero, Níspero,
Palmera datilera, Madroño, Alerce, Tamarindo, Mango, Pino canario, Árbol del amor, Morera, Moral, Serbal, Plátano, Aliso,
Carpe, Castaño de Indias, Ginkgo, Ailanto, Mimosa, Pimentero, Araucaria, Kapok, Sicomoro`;

L.herramientas = `Martillo, Destornillador, Llave inglesa, Alicates, Sierra, Taladro, Clavo, Tornillo, Cinta métrica/Metro, Nivel,
Lija, Cincel, Pala, Rastrillo, Hacha, Tijeras de podar, Serrucho, Llave Allen, Llave fija, Tenazas, Grapadora, Pistola de silicona,
Cúter/Cutter, Lima, Escofina, Sargento, Mazo, Pico, Azada, Carretilla, Escalera, Soldador, Radial/Amoladora, Caladora, Lijadora,
Atornillador, Brocha, Rodillo, Espátula, Paleta, Llana, Cizalla, Berbiquí, Gato, Polea, Tornillo de banco, Torno, Compresor,
Motosierra, Desbrozadora, Cortacésped, Manguera, Regadera, Linterna, Polímetro/Multímetro, Pinzas, Bridas, Cinta americana,
Pegamento/Cola, Formón, Cepillo de carpintero, Gubia, Punzón, Granete, Tuerca, Arandela, Taco, Broca, Escuadra, Plomada,
Hoz, Guadaña, Horca, Laya, Plantador, Sacho, Llave de vaso, Llave dinamométrica, Remachadora, Tronzadora, Ingletadora`;

L.juegos = `Parchís, Ajedrez, Monopoly, UNO, Trivial, Damas, Oca/Juego de la oca, Dominó, Cluedo, Risk, Scrabble,
Catan/Colonos de Catán, Mus, Póker, Chinchón, Brisca, Tute, Cinquillo, Solitario, Pictionary, Jenga, Twister, Tabú, Dobble,
Virus, Exploding Kittens, Carcassonne, Dixit, Munchkin, Magic, Cartas Pokémon, Yu-Gi-Oh, Hundir la flota, Conecta 4,
Quién es quién, Rummikub, Backgammon, Go, Mahjong, Stratego, Blackjack, Burro, Escoba, Siete y medio, Pocha, Cuatro en raya,
Tres en raya, Bingo, Lotería, Ludo, Operación, Hotel, Pandemic, Aventureros al tren/Ticket to Ride, 7 Wonders, Azul, Splendor,
Código secreto/Codenames, Hombres lobo/Los hombres lobo de Castronegro, Saboteur, Bang, Timeline, Cortex, Party & Co/Party,
Scattergories, Quién soy, Mentiroso, Cubilete, Generala, Yahtzee, Canasta, Bridge, Remigio, Kemps, Cuatrola, Guiñote,
Butifarra, Uno Flip, Ligretto, Fantasmas, Ratas de laboratorio, Coup, Love Letter, Sushi Go, Kingdomino, Terraforming Mars,
Gloomhaven, Wingspan, Dune`;

L.marcasRopa = `Zara, Nike, Adidas, Puma, H&M, Pull&Bear/Pull and Bear, Bershka, Mango, Primark, Levi's, Gucci, Prada,
Louis Vuitton, Chanel, Dior, Versace, Balenciaga, Lacoste, Ralph Lauren, Tommy Hilfiger, Calvin Klein, Stradivarius,
Massimo Dutti, Desigual, Decathlon, The North Face/North Face, Vans, Converse, New Balance, Reebok, Fila, Kappa, Champion,
Supreme, Off-White, Stone Island, Carhartt, Dickies, Guess, Armani, Hugo Boss/Boss, Burberry, Hermès, Fendi, Givenchy,
Valentino, Dolce & Gabbana/Dolce Gabbana, Moschino, Kenzo, Loewe, Balmain, Saint Laurent/YSL, Bimba y Lola, Scalpers, El Ganso,
Springfield, Cortefiel, Uniqlo, Shein, Gap, Abercrombie, Hollister, Superdry, Jack & Jones, Only, Asos, Oysho, Lefties,
Tezenis, Calzedonia, Intimissimi, Women'secret, Victoria's Secret, Timberland, Dr Martens, Birkenstock, Crocs, Skechers, Asics,
Under Armour, Columbia, Patagonia, Quiksilver, Billabong, Ellesse, Umbro, Joma, Munich, Kelme, Pepe Jeans, Diesel, Hoff,
Pompeii, Ecoalf, Sfera, Polo Club, Trucco, Tous, Alvaro Moreno, Silbon, Pikolinos, Camper, Mayoral`;

L.futbolistas = `Messi, Cristiano Ronaldo/Cristiano, Mbappé, Haaland, Neymar, Lamine Yamal/Lamine/Yamal, Pedri, Gavi, Vinícius/Vini,
Bellingham, Modric, Benzema, Lewandowski, Iniesta, Xavi, Casillas/Iker Casillas, Ramos/Sergio Ramos, Piqué, Puyol, Busquets,
David Villa/Villa, Fernando Torres/Torres, Raúl, Ronaldinho, Zidane, Maradona, Pelé, Cruyff, Beckham, Kaká, Ibrahimovic/Ibra,
Salah, De Bruyne, Kane, Griezmann, Luis Suárez/Suárez, Morata, Rodri, Carvajal, Jordi Alba/Alba, Ter Stegen, Courtois, Oblak,
Koke, Nico Williams, Dani Olmo/Olmo, Cucurella, Unai Simón, Kroos, Müller, Neuer, Buffon, Pirlo, Totti, Maldini, Henry,
Ronaldo Nazário/Ronaldo, Rivaldo, Eto'o, Drogba, Rooney, Gerrard, Lampard, Son, Mané, Valverde, Rodrygo, Camavinga,
Tchouaméni, Araujo, Koundé, Raphinha, Ferran Torres, Ansu Fati, João Félix, Di María, Dybala, Lautaro, Julián Álvarez, De Paul,
Guti, Hierro, Butragueño, Míchel, Zubizarreta, Morientes, Mendieta, Joaquín, Reyes, Isco, Asensio, Marcelo, Pepe, Cesc/Fàbregas,
David Silva/Silva, Mata, Xabi Alonso, Cazorla, Saúl, Iago Aspas/Aspas, Borja Iglesias, Militão, Rüdiger, Alaba, Kubo,
Oyarzabal, Merino, Zubimendi, Le Normand, Laporte, Fermín, Cubarsí, Balde, Kvaratskhelia, Osimhen, Musiala, Wirtz, Saka,
Foden, Palmer, Rice, Odegaard, Van Dijk, Alisson, Ederson, Dembélé, Hakimi, Vitinha, Kanté, Pogba, Varane, Higuaín, Agüero,
Cavani, Forlán, Falcao, James/James Rodríguez, Valderrama, Chicharito, Hugo Sánchez, Stoichkov, Romário, Bebeto, Laudrup,
Figo, Roberto Carlos, Kempes, Di Stéfano, Puskás, Gento, Kubala, Eusebio, Beckenbauer, Platini, Van Basten, Gullit, Baggio`;

L.musicos = `Rosalía, Bad Bunny, Quevedo, Aitana, C. Tangana/C Tangana, Bizarrap, Shakira, Alejandro Sanz, Enrique Iglesias,
Julio Iglesias, David Bisbal/Bisbal, Pablo Alborán, Melendi, Estopa, El Canto del Loco, La Oreja de Van Gogh, Mecano,
Héroes del Silencio, Extremoduro, Fito/Fito y Fitipaldis, Vetusta Morla, Izal, Love of Lesbian, Amaral, La Quinta Estación,
Camilo Sesto, Raphael, Rocío Jurado, Isabel Pantoja, Lola Flores, Camarón, Paco de Lucía, Rosario, Malú, India Martínez,
Vanesa Martín, Manuel Carrasco, Antonio Orozco, Dani Martín, Leiva, Sabina/Joaquín Sabina, Serrat/Joan Manuel Serrat,
Nino Bravo, Los Chunguitos, Los del Río, Las Ketchup, Chenoa, Bustamante, Lola Índigo, Ana Mena, Belén Aguilera, Omar Montes,
Rels B, Myke Towers, J Balvin, Karol G, Maluma, Ozuna, Daddy Yankee, Nicky Jam, Anuel, Rauw Alejandro, Feid, Peso Pluma,
Becky G, Residente/Calle 13, Juanes, Carlos Vives, Ricky Martin, Luis Fonsi, Marc Anthony, Romeo Santos, Prince Royce,
Juan Luis Guerra, Maná, Selena, Thalía, Paulina Rubio, Gloria Trevi, Luis Miguel, Juan Gabriel, Vicente Fernández, Mon Laferte,
Natalia Lafourcade, Morat, Sebastián Yatra, Camilo, Tini, María Becerra, Nathy Peluso, Duki, Trueno, Paulo Londra,
Nicki Nicole, Emilia, Los Rodríguez, Andrés Calamaro, Soda Stereo, Gustavo Cerati, Charly García, Fito Páez, Ska-P, Mägo de Oz,
Marea, Platero y Tú, Los Suaves, Siniestro Total, Nacha Pop, Radio Futura, Alaska/Fangoria, Los Secretos, La Unión, Hombres G,
El Último de la Fila, Ketama, El Barrio, Pastora Soler, Niña Pastori, Estrella Morente, Enrique Morente, Kiko Veneno, Ojete Calor,
Lori Meyers, Sidonie, Carolina Durante, La Casa Azul, Dorian, Viva Suecia, Arde Bogotá, Cupido, Recycled J, Saiko, Mora,
Eladio Carrión, Bejo, Natos y Waor, Hoke, Yung Beef, Kidd Keo, Delaossa, Morad, Beny Jr, Lola Lolita, Ptazeta, Chanel,
Blanca Paloma, Rigoberta Bandini, Nebulossa, Melody, Funambulista, Despistaos, Pignoise, Maldita Nerea, Efecto Pasillo`;

L.politicos = `Pedro Sánchez/Sánchez, Feijóo/Alberto Núñez Feijóo, Abascal/Santiago Abascal, Yolanda Díaz, Ayuso/Isabel Díaz Ayuso,
Pablo Iglesias, Rajoy/Mariano Rajoy, Zapatero, Aznar, Felipe González, Adolfo Suárez/Suárez, Calvo-Sotelo, Puigdemont, Junqueras,
Salvador Illa/Illa, Ábalos, Koldo, María Jesús Montero, Irene Montero, Ione Belarra/Belarra, Errejón, Pablo Casado/Casado,
Albert Rivera/Rivera, Inés Arrimadas/Arrimadas, Rufián/Gabriel Rufián, García-Page/Page, Almeida, Manuela Carmena/Carmena,
Ada Colau/Colau, Esperanza Aguirre/Aguirre, Cifuentes, Gallardón, Rubalcaba, José Bono/Bono, Borrell, Solbes, Montoro,
De Guindos, Rodrigo Rato/Rato, Cospedal, Soraya Sáenz de Santamaría/Soraya, Bolaños, Marlaska, Margarita Robles/Robles, Albares,
Óscar Puente/Puente, Juanma Moreno, Mazón, Ximo Puig/Puig, Urkullu, Pradales, Ortuzar, Otegi, Aitor Esteban, Monedero,
Echenique, Espinosa de los Monteros, Macarena Olona/Olona, Ortega Smith, Tellado, Cuca Gamarra/Gamarra, Bendodo, Tamames,
Artur Mas/Mas, Jordi Pujol/Pujol, Torra, Pere Aragonès/Aragonès, Tarradellas, Fraga, Carrillo, Anguita, Llamazares,
Alberto Garzón/Garzón, Rosa Díez, Alvise, Cerdán, Mónica García, Bárcenas, Leire Díez, Óscar López, Pilar Alegría,
Félix Bolaños, Fernando Grande-Marlaska, Elma Saiz, Ernest Urtasun, Sira Rego, Ana Redondo, Diana Morant, Carlos Cuerpo`;

L.disney = `El Rey León, Frozen, Toy Story, Aladdín, La Sirenita, La Bella y la Bestia, Blancanieves, Cenicienta, La Bella Durmiente,
Pinocho, Dumbo, Bambi, Peter Pan, El Libro de la Selva, Los Aristogatos, 101 Dálmatas, Robin Hood, La Dama y el Vagabundo,
Mulán, Pocahontas, Hércules, Tarzán, El Jorobado de Notre Dame, Lilo y Stitch, Buscando a Nemo, Buscando a Dory, Monstruos S.A.,
Los Increíbles, Cars, Ratatouille, WALL·E/Wall-E, Up, Del Revés, Coco, Brave, Enredados/Rapunzel, Vaiana/Moana, Zootrópolis,
Encanto, Big Hero 6, Rompe Ralph, Bolt, Tiana y el Sapo/Tiana, El Emperador y sus Locuras, Atlantis, El Planeta del Tesoro,
Hermano Oso, Chicken Little, Bichos, Soul, Luca, Alerta Roja/Red, Elemental, Lightyear, Onward, Raya y el Último Dragón, Wish,
Fantasía, Alicia en el País de las Maravillas, Merlín el Encantador, Tod y Toby/El Zorro y el Sabueso, Oliver y su Pandilla,
Los Rescatadores, Tarón y el Caldero Mágico, Basil el Ratón Superdetective, Mary Poppins, Descendientes, High School Musical,
Lluvia de Albóndigas, Los Croods, Shrek, Madagascar, Ice Age, Kung Fu Panda, Gru/Mi villano favorito, Minions`;

L.series = `Friends, Juego de Tronos, Breaking Bad, La Casa de Papel, Stranger Things, The Office, Los Simpson,
Aquí no hay quien viva, La que se avecina, El Ministerio del Tiempo, Élite, Las Chicas del Cable, Merlí, Los Serrano,
Cuéntame/Cuéntame cómo pasó, Física o Química, Un Paso Adelante, Aída, 7 Vidas/Siete vidas, Los Hombres de Paco, El Internado,
Velvet, Gran Hotel, Vis a Vis, The Crown, The Walking Dead, Perdidos/Lost, Prison Break, Dexter, Sherlock, Peaky Blinders,
Narcos, La Casa del Dragón/House of the Dragon, The Last of Us, Euphoria, El Juego del Calamar/Squid Game, Miércoles/Wednesday,
Los Bridgerton/Bridgerton, The Mandalorian, The Boys, Black Mirror, Cómo conocí a vuestra madre, The Big Bang Theory,
Modern Family, Brooklyn Nine-Nine/Brooklyn 99, House/Dr House, Anatomía de Grey, The Good Place, Mr Robot, Westworld,
Hijos de la Anarquía/Sons of Anarchy, The Wire, Los Soprano, Mad Men, Better Call Saul, Succession, The Bear, The White Lotus,
Ted Lasso, Dark, Lupin, Rebelde, Padre de Familia, South Park, Futurama, Rick y Morty, Bob Esponja, Doraemon, Dragon Ball,
Naruto, One Piece, Shin Chan, Pokémon, Los Padrinos Mágicos, Hora de Aventuras, Gumball, Phineas y Ferb, Los Protegidos,
Compañeros, Al Salir de Clase, Verano Azul, Farmacia de Guardia, Médico de Familia, El Príncipe, Sin Identidad, La Reina del Sur,
El Chavo del 8, Betty la Fea, Pasión de Gavilanes, Paquita Salas, Arde Madrid, Veneno, La Mesías, Los Espabilados, Machos Alfa,
Smiley, Berlín, Fariña, Hierro, Antidisturbios, Patria, Isabel, Águila Roja, El Barco, Sin Tetas no hay Paraíso, Doctor Mateo,
Los Misterios de Laura, Allí Abajo, Mira lo que has hecho, Vota Juan, Poquita Fe, Muchachada Nui, Camera Café`;

L.simpson = `Homer, Marge, Bart, Lisa, Maggie, Abuelo Simpson/Abe, Ned Flanders/Flanders, Milhouse, Moe, Barney, Apu,
Señor Burns/Burns, Smithers, Krusty, Bob Patiño/Actor Secundario Bob, Nelson, Ralph, Jefe Wiggum/Wiggum, Director Skinner/Skinner,
Edna Krabappel/Krabappel, Otto, Willie, Lenny, Carl, Patty, Selma, Troy McClure, Lionel Hutz, Doctor Hibbert/Hibbert,
Doctor Nick/Nick Riviera, Kent Brockman, Comic Book Guy/El de los Cómics, Profesor Frink/Frink, Cletus, Hans Topo, Gil,
La Loca de los Gatos, Rod, Todd, Martin, Jimbo, Kearney, Dolph, Mel/Actor Secundario Mel, Alcalde Quimby/Quimby,
Tony el Gordo/Fat Tony, Serpiente/Snake, Bola de Nieve, Ayudante de Santa, Itchy/Rasca, Scratchy/Pica, Maude, Reverendo Lovejoy/Lovejoy,
Helen Lovejoy, Superintendente Chalmers/Chalmers, Lou, Eddie, Sanjay, Manjula, Duffman, Hombre Abeja, Ruth Powers, Jacqueline Bouvier,
Herb, Mona, Agnes Skinner, Disco Stu, Hombre Rana, Kang, Kodos, Sideshow Raheem, Hank Scorpio, Frank Grimes/Grimey, Artie Ziff,
Gordo Tony, Rainier Wolfcastle, McBain, Arnie Pye, Capitán McCallister, Jasper, Sherri, Terri, Uter, Wendell, Lewis, Janey`;

L.zodiaco = `Aries, Tauro, Géminis, Cáncer, Leo, Virgo, Libra, Escorpio, Sagitario, Capricornio, Acuario, Piscis`;

L.rios = `Ebro, Tajo, Duero, Guadalquivir, Guadiana, Miño, Júcar, Segura, Turia, Nilo, Amazonas, Misisipi/Mississippi, Danubio, Rin,
Sena, Támesis, Volga, Yangtsé, Ganges, Éufrates, Tigris, Jordán, Orinoco, Paraná, Río de la Plata/De la Plata, Misuri/Missouri,
Colorado, Río Grande/Bravo, Yukón, Mekong, Indo, Níger, Congo, Zambeze, Loira, Ródano, Garona, Elba, Óder, Vístula,
Dniéper/Dnieper, Don, Po, Tíber, Arno, Nervión, Bidasoa, Llobregat, Ter, Segre, Pisuerga, Esgueva, Manzanares, Henares, Jarama,
Tormes, Sil, Genil, Guadalete, Tinto, Odiel, Guadalhorce, Cinca, Aragón, Gállego, Ob, Lena, Yeniséi, Amarillo, Amur, Mosela,
Meno, Neckar, Dniéster, Uruguay, Magdalena, Cauca, Limpopo, Okavango, Senegal, San Lorenzo, Hudson, Potomac, Tajo-Segura`;

L.tiendas = `Mercadona, Carrefour, Lidl, Dia, Alcampo, Eroski, Aldi, El Corte Inglés, Hipercor, Consum, Ahorramás, BM, Caprabo,
Condis, Bonpreu, Gadis, Froiz, Masymas, Covirán, Spar, Supercor, Hiber, Simply, Ikea, Leroy Merlin, Decathlon, MediaMarkt,
Fnac, Primark, Zara, Action, Tiger, Normal, Sephora, Druni, Primor, Kiko, Alimerka, Lupa, La Sirena, Costco, Makro, Family Cash,
El Chino/Chino, Bazar, Mercado, Tiendas Ale-Hop/Ale-Hop, Toys R Us, Juguettos, Casa del Libro, Game, Worten, PcComponentes,
Bricomart, Bauhaus, Brico Depôt, Conforama, Maisons du Monde, Zara Home, H&M Home, Rituals, Lush, Natura, Flying Tiger,
Tedi, Pepco, Kiabi, Sprinter, JD Sports, Foot Locker, Deichmann, Druni, Clarel, Arenal, If, Mercado de abastos`;

L.postres = `Flan, Helado, Tarta de queso/Cheesecake, Natillas, Arroz con leche, Crema catalana, Tiramisú, Brownie, Churros,
Torrijas, Mousse de chocolate/Mousse, Coulant, Profiteroles, Tarta de manzana, Macedonia, Yogur, Cuajada, Donut/Dónut,
Magdalena, Bizcocho, Galletas, Cruasán/Croissant, Napolitana, Palmera, Ensaimada, Gofre, Crep/Crepe, Tortitas/Pancakes,
Muffin, Cupcake, Macaron, Panna cotta, Sorbete, Tarta de Santiago, Leche frita, Pestiños, Buñuelos, Polvorones, Turrón,
Mazapán, Roscón/Roscón de Reyes, Panettone, Tarta de chocolate, Tarta tres chocolates, Banoffee, Tarta de zanahoria/Carrot cake,
Pastel de nata, Baklava, Strudel, Pepito/Éclair, Caña de crema, Milhojas, Merengue, Piononos, Suspiros, Tocino de cielo,
Quesada, Sobao, Bartolillos, Rosquillas, Filloas, Carbayones, Tarta al whisky, Contessa, Petit suisse, Gominolas/Chuches,
Bombones, Chocolate, Fresas con nata, Melocotón en almíbar, Natillas de chocolate, Tarta de la abuela, Tarta Sacher,
Selva negra, Brazo de gitano, Coca de San Juan, Panellets, Huesos de santo, Yemas de Ávila, Alfajores, Mantecados`;

L.pizza = `Queso/Mozzarella, Tomate, Jamón/Jamón york, Champiñones, Pepperoni, Piña, Aceitunas, Cebolla, Pimiento, Atún,
Bacon/Beicon, Salami, Chorizo, Pollo, Carne picada, Anchoas, Orégano, Albahaca, Rúcula, Maíz, Huevo, Gambas, Salchicha,
Queso de cabra, Gorgonzola, Parmesano, Emmental, Cheddar, Berenjena, Calabacín, Alcachofa, Espinacas, Jalapeños, Nata,
Salsa barbacoa/Barbacoa, Pesto, Ajo, Jamón serrano, Prosciutto, Mortadela, Nduja, Cebolla caramelizada, Kebab, Setas, Trufa,
Guindilla, Tomate cherry, Burrata, Ricotta, Roquefort, Nueces, Miel, Higos, Pera, Patata, Salmón, Mejillones, Sobrasada,
Pimiento del piquillo, Cecina, Butifarra, Morcilla, Pistacho, Huevo de codorniz, Alcaparras, Tomate seco, Mostaza`;

L.bano = `Váter/Water/Inodoro/Retrete/WC, Lavabo, Ducha, Bañera, Espejo, Toalla, Cepillo de dientes, Pasta de dientes/Dentífrico,
Jabón, Champú, Gel, Papel higiénico, Esponja, Peine, Cepillo, Secador, Maquinilla/Cuchilla, Desodorante, Colonia/Perfume, Crema,
Escobilla, Alfombrilla, Cortina de ducha/Mampara, Bidé, Toallero, Grifo, Tapón, Hilo dental, Enjuague bucal, Bastoncillos,
Algodón, Tampones, Compresas, Cortaúñas, Pinzas, Lima, Rímel, Pintalabios, Maquillaje, Acondicionador, Mascarilla,
Cesto de la ropa, Báscula, Botiquín, Tiritas, Termómetro, Ambientador, Lejía, Patito de goma, Sales de baño, Bomba de baño,
Plancha del pelo, Rizador, Gorro de ducha, Albornoz, Radiador, Extractor, Calentador, Escobilla del váter, Jabonera, Dispensador`;

L.escolar = `Lápiz, Boli/Bolígrafo, Goma/Goma de borrar, Sacapuntas, Regla, Cuaderno/Libreta, Tijeras, Pegamento, Estuche, Mochila,
Rotulador, Subrayador/Fluorescente, Compás, Escuadra, Cartabón, Transportador, Calculadora, Agenda, Carpeta, Archivador,
Folios/Papel, Clips, Grapadora, Grapas, Celo/Cinta adhesiva, Típex/Corrector, Pizarra, Tiza, Borrador, Portaminas, Minas, Ceras,
Plastilina, Acuarelas, Témperas, Pincel, Cartulina, Chinchetas, Pósit/Post-it, Diccionario, Libro, Ordenador/Portátil, Tablet,
Pendrive/USB, Mapa, Globo terráqueo, Plumier, Fiambrera/Táper, Bata, Taquilla, Pupitre, Tablón, Proyector, Flexo, Perforadora,
Fundas de plástico, Separadores, Taco de notas, Pluma, Tintero, Lápices de colores/Colores, Purpurina, Punzón, Cúter`;

L.dinos = `Tiranosaurio/Tiranosaurio rex/T-rex/T rex, Velociraptor, Triceratops, Diplodocus, Braquiosaurio, Estegosaurio,
Pterodáctilo, Espinosaurio, Anquilosaurio, Iguanodón, Parasaurolophus, Brontosaurio, Apatosaurio, Alosaurio, Carnotauro,
Gallimimus, Dilofosaurio, Compsognathus, Paquicefalosaurio, Plesiosaurio, Mosasaurio, Ictiosaurio, Pteranodon,
Argentinosaurio, Giganotosaurio, Therizinosaurio, Protoceratops, Oviraptor, Deinonychus, Baryonyx, Megalosaurio, Troodon,
Maiasaura, Edmontosaurio, Styracosaurus, Quetzalcoatlus, Arqueópterix, Dimetrodon, Indominus rex, Utahraptor, Corythosaurus,
Ceratosaurus, Microraptor, Saltasaurio, Amargasaurio, Tarbosaurio, Albertosaurio, Pachyrhinosaurus, Suchomimus`;

L.pokemon = `Pikachu, Charmander, Bulbasaur, Squirtle, Charizard, Eevee, Mewtwo, Mew, Jigglypuff, Snorlax, Psyduck, Meowth, Gengar,
Onix, Magikarp, Gyarados, Dragonite, Lucario, Greninja, Raichu, Pichu, Togepi, Ditto, Vaporeon, Jolteon, Flareon, Umbreon,
Espeon, Sylveon, Lapras, Articuno, Zapdos, Moltres, Machamp, Alakazam, Abra, Kadabra, Geodude, Golem, Slowpoke, Cubone, Marowak,
Hitmonlee, Hitmonchan, Lickitung, Chansey, Blissey, Kangaskhan, Scyther, Pinsir, Tauros, Lugia, Ho-Oh, Celebi, Cyndaquil,
Totodile, Chikorita, Torchic, Mudkip, Treecko, Blaziken, Rayquaza, Kyogre, Groudon, Piplup, Chimchar, Turtwig, Garchomp, Arceus,
Dialga, Palkia, Giratina, Darkrai, Zekrom, Reshiram, Oshawott, Snivy, Tepig, Froakie, Fennekin, Chespin, Rowlet, Litten,
Popplio, Incineroar, Grookey, Scorbunny, Sobble, Sprigatito, Fuecoco, Quaxly, Mimikyu, Wobbuffet, Sudowoodo, Marill,
Butterfree, Caterpie, Weedle, Pidgey, Rattata, Spearow, Ekans, Arbok, Sandshrew, Nidoran, Clefairy, Vulpix, Ninetales, Zubat,
Oddish, Paras, Venonat, Diglett, Mankey, Growlithe, Arcanine, Poliwag, Bellsprout, Tentacool, Ponyta, Rapidash, Magnemite,
Farfetch'd, Doduo, Seel, Grimer, Muk, Shellder, Gastly, Haunter, Drowzee, Hypno, Krabby, Voltorb, Electrode, Exeggcute,
Koffing, Weezing, Rhyhorn, Horsea, Goldeen, Staryu, Starmie, Mr. Mime, Jynx, Electabuzz, Magmar, Porygon, Omanyte, Kabuto,
Aerodactyl, Dratini, Ivysaur, Venusaur, Charmeleon, Wartortle, Blastoise, Pidgeotto, Pidgeot, Metapod, Kakuna, Beedrill`;

L.insultos = `Tonto, Idiota, Imbécil, Gilipollas, Capullo, Cabrón, Pringado, Pardillo, Paleto, Cateto, Bobo, Memo, Zoquete,
Mamarracho, Payaso, Pelele, Borrico, Burro, Zopenco, Berzotas, Cenutrio, Mendrugo, Merluzo, Besugo, Ceporro, Cazurro, Botarate,
Mequetrefe, Sinvergüenza, Granuja, Bribón, Canalla, Rufián, Gañán, Patán, Majadero, Mentecato, Papanatas, Panoli, Pazguato,
Lerdo, Torpe, Inútil, Vago, Gandul, Chorizo, Pesado, Plasta, Cansino, Cretino, Estúpido, Necio, Mastuerzo, Tarugo, Melón,
Cabestro, Gorrino, Guarro, Cerdo, Cotilla, Chivato, Pelota, Pelmazo, Petardo, Mamón, Hortera, Cutre, Pijo, Flipado, Fantasma,
Chulo, Macarra, Garrulo, Zángano, Lameculos, Bocazas, Cagueta, Gallina, Abrazafarolas, Soplagaitas, Tontolaba, Mangurrián,
Pagafantas, Bocachancla, Tolai, Atontao, Chungo, Calzonazos, Mindundi, Tuercebotas, Lechuguino, Pánfilo, Bellaco, Felón`;

L.videojuegos = `Fortnite, Minecraft, FIFA/EA FC, GTA/Grand Theft Auto, Call of Duty, Super Mario/Mario, Zelda, Pokémon, Tetris,
Pac-Man/Pacman, League of Legends/LoL, Valorant, Counter-Strike/CS, Among Us, Roblox, Los Sims/The Sims, Overwatch,
Apex Legends, Rocket League, Clash Royale, Brawl Stars, Candy Crush, Super Smash Bros/Smash, Animal Crossing,
Red Dead Redemption, The Last of Us, God of War, Uncharted, Halo, Gears of War, Assassin's Creed, Elden Ring, Dark Souls,
Skyrim, Fallout, The Witcher, Cyberpunk, Doom, Half-Life, Portal, Sonic, Crash Bandicoot, Spyro, Tomb Raider, Resident Evil,
Silent Hill, Metal Gear, Final Fantasy, Kingdom Hearts, Street Fighter, Mortal Kombat, Tekken, PES/eFootball, NBA 2K,
Gran Turismo, Need for Speed, Forza, Angry Birds, Flappy Bird, Subway Surfers, Clash of Clans, Genshin Impact, Hollow Knight,
Celeste, Undertale, Stardew Valley, Terraria, Hades, Cuphead, Fall Guys, PUBG, Warzone, Destiny, World of Warcraft/WoW,
StarCraft, Diablo, Age of Empires, Civilization, Wii Sports, Just Dance, Guitar Hero, SingStar, Buzz, LittleBigPlanet,
Ratchet & Clank, Jak and Daxter, Kirby, Donkey Kong, Metroid, Splatoon, Pikmin, Bayonetta, Persona, Baldur's Gate,
Hogwarts Legacy, Horizon, Ghost of Tsushima, Mario Kart, Tony Hawk, Pro Evolution Soccer, Commandos, Blasphemous,
Gris, Rime, Hitman, Bioshock, Mass Effect, Dragon Age, Monster Hunter, Palworld, Lethal Company, Balatro, Helldivers`;

L.cervezas = `Mahou, Estrella Damm, Estrella Galicia, Cruzcampo, Heineken, San Miguel, Alhambra, Amstel, Ámbar, Voll-Damm, Corona/Coronita,
Budweiser, Guinness, Carlsberg, Desperados, Moritz, Keler, Damm Lemon, 1906, Leffe, Paulaner, Erdinger, Franziskaner, Duvel,
Chimay, Stella Artois, Peroni, Moretti/Birra Moretti, Pilsner Urquell, Asahi, Kirin, Sapporo, Tsingtao, Quilmes, Modelo, Sol,
Victoria, Brahma, Skol, Beck's, Warsteiner, Bitburger, Hoegaarden, Grimbergen, Affligem, Delirium, Kronenbourg, Foster's,
La Virgen, Turia, Mezquita, Ladrón de Manzanas, Daura, Free Damm, Shandy, Steinburg, Hacendado, Tyskie, Żywiec, Kozel,
Staropramen, Paulaner Weissbier, Lagunitas, Brewdog, Mahou Cinco Estrellas, Mahou Maestra, Cibeles, Dougall's`;

L.apellidos = `García, Rodríguez, González, Fernández, López, Martínez, Sánchez, Pérez, Gómez, Martín, Jiménez, Ruiz, Hernández,
Díaz, Moreno, Muñoz, Álvarez, Romero, Alonso, Gutiérrez, Navarro, Torres, Domínguez, Vázquez, Ramos, Gil, Ramírez, Serrano,
Blanco, Molina, Morales, Suárez, Ortega, Delgado, Castro, Ortiz, Rubio, Marín, Sanz, Núñez, Iglesias, Medina, Garrido, Cortés,
Castillo, Santos, Lozano, Guerrero, Cano, Prieto, Méndez, Cruz, Calvo, Gallego, Vidal, León, Márquez, Herrera, Peña, Flores,
Cabrera, Campos, Vega, Fuentes, Carrasco, Díez, Caballero, Reyes, Nieto, Aguilar, Pascual, Santana, Herrero, Lorenzo, Montero,
Hidalgo, Giménez, Ibáñez, Ferrer, Durán, Santiago, Benítez, Mora, Vicente, Vargas, Arias, Carmona, Crespo, Román, Pastor, Soto,
Sáez, Velasco, Moya, Soler, Parra, Esteban, Bravo, Gallardo, Rojas, Oliva, Pardo, Merino, Bermúdez, Cuesta, Esteve, Mesa,
Galán, Bueno, Rey, Solís, Otero, Aguirre, Echevarría, Etxeberria, Goikoetxea, Puig, Vila, Pujol, Ferrán, Sala, Castell`;

L.chicos = `Antonio, Manuel/Manolo, José/Pepe, Francisco/Paco/Curro, David, Juan, Javier, Daniel/Dani, Carlos, Jesús/Chus, Alejandro/Álex,
Miguel, Rafael/Rafa, Pablo, Pedro, Ángel, Sergio, Fernando/Fer, Jorge, Luis, Alberto, Álvaro, Adrián, Diego, Raúl, Enrique/Quique,
Ramón, Vicente, Iván, Rubén, Óscar, Andrés, Joaquín/Quino, Santiago/Santi, Eduardo/Edu, Víctor, Roberto, Jaime, Mario, Marcos,
Alfonso, Ignacio/Nacho, Hugo, Jordi, Salvador/Salva, Ricardo, Emilio, Guillermo/Guille, Gabriel, Julián, Julio, Tomás, Gonzalo,
Agustín, Mateo, Martín, Lucas, Leo, Nicolás/Nico, Marc, Samuel, Aitor, Iker, Unai, Asier, Gorka, Xabier, Pau, Pol, Oriol,
Arnau, Bruno, Darío, Izan, Thiago, Aarón, Eric, Héctor, Cristian, Rodrigo, Ismael, Marco, Felipe, César, Sebastián, Benjamín,
Lorenzo, Gregorio, Mariano, Ernesto, Arturo, Rodolfo, Íñigo, Borja, Germán, Jacobo, Lisandro, Teo, Liam, Noah, Elías, Gael,
Axel, Dylan, Kevin, Jonathan, Joel, Abel, Adam, Alonso, Gerard, Albert, Xavier, Ferran, Oier, Ander, Mikel, Jon, Telmo, Iago,
Brais, Xoán, Anxo, Fermín, Eusebio, Cándido, Fulgencio, Anselmo, Baltasar, Melchor, Gaspar, Bartolomé, Leandro, Valentín,
Marcelo, Amadeo, Isidro, Patricio, Saúl, Simón, Moisés, Abraham, Isaac, Jacob, Joan, Josep, Pere, Lluís, Ot, Biel, Nil, Roc`;

L.chicas = `María, Carmen, Ana, Isabel, Laura, Cristina, Marta, Lucía, Paula, Elena, Sara, Raquel, Rosa, Pilar, Dolores/Lola, Sofía,
Julia, Alba, Irene, Andrea, Nuria, Silvia, Patricia, Beatriz, Rocío, Sandra, Mónica, Eva, Inés, Clara, Claudia, Carla, Martina,
Valeria, Daniela, Alicia, Ángela, Natalia, Teresa, Mercedes, Montserrat/Montse, Victoria, Noelia, Esther, Lorena, Verónica,
Miriam, Celia, Olga, Nerea, Ainhoa, Leire, Ane, Noa, Emma, Olivia, Vega, Chloe/Cloe, Aitana, Lara, Marina, Carolina, Rebeca,
Susana, Gloria, Concepción/Concha, Josefa/Pepa, Francisca/Paca, Amparo, Consuelo, Remedios, Esperanza, Inmaculada/Inma,
Encarnación/Encarna, Lourdes, Almudena, Macarena, Triana, Blanca, Gemma, Judith, Jimena/Ximena, Abril, Candela, Adriana, Aurora,
Valentina, Ariadna, Berta, Carlota, Alejandra, Gabriela, Diana, Helena, Estela, Margarita, Rosario/Charo, Mia, Zoe, Luna,
Sira, India, Gala, Greta, Jana, Laia, Júlia, Mar, Leyre, Maite, Itziar, Uxue, Amaia, Iratxe, Arantxa, Begoña, Covadonga,
Xiana, Uxía, Iria, Noemí, Tamara, Vanesa, Yolanda, Belén, Soledad, Milagros, Purificación/Puri, Visitación, Engracia, Eulalia,
Fátima, Yasmina, Salma, Lidia, Elsa, Erika, Jessica, Tania, Débora, Ruth, Rut, Sonia, Ester, Paloma, Reyes, Asunción, Nieves`;

// ——— Preguntas ———
const PREGUNTAS = [
  ['Un país', 'paises'],
  ['Una capital europea', 'capitales'],
  ['Una fruta', 'frutas'],
  ['Una verdura u hortaliza', 'verduras'],
  ['Un mamífero', 'mamiferos'],
  ['Un animal que vive en el mar', 'marinos'],
  ['Un pájaro', 'aves'],
  ['Un insecto o bicho', 'insectos'],
  ['Un color', 'colores'],
  ['Un deporte', 'deportes'],
  ['Un instrumento musical', 'instrumentos'],
  ['Una profesión', 'profesiones'],
  ['Una parte del cuerpo', 'cuerpo'],
  ['Una prenda de ropa o calzado', 'ropa'],
  ['Una marca de coches', 'coches'],
  ['Un equipo de fútbol español', 'equipos'],
  ['Una provincia española', 'provincias'],
  ['Una comunidad autónoma', 'comunidades'],
  ['Una ciudad o pueblo de España', 'ciudades'],
  ['Un plato típico español', 'platos'],
  ['Una bebida', 'bebidas'],
  ['Un utensilio o aparato de cocina', 'cocina'],
  ['Un mueble o cosa de casa', 'muebles'],
  ['Una carrera universitaria', 'carreras'],
  ['Un idioma', 'idiomas'],
  ['Un elemento químico', 'elementos'],
  ['Un superhéroe o villano de cómic', 'heroes'],
  ['Una app o red social', 'apps'],
  ['Un medio de transporte', 'transportes'],
  ['Una flor o planta', 'flores'],
  ['Un árbol', 'arboles'],
  ['Una herramienta', 'herramientas'],
  ['Un juego de mesa o de cartas', 'juegos'],
  ['Una marca de ropa o calzado', 'marcasRopa'],
  ['Un futbolista', 'futbolistas'],
  ['Un cantante o grupo español o latino', 'musicos'],
  ['Un político español', 'politicos'],
  ['Una peli de animación (Disney, Pixar…)', 'disney'],
  ['Una serie', 'series'],
  ['Un personaje de Los Simpson', 'simpson'],
  ['Un signo del zodiaco', 'zodiaco'],
  ['Un río', 'rios'],
  ['Un súper o tienda de España', 'tiendas'],
  ['Un postre o dulce', 'postres'],
  ['Un ingrediente de pizza', 'pizza'],
  ['Algo que hay en un baño', 'bano'],
  ['Material escolar o de oficina', 'escolar'],
  ['Un dinosaurio', 'dinos'],
  ['Un Pokémon', 'pokemon'],
  ['Un insulto de toda la vida', 'insultos'],
  ['Un videojuego', 'videojuegos'],
  ['Una marca de cerveza', 'cervezas'],
  ['Un apellido español', 'apellidos'],
  ['Un nombre de chico', 'chicos'],
  ['Un nombre de chica', 'chicas'],
];

// Preguntas "que empiece por…" (se generan con letras que tengan suficientes respuestas)
const POR_LETRA = [
  ['Un país que empiece por', ['paises']],
  ['Un animal que empiece por', ['mamiferos', 'aves', 'marinos', 'insectos']],
  ['Una fruta o verdura que empiece por', ['frutas', 'verduras']],
  ['Un nombre de chico que empiece por', ['chicos']],
  ['Un nombre de chica que empiece por', ['chicas']],
  ['Una ciudad de España que empiece por', ['ciudades']],
  ['Una profesión que empiece por', ['profesiones']],
  ['Algo de comer que empiece por', ['platos', 'postres', 'frutas', 'verduras']],
];

// ——— Comprobación ———
const ARTICULOS = /^(el|la|los|las|un|una|unos|unas|l)\s+/;
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' y ').replace(/[^a-z0-9]+/g, ' ').trim().replace(ARTICULOS, '').replace(/\s+/g, '');
}
const singular = k => k.endsWith('es') && k.length > 4 ? [k.slice(0, -2), k.slice(0, -1)] : k.endsWith('s') && k.length > 3 ? [k.slice(0, -1)] : [];

function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

function parse(text) {
  return text.split(',').map(s => s.trim()).filter(Boolean).map(entry => {
    const forms = entry.split('/').map(s => s.trim()).filter(Boolean);
    return { name: forms[0], keys: [...new Set(forms.map(norm))] };
  });
}
const LISTS = {};
for (const k in L) LISTS[k] = parse(L[k]);

function build(text, entries) {
  // Quitamos duplicados (misma respuesta en varias listas) y asignamos rareza por posición
  const seen = new Set(), out = [];
  for (const e of entries) { if (seen.has(e.keys[0])) continue; seen.add(e.keys[0]); out.push(e); }
  const n = out.length;
  out.forEach((e, i) => { e.rare = i < n * 0.3 ? 1 : i < n * 0.7 ? 2 : 3; e.id = e.keys[0]; });
  const index = new Map();
  for (const e of out) for (const k of e.keys) { if (!index.has(k)) index.set(k, e); }
  return { text, entries: out, index };
}

function interleave(lists) {
  const out = [], max = Math.max(...lists.map(l => l.length));
  for (let i = 0; i < max; i++) for (const l of lists) if (l[i]) out.push(l[i]);
  return out;
}

const pick = a => a[Math.floor(Math.random() * a.length)];

function randomQuestion(avoid) {
  for (let tries = 0; tries < 20; tries++) {
    let q;
    if (Math.random() < 0.28) {
      const [text, lists] = pick(POR_LETRA);
      const all = interleave(lists.map(l => LISTS[l]));
      const byLetter = {};
      for (const e of all) { const c = e.keys[0][0]; (byLetter[c] = byLetter[c] || []).push(e); }
      const letters = Object.keys(byLetter).filter(c => byLetter[c].length >= 8);
      const c = pick(letters);
      q = build(`${text} ${c.toUpperCase()}`, byLetter[c]);
      q.letter = c;
    } else {
      const [text, list] = pick(PREGUNTAS);
      q = build(text, LISTS[list]);
    }
    if (!avoid || !avoid.includes(q.text)) return q;
  }
  const [text, list] = PREGUNTAS[0];
  return build(text, LISTS[list]);
}

// Devuelve la entrada que coincide con lo escrito (o null)
function match(q, input) {
  const k = norm(input);
  if (!k) return null;
  const tryKey = key => {
    if (q.letter && key[0] !== q.letter) return null;
    return q.index.get(key) || null;
  };
  let e = tryKey(k);
  if (e) return e;
  for (const s of singular(k)) { e = tryKey(s); if (e) return e; }
  // Pequeñas faltas de ortografía
  if (k.length < 5) return null;
  const max = k.length >= 9 ? 2 : 1;
  let best = null, bestD = max + 1;
  for (const [key, entry] of q.index) {
    if (key.length < 4) continue;
    const d = lev(k, key, max);
    if (d < bestD) { bestD = d; best = entry; }
  }
  if (best && q.letter && k[0] !== q.letter) return null;
  return bestD <= max ? best : null;
}

module.exports = { randomQuestion, match, norm, LISTS, PREGUNTAS };
