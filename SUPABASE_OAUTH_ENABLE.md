# Ativando Provedores OAuth no Supabase

## ❌ Erro: "Unsupported provider: provider is not enabled"

Este erro significa que o Google/Apple OAuth não está **ativado** no seu projeto Supabase.

## ✅ Como Resolver

### 1. Acesse o Supabase Dashboard

Vá para: [supabase.com](https://supabase.com) → Seu projeto → **Authentication** → **Providers**

### 2. Ative os Provedores

#### Para Google:
1. Clique na aba **"Google"**
2. Marque **"Enable sign in with Google"**
3. Cole seu **Client ID** (do Google Cloud Console)
4. Clique **"Save"**

#### Para Apple:
1. Clique na aba **"Apple"**
2. Marque **"Enable sign in with Apple"**
3. Configure com suas credenciais da Apple
4. Clique **"Save"**

### 3. URLs de Redirecionamento (Importante!)

Certifique-se de que as URLs estão corretas:

**Site URL:** `http://localhost:5174` (desenvolvimento)

**Redirect URLs:**
- `http://localhost:5174`
- `http://localhost:5174/auth/callback`

### 4. Teste

Após ativar os provedores:
1. Reinicie o servidor: `npm run dev`
2. Teste o login OAuth

## 🔍 Verificação

Para verificar se está funcionando, você pode:
1. Ver no Supabase Dashboard se os provedores aparecem como "Enabled"
2. Testar login OAuth no app

O erro desaparecerá assim que ativar os provedores! 🎯