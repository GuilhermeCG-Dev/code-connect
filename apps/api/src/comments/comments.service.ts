import { Inject, Injectable } from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';
import { PaginationMetaDto } from '../common/pagination.js';
import type { Paginated, PaginationQueryDto } from '../common/pagination.js';
import { DATABASE } from '../database/database.constants.js';
import type { Database } from '../database/database.types.js';
import { comments, users } from '../database/schema.js';
import { PostsService } from '../posts/posts.service.js';
import type { CommentRow } from './dto/comment-response.dto.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';

const columns = {
  id: comments.id,
  body: comments.body,
  createdAt: comments.createdAt,
  authorId: users.id,
  authorName: users.name,
};

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly postsService: PostsService,
  ) {}

  async findAll(
    postId: string,
    { page, limit }: PaginationQueryDto,
  ): Promise<Paginated<CommentRow>> {
    await this.postsService.assertExists(postId);
    const where = eq(comments.postId, postId);
    const [items, [{ total }]] = await Promise.all([
      this.db
        .select(columns)
        .from(comments)
        .innerJoin(users, eq(users.id, comments.authorId))
        .where(where)
        .orderBy(desc(comments.createdAt), desc(comments.id))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ total: count() }).from(comments).where(where),
    ]);
    return { items, meta: PaginationMetaDto.of(page, limit, total) };
  }

  async create(
    postId: string,
    authorId: string,
    dto: CreateCommentDto,
  ): Promise<CommentRow> {
    await this.postsService.assertExists(postId);
    const [comment] = await this.db
      .insert(comments)
      .values({ postId, authorId, body: dto.body })
      .returning({ id: comments.id });
    const [row] = await this.db
      .select(columns)
      .from(comments)
      .innerJoin(users, eq(users.id, comments.authorId))
      .where(eq(comments.id, comment.id));
    return row;
  }
}
