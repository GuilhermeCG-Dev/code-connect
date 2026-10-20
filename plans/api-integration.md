# Plano: integrar web com a API de autenticação

## Contexto
`apps/api` já expõe cadastro, login e perfil, documentados no Swagger (`/docs`). As páginas `LoginPage` e `SignupPage` em `apps/web` ainda só fazem `console.info` (TODOs em `LoginPage.tsx` e `SignupPage.tsx`). Objetivo: ligar os formulários à API usando axios.

Endpoints:
- `POST /users`: body `{ name, email, password }`. `password` com mínimo de 8 caracteres, `name` com máximo de 100. Retorna `201` + `UserResponseDto` (`id`, `name`, `email`, `createdAt`) e header `Location`. `409` se o email já existe, `400` se a entrada é inválida.
- `POST /auth/login`: body `{ email, password }`. Retorna `200` + `{ accessToken }`. `401` se as credenciais são inválidas.
- `GET /auth/profile`: header `Authorization: Bearer <token>`. Retorna `UserResponseDto`. `401` sem token ou com token inválido, `404` se o usuário não existe mais.

Erros seguem o formato padrão do Nest: `{ statusCode, message, error }`. Em erro de validação, `message` é `string[]`.

## Dependência: axios

**Versão aprovada: `axios@1.20.0`, fixa (sem `^`).**

Nunca usar `1.14.1` nem `0.30.4` (versões comprometidas no ataque de supply chain, que injetava a dependência `plain-crypto-js`).

Verificação feita em 2026-10-19:
- `latest` = `1.20.0`, publicada em 2026-08-26.
- Publicada pelo GitHub Actions via trusted publisher (OIDC), aprovada por `jasonsaayman`. A versão comprometida foi publicada manualmente por uma conta sequestrada.
- Integrity: `sha512-r8aOh8j9cGKpgQAqpzrUHnSIc6a59Y3Xf/cv8sy1DrHCkZHzQGEuoq1tARk6qSyDdtQGSDgpb9kFlruzPvrgwg==`
- Signature keyid: `SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U`
- Dependências: `form-data ^4.0.6`, `proxy-from-env ^2.1.0`, `follow-redirects ^1.16.0`, `https-proxy-agent ^5.0.1`. `https-proxy-agent` entrou na `1.18.x` e é um pacote legítimo.

Comando:
```bash
pnpm web add axios@1.20.0 --save-exact
```
Depois de instalar, confirmar que `pnpm-lock.yaml` registra o mesmo integrity e que `plain-crypto-js` não aparece no lockfile.

Qualquer upgrade futuro do axios precisa de nova validação manual antes da instalação.

## Mudanças

### 1. Proxy no Vite (`apps/web/vite.config.ts`)
Adicionar `server.proxy`: `/api` vai para `http://localhost:3000`, com `rewrite` que remove o prefixo `/api`. Assim o browser vê a mesma origem e a API não precisa de CORS. URL base configurável por `VITE_API_URL` (default `/api`) para produção.

### 2. Cliente HTTP (`apps/web/src/services/api.ts`)
- `axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' })`.
- Interceptor de request que lê o token do storage e adiciona `Authorization: Bearer <token>`.
- Helper `getErrorMessage(error)`: lê `message` do corpo de erro (string ou `string[]`) e tem fallback para uma mensagem genérica em português.

### 3. Serviço de autenticação (`apps/web/src/services/auth.ts`)
- Tipos espelhando os DTOs: `User`, `LoginRequest`, `LoginResponse`, `SignupRequest`.
- `signup(data)`, `login(data)`, `getProfile()`.
- Armazenamento do token: `saveToken(token, remember)`. Usa `localStorage` se "Lembrar-me" estiver marcado, senão `sessionStorage`. Também `getToken()` e `clearToken()`. Todo acesso ao storage fica em `try/catch`.

### 4. Formulários (organisms)
- `LoginForm`: trocar o campo "Email ou usuário" por "Email" (`type="email"`, `autoComplete="email"`), porque a API só aceita email. Renomear `identifier` para `email` em `LoginValues`.
- `LoginForm` e `SignupForm`: novas props `isSubmitting` (desabilita o botão) e `error` (mensagem com `role="alert"`). O organism continua sem chamar a API.

### 5. Páginas
- `SignupPage`: chama `signup`. Em caso de sucesso, faz login automático com as mesmas credenciais, salva o token e redireciona. Em caso de `409`, mostra "Este email já está cadastrado".
- `LoginPage`: chama `login`, salva o token respeitando "Lembrar-me" e redireciona. Em caso de `401`, mostra "Email ou senha inválidos".
- Destino depois do login: ainda não existe página logada. Redirecionar para `/` provisoriamente e anotar como TODO até existir o feed.
  - **Implementado diferente:** como `/` já é a página de login, o redirect não faria sentido. As páginas mostram uma mensagem `role="status"` ("Olá, {nome}!"). O login usa `GET /auth/profile` para obter o nome, o que prova o token de ponta a ponta. TODO no código para redirecionar ao feed.
  - As mensagens de erro são mapeadas pelo status HTTP, em português. As mensagens da API vêm em inglês (class-validator) e não são exibidas.

### 6. Testes
- `services/auth.test.ts`: mock do axios. Testa payloads, armazenamento do token por "Lembrar-me" e header `Authorization`.
- `LoginForm.test.tsx` e `SignupForm.test.tsx`: botão desabilitado quando `isSubmitting` é verdadeiro e mensagem de erro visível.
- `LoginPage.test.tsx` e `SignupPage.test.tsx`: `vi.mock` do serviço. Testam sucesso, erro `401`/`409` e estado de loading, sempre por roles e texto visível.

## Verificação
```bash
pnpm test:web
pnpm lint
pnpm build
pnpm dev   # cadastro e login manuais contra a API real; conferir no Swagger em http://localhost:3000/docs
```

## Commits
- `build(web): add axios 1.20.0`
- `feat(web): add vite proxy and auth service`
- `feat(web): connect login and signup pages to api`
