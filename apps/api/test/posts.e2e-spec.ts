import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { uploadsDir, uploadsPrefix } from './../src/common/uploads.js';
import { DATABASE } from './../src/database/database.constants.js';
import type { Database } from './../src/database/database.types.js';
import { comments, likes, posts, users } from './../src/database/schema.js';

const thumbnailPath = './test/fixtures/thumbnail.png';
const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('Posts and comments (e2e)', () => {
  let app: NestExpressApplication;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useStaticAssets(uploadsDir, { prefix: uploadsPrefix });
    await app.init();

    const db = app.get<Database>(DATABASE);
    await db.delete(comments);
    await db.delete(likes);
    await db.delete(posts);
    await db.delete(users);

    const credentials = {
      email: 'ana@codeconnect.dev',
      password: 'supersecret',
    };
    await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Ana Souza', ...credentials });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credentials);
    token = login.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  function createPost(fields: Record<string, string> = {}) {
    return request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('title', fields.title ?? 'Componentes em React')
      .field('body', fields.body ?? 'Como organizar componentes.')
      .field('tags', fields.tags ?? 'React, front-end');
  }

  describe('POST /posts', () => {
    it('should return 401 without a token', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .field('title', 'Sem login')
        .field('body', 'Corpo')
        .expect(401);
    });

    it('should create a post without thumbnail', async () => {
      const res = await createPost().expect(201);

      expect(res.headers.location).toBe(`/posts/${res.body.id}`);
      expect(res.body).toMatchObject({
        title: 'Componentes em React',
        body: 'Como organizar componentes.',
        tags: ['react', 'front-end'],
        thumbnailUrl: null,
        author: { name: 'Ana Souza' },
        likesCount: 0,
        commentsCount: 0,
      });
      expect(res.body.author).not.toHaveProperty('email');
    });

    it('should upload a thumbnail and serve it', async () => {
      const res = await createPost()
        .attach('thumbnail', thumbnailPath)
        .expect(201);

      expect(res.body.thumbnailUrl).toMatch(/^\/uploads\/[0-9a-f-]+\.png$/);
      await request(app.getHttpServer())
        .get(res.body.thumbnailUrl)
        .expect(200)
        .expect('Content-Type', 'image/png');
    });

    it('should return 400 for a file that is not an image', () => {
      return createPost()
        .attach('thumbnail', Buffer.from('not an image'), 'notes.txt')
        .expect(400);
    });

    it('should return 400 for a short title', () => {
      return createPost({ title: 'Oi' }).expect(400);
    });
  });

  describe('GET /posts', () => {
    it('should list posts for anonymous users', async () => {
      await createPost();
      await createPost({ title: 'APIs com NestJS', body: 'Módulos', tags: '' });

      const res = await request(app.getHttpServer()).get('/posts').expect(200);

      expect(res.body.meta).toEqual({
        page: 1,
        limit: 12,
        total: 2,
        totalPages: 1,
      });
      expect(res.body.items[0]).toMatchObject({
        title: 'APIs com NestJS',
        excerpt: 'Módulos',
        likedByMe: false,
      });
      expect(res.body.items[0]).not.toHaveProperty('body');
    });

    it('should filter with full text search', async () => {
      await createPost();
      await createPost({ title: 'APIs com NestJS', body: 'Módulos', tags: '' });

      const res = await request(app.getHttpServer())
        .get('/posts')
        .query({ q: 'nestjs' })
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].title).toBe('APIs com NestJS');
    });

    it('should return 400 for an invalid sort', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .query({ sort: 'oldest' })
        .expect(400);
    });

    it('should return 401 for an invalid token', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .set('Authorization', 'Bearer invalid')
        .expect(401);
    });
  });

  describe('GET /posts/:id', () => {
    it('should return the post for anonymous users', async () => {
      const created = await createPost();

      const res = await request(app.getHttpServer())
        .get(`/posts/${created.body.id}`)
        .expect(200);

      expect(res.body.body).toBe('Como organizar componentes.');
    });

    it('should return 404 for an unknown post', () => {
      return request(app.getHttpServer())
        .get(`/posts/${UNKNOWN_ID}`)
        .expect(404);
    });
  });

  describe('likes', () => {
    it('should return 401 for anonymous users', async () => {
      const created = await createPost();

      await request(app.getHttpServer())
        .put(`/posts/${created.body.id}/like`)
        .expect(401);
    });

    it('should like and unlike a post', async () => {
      const created = await createPost();
      const url = `/posts/${created.body.id}`;
      const auth = `Bearer ${token}`;

      await request(app.getHttpServer())
        .put(`${url}/like`)
        .set('Authorization', auth)
        .expect(204);
      const liked = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', auth);
      expect(liked.body).toMatchObject({ likesCount: 1, likedByMe: true });

      await request(app.getHttpServer())
        .delete(`${url}/like`)
        .set('Authorization', auth)
        .expect(204);
      const unliked = await request(app.getHttpServer()).get(url);
      expect(unliked.body).toMatchObject({ likesCount: 0, likedByMe: false });
    });
  });

  describe('comments', () => {
    it('should return 401 for anonymous users', async () => {
      const created = await createPost();

      await request(app.getHttpServer())
        .post(`/posts/${created.body.id}/comments`)
        .send({ body: 'Oi' })
        .expect(401);
    });

    it('should create and list comments', async () => {
      const created = await createPost();
      const url = `/posts/${created.body.id}/comments`;

      const res = await request(app.getHttpServer())
        .post(url)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'Ótimo post!' })
        .expect(201);
      expect(res.headers.location).toBe(`${url}/${res.body.id}`);

      const list = await request(app.getHttpServer()).get(url).expect(200);
      expect(list.body.items).toEqual([
        {
          id: res.body.id,
          body: 'Ótimo post!',
          author: { id: expect.any(String), name: 'Ana Souza' },
          createdAt: expect.any(String),
        },
      ]);
      expect(list.body.meta.total).toBe(1);
    });

    it('should return 400 for an empty comment', async () => {
      const created = await createPost();

      await request(app.getHttpServer())
        .post(`/posts/${created.body.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: '   ' })
        .expect(400);
    });

    it('should return 404 for an unknown post', () => {
      return request(app.getHttpServer())
        .get(`/posts/${UNKNOWN_ID}/comments`)
        .expect(404);
    });
  });
});
