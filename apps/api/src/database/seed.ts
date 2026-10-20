import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { uploadsDir } from '../common/uploads.js';
import { hashPassword } from '../users/password.js';
import { databaseUrl } from './database.constants.js';
import * as schema from './schema.js';
import { comments, likes, posts, users } from './schema.js';

// Fills the database with mock users, posts, likes and comments.
// Run with `pnpm api db:seed`. Posts, likes and comments are replaced on every run.

const PASSWORD = '123456789';
const POST_COUNT = 40;
const CARD_IMAGES_DIR = join(
  process.cwd(),
  '../../images/Assets CodeConnect - Next/Imagens Cards',
);

const people = [
  'Ana Souza',
  'Bruno Lima',
  'Carla Mendes',
  'Diego Rocha',
  'Elisa Martins',
  'Felipe Costa',
];

const topics = [
  { title: 'Componentes reutilizáveis em React', tags: ['react', 'front-end'] },
  { title: 'Hooks personalizados na prática', tags: ['react', 'hooks'] },
  { title: 'Layouts responsivos com CSS Grid', tags: ['css', 'layout'] },
  { title: 'Flexbox sem mistério', tags: ['css', 'front-end'] },
  { title: 'Acessibilidade em formulários', tags: ['acessibilidade', 'html'] },
  { title: 'Criando APIs REST com NestJS', tags: ['nestjs', 'back-end'] },
  {
    title: 'Validação de dados com class-validator',
    tags: ['nestjs', 'typescript'],
  },
  { title: 'Migrations com Drizzle ORM', tags: ['drizzle', 'postgres'] },
  { title: 'Busca full text no PostgreSQL', tags: ['postgres', 'back-end'] },
  { title: 'Tipos utilitários do TypeScript', tags: ['typescript'] },
  {
    title: 'Testes de componentes com Testing Library',
    tags: ['testes', 'react'],
  },
  { title: 'Design tokens com Tailwind CSS', tags: ['tailwind', 'design'] },
  { title: 'Autenticação com JWT', tags: ['segurança', 'back-end'] },
  { title: 'Monorepos com pnpm workspaces', tags: ['pnpm', 'ferramentas'] },
  { title: 'Conventional Commits no dia a dia', tags: ['git', 'ferramentas'] },
  {
    title: 'Otimizando imagens para a web',
    tags: ['performance', 'front-end'],
  },
];

const variants = [
  '',
  ': guia rápido',
  ': erros comuns',
  ' do zero',
  ' em projetos reais',
];

const paragraphs = [
  'Neste post eu mostro o caminho que segui para resolver esse problema em um projeto real, com exemplos de código e os erros que cometi no processo.',
  'A ideia é começar simples, entender os conceitos básicos e só depois partir para otimizações. Cada etapa tem um exemplo que você pode copiar e adaptar.',
  'Uma dica importante: escreva testes desde o início. Eles deixam a refatoração muito mais segura e ajudam a documentar o comportamento esperado.',
  'Também vale ler a documentação oficial. Ela costuma ter exemplos atualizados e explica os casos de borda que tutoriais rápidos deixam de lado.',
  'No final, deixei um repositório com o código completo e uma lista de links para quem quiser se aprofundar no assunto.',
  'Se você tiver outra abordagem, comenta aqui embaixo. Quero comparar soluções e aprender com a experiência de vocês.',
];

const commentBodies = [
  'Muito bom, obrigado por compartilhar!',
  'Esse exemplo me ajudou demais no trabalho.',
  'Não conhecia essa abordagem, vou testar.',
  'Tem o link do repositório?',
  'Excelente explicação, direto ao ponto.',
  'Passei por esse mesmo problema semana passada.',
  'Seria legal um post sobre testes disso também.',
];

// Small deterministic PRNG (mulberry32) so every run creates the same data.
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(42);
const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(random() * items.length)];
const between = (min: number, max: number): number =>
  min + Math.floor(random() * (max - min + 1));

function sample<T>(items: readonly T[], size: number): T[] {
  return [...items].sort(() => random() - 0.5).slice(0, size);
}

async function copyThumbnails(): Promise<string[]> {
  await mkdir(uploadsDir, { recursive: true });
  const fileNames: string[] = [];
  for (let n = 1; n <= 12; n++) {
    const fileName = `seed-img${n}.png`;
    await copyFile(
      join(CARD_IMAGES_DIR, `IMG${n}`, `IMG${n} - Detalhes desktop.png`),
      join(uploadsDir, fileName),
    );
    fileNames.push(fileName);
  }
  return fileNames;
}

async function seed(): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle({ client: pool, schema });
  try {
    const thumbnails = await copyThumbnails();
    const passwordHash = await hashPassword(PASSWORD);

    const seededUsers = await db
      .insert(users)
      .values(
        people.map((name) => ({
          name,
          email: `${name.split(' ')[0].toLowerCase()}@codeconnect.dev`,
          passwordHash,
        })),
      )
      .onConflictDoUpdate({
        target: users.email,
        set: { passwordHash },
      })
      .returning({ id: users.id, email: users.email });

    await db.delete(comments);
    await db.delete(likes);
    await db.delete(posts);

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const seededPosts = await db
      .insert(posts)
      .values(
        Array.from({ length: POST_COUNT }, () => {
          const topic = pick(topics);
          const createdAt = new Date(now - random() * 60 * DAY);
          return {
            authorId: pick(seededUsers).id,
            title: `${topic.title}${pick(variants)}`,
            body: sample(paragraphs, between(2, 4)).join('\n\n'),
            tags: topic.tags,
            // About 25% of the posts have no thumbnail, to show the placeholder.
            thumbnailPath: random() < 0.25 ? null : pick(thumbnails),
            createdAt,
            updatedAt: createdAt,
          };
        }),
      )
      .returning({ id: posts.id, createdAt: posts.createdAt });

    const likeRows = seededPosts.flatMap((post) =>
      sample(seededUsers, between(0, seededUsers.length)).map((user) => ({
        postId: post.id,
        userId: user.id,
      })),
    );
    if (likeRows.length > 0) {
      await db.insert(likes).values(likeRows);
    }

    const commentRows = seededPosts.flatMap((post) =>
      Array.from({ length: between(0, 5) }, () => ({
        postId: post.id,
        authorId: pick(seededUsers).id,
        body: pick(commentBodies),
        createdAt: new Date(
          post.createdAt.getTime() +
            random() * (now - post.createdAt.getTime()),
        ),
      })),
    );
    if (commentRows.length > 0) {
      await db.insert(comments).values(commentRows);
    }

    console.log(
      `Seeded ${seededUsers.length} users, ${seededPosts.length} posts, ` +
        `${likeRows.length} likes and ${commentRows.length} comments.`,
    );
    console.log(
      `Log in with any of: ${seededUsers.map((user) => user.email).join(', ')} ` +
        `(password: ${PASSWORD})`,
    );
  } finally {
    await pool.end();
  }
}

await seed();
