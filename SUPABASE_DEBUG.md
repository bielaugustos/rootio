# 🔍 Debug: "Secret key should be a JWT" Error

## ❌ Possíveis Causas

1. **Chaves incorretas/expiradas** no `.env.local`
2. **Projeto Supabase não existe** ou foi deletado
3. **Problema temporário** no Supabase

## ✅ Verificações

### 1. Verifique suas chaves no Supabase Dashboard

1. Vá para [supabase.com](https://supabase.com)
2. Entre no seu projeto
3. **Settings** → **API**
4. Compare com o `.env.local`:
   - **Project URL** deve ser: `https://fnjhslnetiajtwlqcivk.supabase.co`
   - **anon/public key** deve começar com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Teste a conexão

Execute no console do navegador:
```javascript
// Teste básico da conexão
fetch('https://fnjhslnetiajtwlqcivk.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuamhzbG5ldGlhanR3bHFjaXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTAwNTAsImV4cCI6MjA5NDM2NjA1MH0.hIt2nQ17gB6gqkD_UlfFjDE2856HI1ibcwanRVhNPbE'
  }
}).then(r => console.log('✅ Conexão OK:', r.status)).catch(e => console.log('❌ Erro:', e))
```

### 3. Recrie as chaves (se necessário)

Se as chaves estiverem erradas:
1. No Supabase Dashboard → **Settings** → **API**
2. Clique **"Regenerate key"** para a anon key
3. Atualize o `.env.local` com a nova chave

## 🚀 Solução Rápida

Se o problema persistir:
1. Crie um **novo projeto Supabase**
2. Execute o schema SQL (`db/supabase-schema.sql`)
3. Use as novas chaves no `.env.local`

## 📞 Suporte

Se nada funcionar, verifique:
- Projeto Supabase ainda existe?
- Billing ativo?
- Logs de erro no Supabase Dashboard