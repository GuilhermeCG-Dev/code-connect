import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 12;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  limit: number;

  @ApiProperty({ example: 40 })
  total: number;

  @ApiProperty({ example: 4 })
  totalPages: number;

  static of(page: number, limit: number, total: number): PaginationMetaDto {
    const meta = new PaginationMetaDto();
    meta.page = page;
    meta.limit = limit;
    meta.total = total;
    meta.totalPages = Math.ceil(total / limit);
    return meta;
  }
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMetaDto;
}
