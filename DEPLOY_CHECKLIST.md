# Checklist de Deploy - Problema de Hydration Mismatch

## ✅ Verificações Críticas Antes do Deploy

### 1. **Limpar Cache Completamente**
```bash
# No Docker ou localmente antes do build
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache
```

### 2. **Verificar se o Build Foi Atualizado**
- [ ] Verificar o hash dos arquivos JS no `.next/static/chunks/`
- [ ] Os nomes dos arquivos devem mudar após cada build
- [ ] Se os arquivos têm o mesmo nome, o build NÃO foi atualizado

### 3. **Verificar Variáveis de Ambiente**
- [ ] `NODE_ENV` não deve estar definido durante o build
- [ ] `NODE_ENV=production` apenas no runtime
- [ ] `NEXT_PUBLIC_*` variáveis devem estar configuradas no Coolify

### 4. **Verificar Build no Coolify**
- [ ] Build foi feito APÓS as últimas mudanças no código
- [ ] Cache do Docker foi limpo antes do build
- [ ] Logs do build mostram que o `.next` foi gerado

## 🔍 Como Verificar se o Build Foi Atualizado

### No Navegador:
1. Abrir DevTools → Network
2. Recarregar a página com Cache Disabled (Ctrl+Shift+R)
3. Verificar o nome dos arquivos JS em `/_next/static/chunks/`
4. Comparar com o build anterior

### No Servidor:
```bash
# Verificar quando os arquivos foram gerados
ls -la .next/static/chunks/ | head -20

# Verificar o BUILD_ID
cat .next/BUILD_ID
```

## ⚠️ Se o Problema Persistir

1. **Verificar se o build está realmente sendo atualizado**
   - Os arquivos JS devem ter nomes diferentes após cada build
   - O BUILD_ID deve mudar

2. **Testar com página mínima**
   - A página principal agora é mínima
   - Se funcionar, o problema estava no conteúdo original
   - Se não funcionar, o problema é mais fundamental

3. **Verificar se há múltiplos elementos HTML sendo criados**
   - Inspecionar o HTML gerado no servidor
   - Verificar se há múltiplos `<html>` ou `<body>` tags

4. **Verificar logs do servidor**
   - Ver se há erros durante o build
   - Ver se há erros durante o start

## 📝 Mudanças Implementadas

1. ✅ `NODE_ENV=production` removido do stage de build
2. ✅ Página principal totalmente client-side
3. ✅ Layout minimalista sem componentes client-side
4. ✅ Cache limpo antes do build
5. ✅ Configurações no `next.config.js` para consistência

