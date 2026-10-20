import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/pagination.js';
import { AuthorDto } from '../../posts/dto/post-response.dto.js';

// Row shape returned by CommentsService queries.
export interface CommentRow {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
}

export class CommentDto {
  @ApiProperty({ example: '7a1c2b3a-2222-4c8e-9b1a-2d7e5f0c9a11' })
  id: string;

  @ApiProperty({ example: 'Ótimo post!' })
  body: string;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  @ApiProperty({ example: '2026-10-19T12:00:00.000Z' })
  createdAt: Date;

  static fromRow(row: CommentRow): CommentDto {
    const dto = new CommentDto();
    dto.id = row.id;
    dto.body = row.body;
    dto.author = { id: row.authorId, name: row.authorName };
    dto.createdAt = row.createdAt;
    return dto;
  }
}

export class CommentListResponseDto {
  @ApiProperty({ type: [CommentDto] })
  items: CommentDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
