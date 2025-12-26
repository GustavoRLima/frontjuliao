# Página Welcome - Sistema de Campeonatos

## 📋 Descrição

Página de boas-vindas completa com menu de navegação flutuante, seletor de idiomas e layout responsivo usando Bootstrap 5.

## 🚀 Funcionalidades Implementadas

### 1. **Navbar Flutuante** (`NavBar.vue`)
- Menu fixo no topo da página
- Logo do sistema
- Seletor de idiomas com 8 bandeiras:
  - 🇧🇷 Brasil (Português)
  - 🇺🇸 Estados Unidos (English)
  - 🇪🇸 Espanha (Español)
  - 🇩🇪 Alemanha (Deutsch)
  - 🇫🇷 França (Français)
  - 🇮🇹 Itália (Italiano)
  - 🇨🇳 China (中文)
  - 🇸🇦 Arábia Saudita (العربية)
- Menus de navegação:
  - Home
  - Login (dropdown com opções: Atleta e Equipe)
  - Campeonatos
  - Painel Ranking
- Responsivo com menu hambúrguer em dispositivos móveis

### 2. **Página Welcome** (`Welcome.vue`)
- **Banner Principal**: Imagem em destaque 1200x720px
- **Seção de Cadastro**: 
  - Duas cards com opções de cadastro (Atleta e Equipe)
  - Botões de ação para cada tipo de cadastro
  - Design com gradiente e efeitos hover
- **Seção de Recursos**: 
  - 3 cards com imagens e textos descritivos
  - Layout em grid responsivo
- **Seção de Destaques**:
  - Texto introdutório
  - Carousel Bootstrap com 3 imagens
  - Controles de navegação e indicadores

### 3. **Footer** (`Footer.vue`)
- Rodapé fixo na parte inferior
- Texto à esquerda: Copyright e informações
- Texto à direita: Mensagem de desenvolvimento
- Design responsivo

## 🎨 Tecnologias Utilizadas

- **Vue 3** com Composition API
- **TypeScript**
- **Bootstrap 5.3** (CSS e JS)
- **Vite** como bundler

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🌐 Servidor de Desenvolvimento

O projeto está rodando em: **http://localhost:5174/**

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── NavBar.vue      # Menu de navegação flutuante
│   └── Footer.vue      # Rodapé da página
├── views/
│   └── Welcome.vue     # Página principal de boas-vindas
├── App.vue             # Componente raiz
└── main.ts             # Ponto de entrada (com Bootstrap configurado)

public/
└── logo.svg            # Logo do sistema
```

## 🎯 Próximos Passos

Para implementar a funcionalidade completa de internacionalização:

1. Instalar Vue I18n:
```bash
npm install vue-i18n@9
```

2. Criar arquivos de tradução em `src/locales/`
3. Configurar o plugin no `main.ts`
4. Conectar o seletor de idiomas com o sistema de tradução

## 📱 Responsividade

O layout é totalmente responsivo com breakpoints:
- **Mobile**: < 576px
- **Tablet**: 576px - 991px
- **Desktop**: > 991px

## 🎨 Customização

### Cores Principais
- Primária: `#667eea` / `#764ba2` (Gradiente)
- Secundária: Bootstrap padrão
- Sucesso: `#50C878`
- Informação: `#4A90E2`

### Imagens Placeholder
As imagens estão usando placeholders do `via.placeholder.com`. Substitua pelos URLs reais das imagens do projeto.

## 📝 Notas

- O sistema de idiomas está preparado mas requer implementação do Vue I18n para funcionar completamente
- As rotas estão usando âncoras (#) - implementar Vue Router para navegação real
- Adicionar imagens reais no diretório `public/` ou `src/assets/`

