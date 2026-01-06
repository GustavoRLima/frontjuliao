# Configuração da API

Este diretório contém as configurações relacionadas à API do projeto.

## Arquivo `api.ts`

O arquivo `api.ts` centraliza todas as URLs e endpoints da API utilizados no projeto.

### Configuração da URL Base

A URL base da API é configurada através da variável de ambiente `VITE_API_BASE_URL`.

#### Como configurar:

1. Copie o arquivo `.env.example` para `.env` na raiz do projeto:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e configure a URL da sua API:
   ```env
   VITE_API_BASE_URL=http://juliao.localhost
   ```

3. Para ambientes diferentes, você pode criar arquivos específicos:
   - `.env.development` - Para desenvolvimento
   - `.env.production` - Para produção
   - `.env.staging` - Para staging

### Uso

Para usar os endpoints configurados, importe-os no seu componente:

```typescript
import { API_ENDPOINTS } from '@/config/api'

// Exemplo de uso
fetch(API_ENDPOINTS.registerAthlete, {
  method: 'POST',
  body: data
})
```

### Adicionar novos endpoints

Para adicionar novos endpoints, edite o objeto `API_ENDPOINTS` no arquivo `api.ts`:

```typescript
export const API_ENDPOINTS = {
  registerAthlete: `${API_BASE_URL}/api/register-athlete`,
  getEquipes: `${API_BASE_URL}/api/get-equipes`,
  // Adicione seu novo endpoint aqui
  novoEndpoint: `${API_BASE_URL}/api/novo-endpoint`,
}
```

## Variáveis de Ambiente

⚠️ **Importante**: 
- Nunca commite o arquivo `.env` no Git (já está no `.gitignore`)
- Sempre use o prefixo `VITE_` para variáveis que serão usadas no frontend
- Após alterar o `.env`, reinicie o servidor de desenvolvimento

