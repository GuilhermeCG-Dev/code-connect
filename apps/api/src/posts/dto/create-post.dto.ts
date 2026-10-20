import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Multipart sends tags as "react, css" or as repeated fields.
function toTags({ value }: { value: unknown }): unknown {
  const raw = typeof value === 'string' ? value.split(',') : value;
  if (!Array.isArray(raw)) {
    return raw;
  }
  const tags = raw
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
  return [...new Set(tags)];
}

export class CreatePostDto {
  @ApiProperty({ example: 'Introdução ao React', minLength: 3, maxLength: 150 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: 'Neste post vamos ver como criar componentes.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  body: string;

  @ApiPropertyOptional({
    example: 'react, front-end',
    description: 'Comma separated, up to 5 tags',
  })
  @Transform(toTags)
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags: string[] = [];
}
