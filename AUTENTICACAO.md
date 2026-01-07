# Sistema de Autenticação JWT

## Visão Geral

Sistema completo de autenticação JWT implementado para competidores e equipes.

## Estrutura Criada

### 1. Configuração Axios (`src/config/axios.ts`)
- Instância do Axios configurada com interceptors
- Adiciona automaticamente o token JWT em todas as requisições
- Interceptor de resposta para tratar erros 401 (token expirado)
- Redireciona automaticamente para login em caso de token inválido

### 2. Store de Autenticação (`src/stores/auth.ts`)
- Gerenciamento de estado com Pinia
- Armazena dados do usuário logado (competidor ou equipe)
- Persiste dados no localStorage
- Getters para verificar autenticação e tipo de usuário

**Dados armazenados:**
- `accessToken`: Token JWT
- `tokenType`: Tipo do token (bearer)
- `userType`: 'competidor' ou 'equipe'
- `userData`: Dados completos do usuário

### 3. Serviço de Autenticação (`src/services/auth.service.ts`)
- Funções para login/logout de competidor e equipe
- Validação de token

**Rotas da API:**
- `POST /api/competidor/login` - Login de competidor
- `POST /api/equipe/login` - Login de equipe
- `POST /api/competidor/logout` - Logout de competidor
- `POST /api/equipe/logout` - Logout de equipe

### 4. Componente UserDropdown (`src/components/UserDropdown.vue`)
- Exibe nome do usuário logado
- Dropdown com opções:
  - Editar Perfil
  - Sair
- Badge indicando tipo de usuário (Atleta/Equipe)
- Design responsivo e animado

### 5. NavBar Atualizado (`src/components/NavBar.vue`)
- Mostra UserDropdown quando usuário está autenticado
- Esconde link de login quando usuário está logado
- Integração com store de autenticação

### 6. Login.vue Atualizado (`src/views/Login.vue`)
- Integração completa com API
- Tratamento de erros:
  - Credenciais inválidas (401)
  - Erro de validação (422)
  - Erro de rede
- Armazena dados de autenticação após login bem-sucedido
- Redireciona para home após login

## Fluxo de Autenticação

### Login
1. Usuário escolhe tipo (Atleta/Equipe)
2. Preenche usuário e senha
3. Sistema chama API apropriada
4. Em caso de sucesso:
   - Token JWT é armazenado no localStorage
   - Dados do usuário são salvos na store
   - Usuário é redirecionado para home
   - NavBar exibe UserDropdown

### Requisições Autenticadas
- Todas as requisições incluem automaticamente o header:
  ```
  Authorization: Bearer {token}
  ```

### Logout
1. Usuário clica em "Sair" no dropdown
2. Sistema chama API de logout
3. Dados são limpos do localStorage
4. Store é resetada
5. Usuário é redirecionado para login

### Token Expirado
- Interceptor detecta erro 401
- Limpa automaticamente dados de autenticação
- Redireciona para login

## Resposta da API

### Login Competidor
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "competidor": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "login": "joao.silva",
    "faixa": "Azul"
  }
}
```

### Login Equipe
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600,
  "equipe": {
    "id": 1,
    "descricao": "Academia XYZ",
    "email": "contato@academiaxyz.com",
    "login": "academia.xyz"
  }
}
```

## Traduções

Sistema totalmente traduzido em 8 idiomas:
- Português (pt-BR)
- Inglês (en-US)
- Espanhol (es-ES)
- Francês (fr-FR)
- Alemão (de-DE)
- Italiano (it-IT)
- Chinês (zh-CN)
- Árabe (ar-SA)

## Como Usar

### Verificar se usuário está autenticado
```vue
<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

if (authStore.isAuthenticated) {
  console.log('Usuário logado:', authStore.userName)
  console.log('Tipo:', authStore.userType)
}
</script>
```

### Fazer requisição autenticada
```typescript
import api from '@/config/axios'

// O token é incluído automaticamente
const response = await api.get('/minha-rota-protegida')
```

### Proteger rotas
```typescript
// No router
{
  path: '/perfil',
  component: Profile,
  beforeEnter: (to, from, next) => {
    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      next()
    } else {
      next('/login')
    }
  }
}
```

## Segurança

- Token armazenado no localStorage
- Interceptor automático para token expirado
- Limpeza automática em caso de erro 401
- Senha nunca é armazenada localmente
- Todas as requisições usam HTTPS (em produção)

## Próximos Passos Sugeridos

1. Implementar páginas de edição de perfil
2. Adicionar funcionalidade "Esqueci minha senha"
3. Implementar refresh token
4. Adicionar guards de rota globais
5. Implementar sistema de roles/permissões

