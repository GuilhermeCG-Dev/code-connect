# Plano: corrigir performance do Lighthouse em /cadastro

## Contexto
Lighthouse 13.4.1 em `http://localhost:5174/cadastro` mostra performance ruim:
- FCP 2.1 s (score 0.25)
- LCP 4.0 s (score 0.17)
- Speed Index 2.1 s (score 0.58)

O relatório colado foi truncado (limite de 50k caracteres). Só as métricas acima e o filmstrip chegaram. As auditorias de acessibilidade, SEO e boas práticas não estão visíveis, então este plano cobre só performance mais itens óbvios do código.

Causas encontradas no código:
1. **Medição no dev server do Vite.** Porta 5174 = `vite dev`: módulos ESM sem bundle, sem minificação, React em modo dev. Isso infla FCP e LCP. Toda medição precisa usar `vite build` + `vite preview`.
2. **Imagem LCP pesada.** `apps/web/public/banner-cadastro-desktop.png` tem 345 KB (407x683). `banner-login-desktop.png` tem 327 KB. É o maior elemento da página e o provável LCP.
3. **Imagem descoberta tarde e sem dimensões.** O `<img>` em `AuthTemplate.tsx:26` só aparece depois do JS rodar. Não tem `width`/`height` nem `fetchpriority`.
4. **Banner baixa no mobile mesmo invisível.** `hidden md:block` só esconde com `display:none`; o navegador baixa a imagem mesmo assim.
5. **Fonte em cadeia bloqueante.** `src/index.css:1` usa `@import url('https://fonts.googleapis.com/...')`. Cadeia: CSS do app → CSS do Google Fonts → arquivo da fonte. Sem `preconnect`.
6. **Sem `<meta name="description">`** em `index.html` (auditoria SEO padrão).

## Mudanças

### 1. Imagens do banner (maior ganho de LCP)
- Converter os dois banners para WebP (qualidade ~80), alvo < 60 KB cada. Ferramenta: `npx @squoosh/cli` ou `sharp-cli` uma vez, sem nova dependência no projeto. Gerar também versão 2x (814 px) para telas retina.
- Arquivos novos em `apps/web/public/`: `banner-cadastro-desktop.webp`, `banner-cadastro-desktop@2x.webp`, idem para login. Remover os `.png` antigos.
- Atualizar `bannerSrc` em `SignupPage.tsx:15` e `LoginPage.tsx:15`.

### 2. `AuthTemplate` (`apps/web/src/components/templates/AuthTemplate/AuthTemplate.tsx`)
- Trocar `<img>` por `<picture>` com `<source media="(min-width: 768px)" srcSet=...>` e `<img>` fallback que não baixa no mobile.
- Adicionar no `<img>`: `width={407}`, `height` (via nova prop `bannerHeight`, 683 cadastro / 636 login), `fetchPriority="high"`, `decoding="async"`. Não usar `loading="lazy"` (é LCP).
- Usar `preload` do `react-dom` (React 19) com `fetchPriority: 'high'` e `media: '(min-width: 768px)'` para o banner entrar no `<head>` cedo.
- Manter classes Tailwind (`w-100`, `h-168`/`h-156`); sem estilo inline (regra do CLAUDE.md).

### 3. Fonte Prompt
- Remover `@import url(...)` de `src/index.css:1`.
- Em `apps/web/index.html`: `<link rel="preconnect" href="https://fonts.googleapis.com">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` e `<link rel="stylesheet" href="...Prompt:wght@400;500;600&display=swap">`.
- `--font-sans` em `@theme` continua igual.

### 4. `index.html`
- Adicionar `<meta name="description" content="CodeConnect: comunidade para devs compartilharem projetos.">` e `<meta name="theme-color">` com a cor `page`.

### 5. Testes
- `AuthTemplate.test.tsx`: atualizar para a nova estrutura; testar que a imagem tem `alt`, `src`, `width` e `height`. Teste por role `img` (não por classe).
- Rodar testes de `SignupPage` e `LoginPage` se checarem `src`.

## Arquivos críticos
- `apps/web/src/components/templates/AuthTemplate/AuthTemplate.tsx` (+ `.test.tsx`)
- `apps/web/src/components/pages/SignupPage/SignupPage.tsx`, `LoginPage/LoginPage.tsx`
- `apps/web/src/index.css`
- `apps/web/index.html`
- `apps/web/public/banner-*.{png,webp}`

## Verificação
1. `pnpm test:web` e `pnpm lint` passam.
2. `pnpm build` (roda `tsc -b`) passa.
3. `pnpm web exec vite preview` e rodar Lighthouse em `http://localhost:4173/cadastro` e `/` (modo desktop e mobile). Meta: LCP < 2.5 s, FCP < 1.8 s.
4. DevTools > Network no mobile (< 768 px): banner não é baixado.
5. Conferir visualmente que layout e fonte não mudaram.

## Commit
`perf(web): optimize auth banner and font loading` (Conventional Commits, escopo `web`).

## Pendente
Relatório veio truncado. Se houver falhas de acessibilidade/SEO/boas práticas, colar só a lista de auditorias com `score < 1` (sem os filmstrips base64) para incluir no plano.
