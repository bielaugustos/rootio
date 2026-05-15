# URLs OAuth - Desenvolvimento vs Produção

## ❌ Problema Atual

O erro mostra `localhost:3000` mas estamos rodando na porta `5174` (Vite).

## ✅ Solução

### 1. URLs de Desenvolvimento
Configure no Supabase Dashboard > Authentication > URL Configuration:

**Site URL:** `http://localhost:5174`

**Redirect URLs:**
- `http://localhost:5174`
- `http://localhost:5174/auth/callback`

### 2. URLs de Produção (Vercel)
**Site URL:** `https://rootio-eight.vercel.app`

**Redirect URLs:**
- `https://rootio-eight.vercel.app`
- `https://rootio-eight.vercel.app/auth/callback`

### 3. Para Google OAuth
No Google Cloud Console, Authorized redirect URIs:
- Desenvolvimento: `http://localhost:5174/auth/v1/callback`
- Produção: `https://rootio-eight.vercel.app/auth/v1/callback`

<!-- Apple OAuth removido -->

## 🧪 Teste

Após configurar as URLs corretas:
1. Reinicie o servidor de desenvolvimento
2. Teste o login OAuth novamente

O erro de `localhost:3000` deve ser resolvido!