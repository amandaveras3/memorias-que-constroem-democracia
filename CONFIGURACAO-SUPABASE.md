# Configuração do Supabase — MCD Atlas

O projeto já vem com a conexão configurada em `.env.local`.

## 1. Banco de dados

No Supabase → SQL Editor:

1. Execute `supabase-schema.sql`.
2. Execute `supabase-seed-80.sql`.

Se você já executou os dois arquivos anteriormente e a consulta `SELECT COUNT(*) FROM public.atlas_points;` retorna **80**, não precisa repetir o seed.

## 2. Administrador

1. No Supabase, crie a conta da equipe em **Authentication → Users**.
2. Abra o SQL Editor.
3. Abra `supabase-admin-setup.sql`.
4. Troque `SEU-EMAIL-DA-EQUIPE@EXEMPLO.COM` pelo e-mail real da conta.
5. Execute.

A conta precisa ficar com:

```json
{"role":"admin"}
```

O site verifica essa permissão antes de abrir a central `/admin`.

## 3. Fluxo de contribuição

### Novo ponto no mapa

Visitante → clica no mapa → preenche o registro → envia → `atlas_points.status = pending` → equipe analisa → `published` ou `rejected`.

### Nova memória

Visitante → preenche `/participe` → `contributions.status = pending` → equipe analisa → `published` ou `rejected`.

### Arquivos

Fotos, documentos, áudios e vídeos são enviados para o bucket `atlas-attachments` e registrados na tabela `attachments`.

## 4. Avaliações

As avaliações dos pontos publicados são gravadas em `point_reviews`. O site recalcula média e quantidade no registro do Atlas.

## 5. Rodar no VS Code

```powershell
npm.cmd install
npm.cmd run dev
```

Produção:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Importante

- Não coloque `service_role` ou Secret Key no frontend.
- A Publishable Key usada pelo projeto deve ficar protegida pelas políticas RLS do banco.
- O arquivo `.env.local` contém a chave pública do projeto.


## Correção v4 — erro `public.municipalities`
Para esta versão, execute uma única vez o arquivo `supabase-fix-v6.sql` no SQL Editor do Supabase. Ele corrige o CHECK de status, as políticas RLS e a fila de moderação. Depois reinicie o Vite.


## Correção v5 — fila de moderação
Se o navegador mostrar `violates check constraint "atlas_points_status_check"`, execute `supabase-fix-v6.sql` no SQL Editor. A correção alinha o banco ao código atual: novos pins entram como `pending`, ficam disponíveis para os administradores e só passam a `published` após aprovação. A página `/participe` continua usando `pending` para novas memórias.

O painel `/admin` também é atualizado em tempo real quando um novo pin ou uma nova memória chega ao Supabase.


## Migração final v8 — remoção e Acervo

Execute `supabase-fix-v8-final.sql` no SQL Editor depois da estrutura que já está funcionando.

A migração:
- libera `DELETE` em `atlas_points` somente para administradores;
- cria `archive_items`;
- cria o bucket público `atlas-archive`;
- permite upload/edição/remoção de arquivos do Acervo somente para administradores;
- mantém a leitura pública apenas dos materiais publicados.

O frontend nunca usa `service_role`. As permissões administrativas dependem de:

```json
{ "role": "admin" }
```

no `user_metadata` da conta autenticada.

## Migração final v10 — edição completa e atualização automática

Para esta versão, execute `supabase-fix-v10-final.sql` **uma vez** no SQL Editor.

A migração v10 **não apaga os registros existentes**. Ela:
- permite ao administrador visualizar e editar todos os pontos do Atlas;
- permite editar título, município, categoria, narrativa, fontes e coordenadas;
- mantém a exclusão de pontos publicada restrita ao administrador;
- permite visualizar e editar todos os itens do Acervo;
- permite substituir o arquivo de um item do Acervo sem perder o registro;
- cria/garante `updated_at` nas tabelas necessárias;
- habilita Realtime para `atlas_points`, `contributions` e `archive_items`;
- garante as políticas de Storage necessárias para o gerenciamento administrativo.

Depois de executar a migração, a equipe pode usar `/admin` para editar os registros. Quando uma edição ou publicação for concluída, as páginas públicas que estiverem abertas podem receber a atualização automaticamente pelo Realtime; ao abrir novamente o Atlas, os dados também são carregados diretamente do Supabase.
