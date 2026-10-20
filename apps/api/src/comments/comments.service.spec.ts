import { NotFoundException } from '@nestjs/common';
import type { Database } from '../database/database.types.js';
import { posts, users } from '../database/schema.js';
import { PostsService } from '../posts/posts.service.js';
import { createTestDatabase } from '../test/create-test-database.js';
import { CommentsService } from './comments.service.js';

describe('CommentsService', () => {
  let db: Database;
  let service: CommentsService;
  let userId: string;
  let postId: string;

  beforeEach(async () => {
    db = await createTestDatabase();
    service = new CommentsService(db, new PostsService(db));
    const [user] = await db
      .insert(users)
      .values({ name: 'Ana', email: 'ana@codeconnect.dev', passwordHash: 'x' })
      .returning();
    userId = user.id;
    const [post] = await db
      .insert(posts)
      .values({ authorId: userId, title: 'Post', body: 'Corpo' })
      .returning();
    postId = post.id;
  });

  it('should create a comment with its author', async () => {
    const comment = await service.create(postId, userId, { body: 'Legal!' });

    expect(comment).toMatchObject({
      body: 'Legal!',
      authorId: userId,
      authorName: 'Ana',
    });
  });

  it('should list comments newest first with pagination metadata', async () => {
    await service.create(postId, userId, { body: 'Primeiro' });
    await service.create(postId, userId, { body: 'Segundo' });

    const result = await service.findAll(postId, { page: 1, limit: 1 });

    expect(result.items.map((comment) => comment.body)).toEqual(['Segundo']);
    expect(result.meta).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
  });

  it('should throw NotFoundException for an unknown post', async () => {
    const unknownId = '00000000-0000-4000-8000-000000000000';

    await expect(
      service.findAll(unknownId, { page: 1, limit: 12 }),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.create(unknownId, userId, { body: 'Oi' }),
    ).rejects.toThrow(NotFoundException);
  });
});
