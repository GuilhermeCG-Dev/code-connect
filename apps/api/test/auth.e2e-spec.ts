import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DATABASE } from './../src/database/database.constants.js';
import type { Database } from './../src/database/database.types.js';
import { comments, likes, posts, users } from './../src/database/schema.js';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  const signup = {
    name: 'Ana Souza',
    email: 'ana@codeconnect.dev',
    password: 'supersecret',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const db = app.get<Database>(DATABASE);
    await db.delete(comments);
    await db.delete(likes);
    await db.delete(posts);
    await db.delete(users);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a user and return it without the password', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signup)
        .expect(201);

      expect(res.headers.location).toBe(`/users/${res.body.id}`);
      expect(res.body).toEqual({
        id: expect.any(String),
        name: 'Ana Souza',
        email: 'ana@codeconnect.dev',
        createdAt: expect.any(String),
      });
    });

    it('should return 400 for a password shorter than 8 characters', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ ...signup, password: 'short' })
        .expect(400);
    });

    it('should return 400 for unknown fields', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ ...signup, role: 'admin' })
        .expect(400);
    });

    it('should return 409 for a duplicate email', async () => {
      await request(app.getHttpServer()).post('/users').send(signup);

      return request(app.getHttpServer())
        .post('/users')
        .send({ ...signup, email: 'ANA@codeconnect.dev' })
        .expect(409);
    });
  });

  describe('POST /auth/login and GET /auth/profile', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/users').send(signup);
    });

    it('should return 401 for a wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: signup.email, password: 'wrongpass' })
        .expect(401);
    });

    it('should return 401 on profile without a token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should log in and return the logged user profile', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: signup.email, password: signup.password })
        .expect(200);

      expect(login.body.accessToken).toEqual(expect.any(String));

      const profile = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .expect(200);

      expect(profile.body).toMatchObject({
        name: signup.name,
        email: signup.email,
      });
      expect(profile.body).not.toHaveProperty('passwordHash');
    });
  });
});
