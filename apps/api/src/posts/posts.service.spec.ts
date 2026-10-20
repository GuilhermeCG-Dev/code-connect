import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NotFoundException } from '@nestjs/common';
import type { Database } from '../database/database.types.js';
import { posts, users } from '../database/schema.js';
import { createTestDatabase } from '../test/create-test-database.js';
import type { ListPostsQueryDto } from './dto/list-posts-query.dto.js';
import { PostsService } from './posts.service.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

function query(overrides: Partial<ListPostsQueryDto> = {}): ListPostsQueryDto {
  return { page: 1, limit: 12, sort: 'recent', ...overrides };
}

describe('PostsService', () => {
  let db: Database;
  let service: PostsService;
  let anaId: string;
  let beaId: string;

  beforeEach(async () => {
    db = await createTestDatabase();
    service = new PostsService(db);
    const [ana, bea] = await db
      .insert(users)
      .values([
        { name: 'Ana', email: 'ana@codeconnect.dev', passwordHash: 'x' },
        { name: 'Bea', email: 'bea@codeconnect.dev', passwordHash: 'x' },
      ])
      .returning();
    anaId = ana.id;
    beaId = bea.id;
  });

  async function insertPost(
    title: string,
    body: string,
    tags: string[],
    createdAt: Date,
  ): Promise<string> {
    const [post] = await db
      .insert(posts)
      .values({ authorId: anaId, title, body, tags, createdAt })
      .returning({ id: posts.id });
    return post.id;
  }

  describe('findAll', () => {
    let reactId: string;
    let cssId: string;
    let nestId: string;

    beforeEach(async () => {
      reactId = await insertPost(
        'Componentes em React',
        'Como organizar componentes reutilizáveis.',
        ['react', 'front-end'],
        new Date('2026-10-01'),
      );
      cssId = await insertPost(
        'Grid no CSS',
        'Layouts responsivos com grid e um pouco de react no final.',
        ['css'],
        new Date('2026-10-02'),
      );
      nestId = await insertPost(
        'APIs com NestJS',
        'Módulos, controllers e serviços.',
        ['nestjs', 'back-end'],
        new Date('2026-10-03'),
      );
    });

    it('should list the newest posts first with pagination metadata', async () => {
      const result = await service.findAll(query({ limit: 2 }));

      expect(result.items.map((post) => post.id)).toEqual([nestId, cssId]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
      });
      expect(result.items[0]).toMatchObject({
        authorName: 'Ana',
        likesCount: 0,
        commentsCount: 0,
        likedByMe: false,
      });

      const second = await service.findAll(query({ limit: 2, page: 2 }));
      expect(second.items.map((post) => post.id)).toEqual([reactId]);
    });

    it('should search title, tags and body, ranking title matches first', async () => {
      const result = await service.findAll(query({ q: 'react' }));

      expect(result.items.map((post) => post.id)).toEqual([reactId, cssId]);
      expect(result.meta.total).toBe(2);
    });

    it('should match Portuguese word variations', async () => {
      const result = await service.findAll(query({ q: 'serviço' }));

      expect(result.items.map((post) => post.id)).toEqual([nestId]);
    });

    it('should find posts by tag', async () => {
      const result = await service.findAll(query({ q: 'back-end' }));

      expect(result.items.map((post) => post.id)).toEqual([nestId]);
    });

    it('should return nothing when no post matches', async () => {
      const result = await service.findAll(query({ q: 'kotlin' }));

      expect(result.items).toEqual([]);
      expect(result.meta).toMatchObject({ total: 0, totalPages: 0 });
    });

    it('should sort by likes when sort is popular', async () => {
      await service.like(reactId, anaId);
      await service.like(reactId, beaId);
      await service.like(cssId, beaId);

      const result = await service.findAll(query({ sort: 'popular' }));

      expect(result.items.map((post) => post.id)).toEqual([
        reactId,
        cssId,
        nestId,
      ]);
      expect(result.items[0].likesCount).toBe(2);
    });

    it('should flag posts liked by the viewer', async () => {
      await service.like(cssId, beaId);

      const asBea = await service.findAll(query(), beaId);
      const anonymous = await service.findAll(query());

      expect(asBea.items.find((post) => post.id === cssId)?.likedByMe).toBe(
        true,
      );
      expect(anonymous.items.every((post) => !post.likedByMe)).toBe(true);
    });
  });

  describe('create', () => {
    let uploadsDir: string;

    beforeEach(async () => {
      uploadsDir = await mkdtemp(join(tmpdir(), 'uploads-'));
      vi.stubEnv('UPLOADS_DIR', uploadsDir);
      vi.resetModules();
    });

    afterEach(async () => {
      vi.unstubAllEnvs();
      await rm(uploadsDir, { recursive: true, force: true });
    });

    it('should create a post without thumbnail', async () => {
      const post = await service.create(
        { title: 'Novo post', body: 'Conteúdo', tags: ['react'] },
        anaId,
      );

      expect(post).toMatchObject({
        title: 'Novo post',
        tags: ['react'],
        thumbnailPath: null,
        authorName: 'Ana',
      });
    });

    it('should save the thumbnail file and store its name', async () => {
      const { PostsService: FreshPostsService } =
        await import('./posts.service.js');
      const freshService = new FreshPostsService(db);

      const post = await freshService.create(
        { title: 'Com imagem', body: 'Conteúdo', tags: [] },
        anaId,
        { buffer: Buffer.from('png-bytes'), mimetype: 'image/png' },
      );

      expect(post.thumbnailPath).toMatch(/^[0-9a-f-]{36}\.png$/);
      const saved = await readFile(join(uploadsDir, post.thumbnailPath ?? ''));
      expect(saved.toString()).toBe('png-bytes');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for an unknown post', async () => {
      await expect(service.findOne(UNKNOWN_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('like and unlike', () => {
    let postId: string;

    beforeEach(async () => {
      postId = await insertPost('Post', 'Corpo', [], new Date());
    });

    it('should be idempotent', async () => {
      await service.like(postId, beaId);
      await service.like(postId, beaId);
      expect((await service.findOne(postId, beaId)).likesCount).toBe(1);
      expect((await service.findOne(postId, beaId)).likedByMe).toBe(true);

      await service.unlike(postId, beaId);
      await service.unlike(postId, beaId);
      expect((await service.findOne(postId, beaId)).likesCount).toBe(0);
    });

    it('should throw NotFoundException for an unknown post', async () => {
      await expect(service.like(UNKNOWN_ID, beaId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.unlike(UNKNOWN_ID, beaId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
