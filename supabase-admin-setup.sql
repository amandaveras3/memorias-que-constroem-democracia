-- MCD · configurar administrador
-- 1) Crie a conta da equipe em Authentication > Users.
-- 2) Substitua o e-mail abaixo pelo e-mail EXATO dessa conta.
-- 3) Execute no SQL Editor.

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin')
where email = 'SEU-EMAIL-DA-EQUIPE@EXEMPLO.COM';

-- Conferência:
select id, email, raw_user_meta_data
from auth.users
where email = 'SEU-EMAIL-DA-EQUIPE@EXEMPLO.COM';
