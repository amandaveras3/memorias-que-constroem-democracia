# Memórias que Constroem Democracia — Atlas Histórico Participativo

Sistema completo de protótipo funcional baseado no layout fornecido: página inicial editorial, Atlas interativo, detalhe de lugar, registro de memória, projeto, galeria, arquivo de memórias, login e painel de moderação.

## 1. Requisitos
- Node.js 18+ (recomendado 20+)
- npm

## 2. Instalação
```bash
npm install
```

## 3. Rodar tudo
```bash
npm run dev:full
```

Frontend: http://localhost:5173
API: http://localhost:3001/api/health

> Não abra o `index.html` com duplo clique. Use o Vite pelo terminal.

## 4. Banco de dados
### Modo padrão — sem configuração externa
A API cria automaticamente `db/local-data.json` e persiste cidades, lugares, memórias e contribuições nesse arquivo. É o modo mais simples para apresentação e desenvolvimento local.

### PostgreSQL / Supabase
Se `DATABASE_URL` estiver definido no `.env`, a API passa a usar PostgreSQL.

1. Copie `.env.example` para `.env`.
2. Defina `DATABASE_URL`.
3. Execute `db/schema.sql`.
4. Execute `db/seed.sql`.
5. Rode `npm run server`.

## 5. Login da equipe
- E-mail: `admin@atlas.local`
- Senha: `atlas2026`

Altere essas credenciais no `.env` antes de publicar o sistema.

## 6. Funcionalidades
- Navegação por hash: `#`, `#atlas`, `#projeto`, `#galeria`, `#memorias`, `#login`, `#admin`.
- Mapa Leaflet + OpenStreetMap.
- Quatro cidades do recorte: Acopiara, Catarina, Deputado Irapuan Pinheiro e Piquet Carneiro.
- Filtros por cidade, bairro/localidade, categoria e busca.
- Polígonos municipais esquemáticos para leitura visual do recorte.
- Pontos iniciais de bairros/localidades para navegação.
- Clique no mapa para registrar memória naquele ponto.
- Formulário multipart com fotos, vídeos e documentos.
- Moderação: Pendente → Em análise → Aprovado/Recusado.
- Aprovação cria a memória publicada no banco local ou PostgreSQL.
- Página individual de memória com localização e memórias relacionadas.
- Galeria editorial e arquivo pesquisável.
- Layout responsivo inspirado diretamente no protótipo enviado.

## Observação cartográfica
Os polígonos coloridos e pontos de bairros/localidades incluídos no protótipo são uma base visual inicial editável. Eles não devem ser apresentados como limites oficiais de bairros sem validação cartográfica/documental. Substitua-os por GeoJSON oficial ou produzido pela pesquisa quando disponível.

## Cartografia municipal oficial

O Atlas utiliza a **Malha Municipal Digital do IBGE**, versão 2025, carregada pela API pública de malhas do IBGE. Os quatro municípios do recorte são destacados individualmente por seus geocódigos oficiais: Acopiara (2300309), Catarina (2303600), Deputado Irapuan Pinheiro (2304269) e Piquet Carneiro (2310902). Os demais municípios aparecem como entorno/limítrofes, sem fazer parte do recorte principal do Atlas.

Fonte cartográfica: IBGE — Malha Municipal Digital. A documentação do IBGE informa que a malha representa a Divisão Político-Administrativa vigente e utiliza SIRGAS 2000. O sistema mantém a navegação e os registros do Atlas separados da malha oficial.
