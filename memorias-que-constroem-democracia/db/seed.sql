INSERT INTO cities (id,name,ibge_code,description,lat,lng,zoom,color) VALUES
(1,'Acopiara','2300309','Parte do recorte territorial do Atlas.',-6.0936,-39.4543,13,'#FE5300'),
(2,'Catarina','2303600','Município dos Inhamuns integrado ao Atlas.',-6.1350,-39.8762,13,'#8E1B75'),
(3,'Deputado Irapuan Pinheiro','2304269','Território de pesquisa, campo e cartografia social.',-5.9174,-39.2672,13,'#267082'),
(4,'Piquet Carneiro','2310902','Município integrado ao recorte inicial do Atlas.',-5.80025,-39.41702,13,'#71863A')
ON CONFLICT (id) DO NOTHING;
INSERT INTO memories (title,story,city_id,neighborhood,category,period,contributor,lat,lng,status,featured) VALUES
('Monte Mor','Registro editorial do trabalho de campo realizado no Monte Mor, em Acopiara.',1,'Zona rural / área de campo','Cultura','09 de maio','Equipe do projeto',-6.0936,-39.4543,'Aprovado',TRUE),
('Trilha dos Caldeirões','Registro editorial da atividade realizada na Trilha dos Caldeirões.',3,'Zona rural','Patrimônio','11 de junho','Equipe do projeto',-5.9174,-39.2672,'Aprovado',TRUE),
('Memória do Centro','Ficha inicial para reunir uma memória urbana de Catarina.',2,'Centro','Memória','Registro inicial','Equipe do projeto',-6.1350,-39.8762,'Aprovado',FALSE),
('Paisagens de Piquet Carneiro','Ficha inicial para uma coleção fotográfica de Piquet Carneiro.',4,'Centro','Fotografia','Registro inicial','Equipe do projeto',-5.80025,-39.41702,'Aprovado',FALSE);
