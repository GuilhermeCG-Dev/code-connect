# Plano: feed de posts, detalhe, likes e comentários

> Primeiro passo da execução: copiar este plano para `plans/feed-posts.md` (pedido do usuário: "salve o plano em /plans").

## Contexto
Hoje a API só tem `users` e `auth`, e a web só tem login e cadastro (sem router, sem layout logado). Objetivo: página de feed (design CodeConnect), página de detalhe do post, criação de post com upload de thumbnail, likes e comentários, busca full text no backend e seed com posts mockados.

Regras de acesso:
- Anônimo vê feed e detalhe. Não curte nem comenta (UI desabilitada + API responde `401`).
- Logado cria posts, curte e comenta.
- Menu lateral mostra "Login" ou "Sair" conforme a sessão.

**Figma:** o link `design/SNUtNcS0UYcgPYfTl2bo` é rejeitado pelo MCP (fileKey com 20 caracteres, mínimo 22) e o link da comunidade não é lido pelo MCP. Antes de começar a UI, tentar de novo com o link "Copy link to selection" da cópia do arquivo. Se continuar falhando, implementar a partir dos assets em `images/Assets CodeConnect - Next/` e do padrão visual do `AuthTemplate` (fundo `page`, cards `surface`, destaque `accent`).

## Backend (`apps/api`)

### 1. Schema e migration (`src/database/schema.ts`)
- `posts`: `id uuid pk`, `authorId uuid fk users on delete cascade`, `title varchar(150)`, `body text`, `tags text[] default '{}'`, `thumbnailPath text null`, `createdAt`, `updatedAt`.
  - `searchVector tsvector` gerada: `generatedAlwaysAs(sql\`setweight(to_tsvector('portuguese', coalesce(title,'')), 'A') || setweight(to_tsvector('portuguese', array_to_string(tags,' ')), 'B') || setweight(to_tsvector('portuguese', body), 'C')\`)`. Tipo via `customType` do Drizzle.
  - Índices: GIN em `searchVector`, btree em `createdAt`.
- `likes`: `userId fk`, `postId fk` (ambos `on delete cascade`), `createdAt`. PK composta `(userId, postId)`.
- `comments`: `id uuid pk`, `postId fk cascade`, `authorId fk cascade`, `body varchar(1000)`, `createdAt`. Índice em `(postId, createdAt)`.
- `pnpm api db:generate --name create_posts_likes_comments`. Conferir o SQL gerado (coluna gerada + GIN). Se o Drizzle não gerar a coluna gerada corretamente, ajustar o SQL antes de aplicar (migration ainda não aplicada).
- Confirmar que PGlite suporta a config `portuguese` (os testes unitários rodam as migrations reais).

### 2. Auth opcional (`src/auth/`)
- `OptionalAuthGuard`: sem header `Authorization`, segue anônimo. Com token válido, define `request.user`. Com token inválido, `401`.
- Exportar `AuthGuard` e `OptionalAuthGuard` do `AuthModule` para o `PostsModule`.

### 3. Upload de thumbnail
- `FileInterceptor('thumbnail')` do `@nestjs/platform-express` (multer já vem nele), `diskStorage` em `apps/api/uploads/` com nome `uuid + extensão`. Adicionar `uploads/` ao `.gitignore` da API. Dev dep `@types/multer` (versão exata, conferir publisher/integrity como no plano do axios).
- `ParseFilePipe` com `fileIsRequired: false`, `MaxFileSizeValidator` 2 MB, `FileTypeValidator` `image/(png|jpeg|webp)`. Inválido: `400`.
- `main.ts`: `NestFactory.create<NestExpressApplication>` e `app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads' })`. Pelo proxy do Vite fica `/api/uploads/...`.
- Respostas trazem `thumbnailUrl: '/uploads/<arquivo>' | null`. O post nunca inventa imagem: `null` significa "sem thumbnail".

### 4. Módulo `posts` (`nest g resource posts`, sem CRUD desnecessário)
Controller só HTTP, service com regras e queries.

| Método | URI | Auth | Resposta |
|---|---|---|---|
| `GET` | `/posts?q=&sort=recent\|popular&page=1&limit=12` | opcional | `200` `{ items: PostSummaryDto[], meta: { page, limit, total, totalPages } }` |
| `GET` | `/posts/:id` | opcional | `200` `PostDetailDto`, `404` |
| `POST` | `/posts` (multipart: `title`, `body`, `tags`, `thumbnail?`) | obrigatória | `201` + `Location: /posts/:id` |
| `PUT` | `/posts/:id/like` | obrigatória | `204` (idempotente, `onConflictDoNothing`), `404` |
| `DELETE` | `/posts/:id/like` | obrigatória | `204` (idempotente), `404` |
| `GET` | `/posts/:id/comments?page&limit` | pública | `200` `{ items: CommentDto[], meta }`, `404` |
| `POST` | `/posts/:id/comments` | obrigatória | `201` + `Location: /posts/:id/comments/:commentId`, `404` |

- Busca: com `q`, filtra `searchVector @@ websearch_to_tsquery('portuguese', q)` e ordena por `ts_rank` e depois `createdAt desc`. Sem `q`, `sort=recent` (`createdAt desc`) ou `popular` (`likesCount desc, createdAt desc`).
- `likesCount` e `commentsCount` via subqueries `count(*)`. `likedByMe` só quando há `request.user` (senão `false`).
- DTOs (`class-validator` + Swagger): `ListPostsQueryDto` (`q` trim max 100, `sort` `IsIn`, `page`/`limit` `@Type(() => Number)` `IsInt Min/Max(50)`), `CreatePostDto` (`title` 3–150, `body` 1–10000, `tags` transformado de `"react, css"` ou array em `string[]`, máx. 5, cada uma ≤ 30, minúsculas), `CreateCommentDto` (`body` 1–1000), `PostSummaryDto` (`id`, `title`, `excerpt` ~160 chars, `tags`, `thumbnailUrl`, `author { id, name }`, `likesCount`, `commentsCount`, `likedByMe`, `createdAt`), `PostDetailDto` (summary + `body`), `CommentDto` (`id`, `body`, `author`, `createdAt`). Mapear com `fromEntity`/`fromRow`, nunca expor `passwordHash`/`email` do autor.

### 5. Seed (`src/database/seed.ts`)
- Script `"db:seed": "nest build && node dist/database/seed.js"` (evita `tsx`). Usa `DATABASE_URL`.
- Sem faker: listas fixas em português (títulos, parágrafos, tags como `react`, `css`, `acessibilidade`, `nestjs`...) combinadas com PRNG determinístico (seed fixa), para o resultado ser estável.
- Cria 6 usuários (`upsert` por email, todos com a mesma senha `123456789`, hash com `hashPassword`), apaga posts/likes/comments existentes e cria 40 posts com datas espalhadas nos últimos 60 dias, likes e comentários aleatórios.
- Thumbnails: copia `images/Assets CodeConnect - Next/Imagens Cards/IMG1..IMG12/IMGn - Detalhes desktop.png` para `uploads/`. ~25% dos posts ficam com `thumbnailPath = null` para exercitar o placeholder.
- Documentar `pnpm api db:seed` no `CLAUDE.md` e no `.env.example` se precisar.

### 6. Testes API
- Unit (`posts.service.spec.ts`, PGlite): busca full text acha por título/tag/corpo e ordena por relevância, paginação + meta, `popular`, `likedByMe`, like/unlike idempotentes, `404` em post inexistente, comentários paginados.
- `optional-auth.guard.spec.ts`: sem token, token válido, token inválido.
- E2E (`test/posts.e2e-spec.ts`): anônimo lista e vê detalhe; anônimo recebe `401` em `POST /posts`, like e comentário; logado cria post com `.attach('thumbnail', ...)` e recebe `Location`; arquivo inválido `400`; like/unlike `204`. `beforeEach` apaga `comments`, `likes`, `posts`, `users` nessa ordem; atualizar `auth.e2e-spec.ts` igual. Apontar uploads de teste para pasta temporária (`UPLOADS_DIR` por env).

## Frontend (`apps/web`)

### 7. Dependência e rotas
- `react-router` v7 com versão exata (`--save-exact`). Antes de instalar: conferir publisher (trusted publishing), integrity e dependências no npm, registrar no plano como foi feito com o axios.
- `main.tsx`: `BrowserRouter` + `AuthProvider`. `App.tsx` vira `<Routes>`:
  - layout `AppLayout` (rota sem path) com `/` → `FeedPage`, `/posts/:id` → `PostDetailPage`, `/posts/new` → `NewPostPage` (protegida: anônimo vai para `/login`).
  - `/login` → `LoginPage`, `/cadastro` → `SignupPage` (continuam no `AuthTemplate`).
- Login e cadastro: resolver os TODOs, chamar `auth.signIn` do contexto e `navigate('/')`. Atualizar links internos (`AuthFooterLink`, `TextLink`) para o novo path `/login`.

### 8. Sessão (`src/contexts/AuthContext.tsx`)
- `AuthProvider`: no mount, se `getToken()` existe, chama `getProfile()`. Estado `{ user, status: 'loading' | 'authenticated' | 'anonymous' }`. `signIn(token, remember)` (salva token + carrega perfil), `signOut()` (`clearToken`). `401` no perfil limpa o token.
- Interceptor de response em `services/api.ts`: `401` em rota autenticada limpa o token (sessão expirada em 1h).
- Hook `useAuth()`. Só pages e o layout usam o hook; componentes recebem props.

### 9. Serviço `src/services/posts.ts`
`listPosts({ q, sort, page })`, `getPost(id)`, `createPost(FormData)`, `likePost(id)`, `unlikePost(id)`, `listComments(id, page)`, `createComment(id, body)`, tipos espelhando os DTOs e `assetUrl(path)` (prefixa `VITE_API_URL ?? '/api'`).

### 10. Componentes (Atomic Design, cada um com pasta, `index.ts` e teste)
Assets: copiar para `public/` o logo (`Logo/Logo_Large.svg`), placeholder (`Imagens Cards/Placeholder/IMG13 - Detalhes desktop.png` como `thumbnail-placeholder.png`) e um avatar padrão (`Imagens Gerais/Avatar (4).png`). Ícones novos entram como paths no atom `Icon` (`feed`, `account_circle`, `info`, `logout`, `code`, `search`, `chat`, `share`, `thumb_up`, `thumb_up_outline`), conferindo o desenho real de cada SVG (nomes do pacote estão trocados, ver `plans/login-page.md`). Atualizar o `Record<IconName, string>` do `AuthFooterLink`.

- **atoms:** `Icon` (novos nomes), `Button` (nova variante `outline`, suporte a `type`/`disabled` já existente), `Logo`, `Avatar` (`src` opcional, fallback avatar padrão), `PostThumbnail` (`src: string | null`, `alt`; usa placeholder quando `null` e troca para placeholder no `onError`; `loading="lazy"`), `Textarea`, `Tag`.
- **molecules:** `SearchBar` (input + ícone, `onSearch`, submit no Enter, `role="search"`), `NavItem` (ícone + label, `Link`/`NavLink` ou botão), `ActionButton` (ícone + contador, `pressed`, `disabled` com `title` "Faça login para curtir"), `AuthorBadge` (avatar + `@nome`), `CommentItem`, `Pagination` (anterior/próxima + "página X de Y"), `SortTabs` ("Recentes" / "Populares").
- **organisms:** `Sidebar` (logo, botão "Publicar" só logado, links Feed/Perfil/Sobre nós, último item `Login` → `/login` ou `Sair` → `onSignOut`; props `isAuthenticated`, `onSignOut`), `PostCard` (thumbnail, título, excerpt, tags, ações code/like/comentários e autor; card inteiro linka para `/posts/:id`), `PostGrid` (lista + estado vazio "Nenhum post encontrado para ‹q›"), `PostDetail` (thumbnail grande, título, corpo, tags, ações), `CommentSection` (lista + `CommentForm` quando logado, senão link "Faça login para comentar"), `PostForm` (título, corpo, tags, input file com preview; `isSubmitting`, `error`).
- **templates:** `AppTemplate` (slots `sidebar`, `header`, `children`; grid sidebar + coluna principal, responsivo: sidebar vira barra superior/inferior no mobile). Reaproveitado por feed, detalhe e novo post.
- **pages:**
  - `AppLayout`: lê `useAuth`, monta `AppTemplate` com `Sidebar` e `SearchBar` no header; `<Outlet />`. A busca navega para `/?q=...` (no detalhe também volta ao feed filtrado).
  - `FeedPage`: lê `q`, `sort`, `page` de `useSearchParams`, chama `listPosts`, estados loading/erro/vazio, `SortTabs`, `PostGrid`, `Pagination`. Like otimista com rollback em erro.
  - `PostDetailPage`: `getPost` + `listComments`, like, comentário (insere no topo após `201`), `404` mostra mensagem "Post não encontrado".
  - `NewPostPage`: `PostForm` → `createPost` → `navigate('/posts/:id')`; erros `400`/`401` em português.

Estilo: só tokens do `@theme` e escala padrão do Tailwind. Cor nova (ex.: borda/realce de card) entra primeiro em `src/index.css` com nome por papel.

### 11. Testes web
- Cada componente: render + interação principal (ex.: `PostThumbnail` mostra placeholder com `src=null` e após `error`; `Sidebar` mostra "Login" anônimo e "Sair" logado, `Sair` chama `onSignOut`; `ActionButton` desabilitado anônimo; `SearchBar` chama `onSearch` no Enter).
- `AuthContext.test.tsx`: carrega perfil com token, `signOut` limpa.
- Pages com `vi.mock('../../../services/posts')` + `MemoryRouter`: feed envia `q` da URL, paginação, vazio; detalhe anônimo sem formulário de comentário e like desabilitado; logado comenta e curte; `NewPostPage` redireciona anônimo e envia `FormData`.
- `src/test/a11y.test.tsx`: adicionar `FeedPage`, `PostDetailPage`, `NewPostPage` (com providers).
- Atualizar testes de `LoginPage`/`SignupPage` para o redirect.

## Documentação
- `CLAUDE.md`: remover a frase "no dev proxy" (já existe), documentar rotas da web, `AuthProvider`, `pnpm api db:seed`, pasta `uploads/`.

## Verificação
```bash
pnpm db:up
pnpm api db:migrate
pnpm api db:seed
pnpm test            # unit web + api
pnpm api test:e2e
pnpm lint
pnpm build
pnpm dev
```
Manual em `http://localhost:5173`:
1. Anônimo: feed carrega com thumbnails e placeholders, busca "react" filtra (conferir também uma palavra só do corpo), paginação, detalhe abre, like desabilitado, sem formulário de comentário, menu mostra "Login".
2. Login: redireciona ao feed, menu mostra "Sair" e "Publicar"; curtir/descurtir atualiza contador; comentar aparece na lista.
3. Criar post com e sem imagem; imagem > 2 MB ou `.gif` mostra erro; post sem imagem usa placeholder.
4. Sair: volta ao estado anônimo. Swagger em `http://localhost:3000/docs` lista os novos endpoints.
5. Se o Figma estiver acessível, comparar screenshot do frame com a página renderizada.

## Commits
- `docs(root): add feed and posts plan`
- `feat(api): add posts, likes and comments schema`
- `feat(api): add optional auth guard`
- `feat(api): add posts module with full text search`
- `feat(api): add thumbnail upload`
- `feat(api): add likes and comments endpoints`
- `feat(api): add database seed with mock posts`
- `build(web): add react-router`
- `feat(web): add router and auth context`
- `feat(web): add feed atoms and molecules`
- `feat(web): add sidebar, post card and app template`
- `feat(web): add feed and post detail pages`
- `feat(web): add new post page`
- `docs(root): document feed, seed and uploads`
