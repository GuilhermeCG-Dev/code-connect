import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/pagination.js';
import { uploadUrl } from '../../common/uploads.js';

const EXCERPT_LENGTH = 160;

export class AuthorDto {
  @ApiProperty({ example: '3f2b8c1e-6a4d-4c8e-9b1a-2d7e5f0c9a11' })
  id: string;

  @ApiProperty({ example: 'Ana Souza' })
  name: string;
}

// Row shape returned by PostsService queries.
export interface PostRow {
  id: string;
  title: string;
  body: string;
  tags: string[];
  thumbnailPath: string | null;
  createdAt: Date;
  authorId: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
}

export class PostSummaryDto {
  @ApiProperty({ example: '9d1c2b3a-1111-4c8e-9b1a-2d7e5f0c9a11' })
  id: string;

  @ApiProperty({ example: 'Introdução ao React' })
  title: string;

  @ApiProperty({ example: 'Neste post vamos ver como criar componentes...' })
  excerpt: string;

  @ApiProperty({ example: ['react', 'front-end'] })
  tags: string[];

  @ApiProperty({
    type: String,
    nullable: true,
    example: '/uploads/9d1c2b3a.png',
    description: 'null when the post has no thumbnail',
  })
  thumbnailUrl: string | null;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiProperty({ example: 12 })
  likesCount: number;

  @ApiProperty({ example: 3 })
  commentsCount: number;

  @ApiProperty({ description: 'Always false for anonymous requests' })
  likedByMe: boolean;

  @ApiProperty({ example: '2026-10-19T12:00:00.000Z' })
  createdAt: Date;

  static fromRow(row: PostRow): PostSummaryDto {
    return Object.assign(new PostSummaryDto(), summaryFields(row));
  }
}

export class PostDetailDto extends PostSummaryDto {
  @ApiProperty({ example: 'Neste post vamos ver como criar componentes.' })
  body: string;

  static fromRow(row: PostRow): PostDetailDto {
    return Object.assign(new PostDetailDto(), summaryFields(row), {
      body: row.body,
    });
  }
}

export class PostListResponseDto {
  @ApiProperty({ type: [PostSummaryDto] })
  items: PostSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

function summaryFields(row: PostRow): PostSummaryDto {
  return {
    id: row.id,
    title: row.title,
    excerpt: toExcerpt(row.body),
    tags: row.tags,
    thumbnailUrl: uploadUrl(row.thumbnailPath),
    author: { id: row.authorId, name: row.authorName },
    likesCount: row.likesCount,
    commentsCount: row.commentsCount,
    likedByMe: row.likedByMe,
    createdAt: row.createdAt,
  };
}

function toExcerpt(body: string): string {
  const text = body.replace(/\s+/g, ' ').trim();
  if (text.length <= EXCERPT_LENGTH) {
    return text;
  }
  const cut = text.slice(0, EXCERPT_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
