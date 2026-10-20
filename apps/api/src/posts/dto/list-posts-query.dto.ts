import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.js';

export const postSorts = ['recent', 'popular'] as const;
export type PostSort = (typeof postSorts)[number];

export class ListPostsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'react hooks',
    description: 'Full text search on title, tags and body',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ enum: postSorts, default: 'recent' })
  @IsOptional()
  @IsIn(postSorts)
  sort: PostSort = 'recent';
}
