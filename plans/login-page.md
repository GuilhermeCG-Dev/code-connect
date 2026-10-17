# Página de Login — CodeConnect (apps/web)

## Context
App web ainda é template Vite (`App.tsx`, `App.css`, `index.css` com tokens do Vite). Objetivo: implementar página de Login fiel ao mockup, com Atomic Design + Tailwind v4, deixando layout base pronto para página de Cadastro (mesmo layout, banner e campos diferentes — não implementar agora).

Assets:
- `public/banner-login-desktop.png` (logo CodeConnect já embutida na imagem)
- `public/Github.png`, `public/Google.png`
- Ícones SVG em `images/Assets CodeConnect - Next/Ícones/SVG/` (nomes trocados: `arrow_forward.svg` é na verdade o ícone de lixeira; `assignment.svg` é a prancheta verde do "Crie seu cadastro!"). Logo para decoração de fundo: `images/Assets CodeConnect - Next/Logo/Logo_Large.svg`.

## Design tokens (`src/index.css`)
Substituir CSS do template Vite por:
```css
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600&display=swap');
@import "tailwindcss";
@theme {
  --font-sans: "Prompt", system-ui, sans-serif;
  --color-page: #01080e;      /* fundo da página */
  --color-surface: #171d1f;   /* card */
  --color-accent: #81fe88;    /* verde: botão, links */
  --color-field: #888888;     /* fundo dos inputs */
  --color-offwhite: #e1e1e1;  /* texto principal */
  --color-ink: #132e35;       /* texto sobre verde */
  --color-muted: #bcbcbc;     /* texto secundário */
}
```
`body`: `bg-page text-offwhite font-sans`. Remover `App.css` e assets do template (`hero.png`, `react.svg`, `vite.svg`). `index.html`: `lang="pt-BR"`, `<title>CodeConnect</title>`.

## Componentes (`src/components/`, cada um com `X.tsx`, `X.test.tsx`, `index.ts`)

**atoms/**
- `Button` — `variant: 'primary'` (verde, texto ink), `type`, `children`, `icon?` à direita, `fullWidth`.
- `Input` — `<input>` estilizado (bg-field, rounded), repassa props nativas (`ComponentProps<'input'>`).
- `Label` — `<label htmlFor>`.
- `Checkbox` — checkbox nativo + label ("Lembrar-me"), borda verde.
- `TextLink` — `<a>` com variantes `underline` (Esqueci a senha) e `accent` (verde, Crie seu cadastro).
- `Icon` — SVGs inline (`name: 'arrow-forward' | 'assignment'`), `aria-hidden`, cor via `currentColor`.
- `Heading` — `h1`/`h2` com estilos do título "Login".
- `Divider` — linha com texto central ("ou entre com outras contas").

**molecules/**
- `FormField` — Label + Input (gera id com `useId`), props `label`, `...inputProps`. Reutilizável em Cadastro (nome, email, senha).
- `SocialButton` — botão com `<img>` do logo + legenda ("Github", "Gmail"); `onClick`.
- `AuthFooterLink` — "Ainda não tem conta?" + TextLink accent com Icon. Props `question`, `linkText`, `href`, para reuso invertido no Cadastro ("Já tem conta? Faça seu login!").

**organisms/**
- `SocialLogin` — Divider + lista de SocialButton (`providers` prop com default Github/Google).
- `LoginForm` — Heading "Login", subtítulo, FormField email/usuário, FormField senha, Checkbox + TextLink "Esqueci a senha", Button "Login →". Estado controlado local do formulário; prop `onSubmit({ identifier, password, remember })`. Sem chamada à API (API ainda sem CORS/proxy e sem endpoint de auth).

**templates/**
- `AuthTemplate` — layout base reutilizável: fundo `bg-page` com decoração do logo em baixa opacidade (canto sup. esq. e inf. dir., `aria-hidden`), card `bg-surface rounded-[32px]` com duas colunas: esquerda `<img src={bannerSrc} alt={bannerAlt}>`, direita slot `children` + slot `footer`. Props: `bannerSrc`, `bannerAlt`, `children`, `footer?`. Responsivo: em telas < md, coluna única, banner oculto ou reduzido. Cadastro usará o mesmo template com outro banner e outro form.

**pages/**
- `LoginPage` — `AuthTemplate bannerSrc="/banner-login-desktop.png"` + `LoginForm` + `SocialLogin` + `AuthFooterLink href="/cadastro"`. `onSubmit` por ora só `console.info` (placeholder até existir endpoint).

Logo de decoração: copiar `Logo_Large.svg` para `public/logo-decoration.svg` (ou inline em atom `Logo`), sem valores hardcoded fora do tema.

`App.tsx` renderiza `<LoginPage />` (sem router por enquanto; adicionar `react-router` quando Cadastro existir).

## Testes (Vitest + RTL + user-event, imports explícitos de `vitest`)
- Atoms: render por role/texto; Button dispara `onClick`; Checkbox alterna `checked`; Input aceita digitação.
- FormField: label associado (`getByLabelText('Email ou usuário')`).
- SocialButton: `getByRole('button', { name: /github/i })` + clique.
- AuthFooterLink: link com `href` correto.
- LoginForm: digitar email/senha, marcar lembrar, clicar Login → `onSubmit` chamado com valores.
- AuthTemplate: renderiza banner (`getByRole('img', { name })`) e children.
- LoginPage: smoke — heading "Login", campos, botões sociais, link cadastro.

## Arquivos críticos
- `apps/web/src/index.css`, `apps/web/src/App.tsx`, `apps/web/index.html`
- Remover: `apps/web/src/App.css`, `apps/web/src/assets/*`
- Novo: `apps/web/src/components/{atoms,molecules,organisms,templates,pages}/**`

## Verificação
1. `pnpm test:web` — todos os testes passam.
2. `pnpm lint` e `pnpm build` (tsc strict: sem unused, `import type`).
3. `pnpm dev:web` → http://localhost:5173, comparar visualmente com mockup (desktop 1920 e mobile).
4. Commit: `feat(web): add login page with auth template`.
