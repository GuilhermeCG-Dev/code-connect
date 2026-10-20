import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { PaginationMetaDto } from '../common/pagination.js';
import type { Paginated } from '../common/pagination.js';
import { uploadsDir } from '../common/uploads.js';
import { DATABASE } from '../database/database.constants.js';
import type { Database } from '../database/database.types.js';
import { comments, likes, posts, users } from '../database/schema.js';
import type { CreatePostDto } from './dto/create-post.dto.js';
import type { ListPostsQueryDto } from './dto/list-posts-query.dto.js';
import type { PostRow } from './dto/post-response.dto.js';

export interface ThumbnailFile {
  buffer: Buffer;
  mimetype: string;
}

const extensions: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

@Injectable()
export class PostsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(
    query: ListPostsQueryDto,
    viewerId?: string,
  ): Promise<Paginated<PostRow>> {
    const { page, limit, q, sort } = query;
    const tsQuery = q ? sql`websearch_to_tsquery('portuguese', ${q})` : null;
    const where = tsQuery
      ? sql`${posts.searchVector} @@ ${tsQuery}`
      : undefined;

    const columns = this.columns(viewerId);
    const orderBy: SQL[] = [];
    if (tsQuery) {
      orderBy.push(desc(sql`ts_rank(${posts.searchVector}, ${tsQuery})`));
    } else if (sort === 'popular') {
      orderBy.push(desc(columns.likesCount));
    }
    orderBy.push(desc(posts.createdAt), desc(posts.id));

    const [items, [{ total }]] = await Promise.all([
      this.db
        .select(columns)
        .from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .where(where)
        .orderBy(...orderBy)
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ total: count() }).from(posts).where(where),
    ]);

    return { items, meta: PaginationMetaDto.of(page, limit, total) };
  }

  async findOne(id: string, viewerId?: string): Promise<PostRow> {
    const [post] = await this.db
      .select(this.columns(viewerId))
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .where(eq(posts.id, id))
      .limit(1);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async create(
    dto: CreatePostDto,
    authorId: string,
    thumbnail?: ThumbnailFile,
  ): Promise<PostRow> {
    const thumbnailPath = thumbnail
      ? await this.saveThumbnail(thumbnail)
      : null;
    const [post] = await this.db
      .insert(posts)
      .values({
        authorId,
        title: dto.title,
        body: dto.body,
        tags: dto.tags,
        thumbnailPath,
      })
      .returning({ id: posts.id });
    return this.findOne(post.id, authorId);
  }

  async like(postId: string, userId: string): Promise<void> {
    await this.assertExists(postId);
    await this.db
      .insert(likes)
      .values({ postId, userId })
      .onConflictDoNothing();
  }

  async unlike(postId: string, userId: string): Promise<void> {
    await this.assertExists(postId);
    await this.db
      .delete(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
  }

  async assertExists(postId: string): Promise<void> {
    const [post] = await this.db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }

  private columns(viewerId?: string) {
    return {
      id: posts.id,
      title: posts.title,
      body: posts.body,
      tags: posts.tags,
      thumbnailPath: posts.thumbnailPath,
      createdAt: posts.createdAt,
      authorId: users.id,
      authorName: users.name,
      likesCount: sql<number>`(select count(*)::int from ${likes} where ${likes.postId} = ${posts.id})`,
      commentsCount: sql<number>`(select count(*)::int from ${comments} where ${comments.postId} = ${posts.id})`,
      likedByMe: viewerId
        ? sql<boolean>`exists(select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${viewerId})`
        : sql<boolean>`false`,
    };
  }

  private async saveThumbnail(file: ThumbnailFile): Promise<string> {
    const fileName = `${randomUUID()}.${extensions[file.mimetype] ?? 'img'}`;
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, fileName), file.buffer);
    return fileName;
  }
}
