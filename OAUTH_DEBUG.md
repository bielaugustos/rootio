# 🔍 Verificação OAuth Google

## ❌ Problema: Redirecionamento para login após OAuth

Se após fazer login com Google você volta para a página de login, significa que a autenticação não foi estabelecida.

## ✅ Verificações

### 1. **Console do navegador (F12)**
Após tentar login Google, verifique os logs:
- ✅ Deve aparecer: `✅ User signed in: seu@email.com`
- ❌ Se aparecer erro, copie e reporte

### 2. **Configuração Supabase**
1. Acesse [supabase.com](https://supabase.com) → Seu projeto
2. **Authentication** → **Providers**
3. **Google** deve estar **"Enabled"**
4. Deve ter **Client ID** configurado

### 3. **URLs de Redirecionamento**
Em **Settings** → **Authentication** → **URL Configuration**:

**Site URL:** `https://rootio-eight.vercel.app` (produção)  
**OU** `http://localhost:5174` (desenvolvimento)

**Redirect URLs:**
- `https://rootio-eight.vercel.app`
- `https://rootio-eight.vercel.app/auth/callback`

### 4. **Teste Básico**
Execute no console do navegador:
```javascript
// Teste se o Supabase está respondendo
fetch('https://fnjhslnetiajtwlqcivk.supabase.co/auth/v1/user', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
}).then(r => console.log('Supabase OK:', r.status)).catch(e => console.log('Erro:', e))
```

## 🚀 **Possíveis Soluções**

### **Se o provedor não está ativado:**
1. Ative Google OAuth no Supabase Dashboard
2. Configure o Client ID

### **Se as URLs estão erradas:**
1. Atualize as URLs no Supabase para corresponder ao seu ambiente
2. Reinicie o servidor de desenvolvimento

### **Se há erro no console:**
1. Copie o erro completo
2. Verifique se a chave anon/public está correta em `.env.local`

## 📞 **Debug Avançado**

Adicione este código temporariamente no console:
```javascript
// Monitor auth changes
window.supabase = supabase
supabase.auth.onAuthStateChange((event, session) => {
  console.log('AUTH EVENT:', event, session?.user?.email)
})
```

Teste o login Google e veja os eventos no console.

O problema geralmente é configuração OAuth no Supabase ou URLs incorretas! 🔧