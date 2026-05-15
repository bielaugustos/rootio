# Configuração OAuth Supabase

## 1. Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Vá para "APIs & Services" > "Credentials"
4. Clique "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure:
   - Application type: Web application
   - Authorized JavaScript origins: `https://your-project.supabase.co`
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`

6. Copie o Client ID

## 2. Configurar no Supabase

1. Vá para Supabase Dashboard > Authentication > Providers
2. Ative "Google"
3. Cole o Client ID
4. Salve

## 3. Configurar Apple OAuth (Opcional)

1. Acesse [Apple Developer](https://developer.apple.com/)
2. Crie um App ID e Services ID
3. Configure Sign In with Apple
4. No Supabase, ative "Apple" e configure com suas credenciais

## 4. Testar

Após configurar, os botões Google e Apple na página de login devem funcionar!