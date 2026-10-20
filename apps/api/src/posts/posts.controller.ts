import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard, OptionalAuthGuard } from '../auth/auth.guard.js';
import type {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from '../auth/auth.guard.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { ListPostsQueryDto } from './dto/list-posts-query.dto.js';
import {
  PostDetailDto,
  PostListResponseDto,
  PostSummaryDto,
} from './dto/post-response.dto.js';
import { PostsService } from './posts.service.js';
import type { ThumbnailFile } from './posts.service.js';

const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(OptionalAuthGuard)
  @Get()
  @ApiOkResponse({ type: PostListResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query' })
  async findAll(
    @Query() query: ListPostsQueryDto,
    @Request() req: OptionallyAuthenticatedRequest,
  ): Promise<PostListResponseDto> {
    const { items, meta } = await this.postsService.findAll(
      query,
      req.user?.sub,
    );
    return { items: items.map((row) => PostSummaryDto.fromRow(row)), meta };
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  @ApiOkResponse({ type: PostDetailDto })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: OptionallyAuthenticatedRequest,
  ): Promise<PostDetailDto> {
    return PostDetailDto.fromRow(
      await this.postsService.findOne(id, req.user?.sub),
    );
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'body'],
      properties: {
        title: { type: 'string', example: 'Introdução ao React' },
        body: { type: 'string', example: 'Neste post vamos ver...' },
        tags: { type: 'string', example: 'react, front-end' },
        thumbnail: {
          type: 'string',
          format: 'binary',
          description: 'PNG, JPEG or WebP up to 2 MB',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: PostDetailDto,
    description: 'Post created. Location header points to the new post.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input or thumbnail' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  async create(
    @Body() dto: CreatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_THUMBNAIL_BYTES }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg|webp)$/ }),
        ],
      }),
    )
    thumbnail: ThumbnailFile | undefined,
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PostDetailDto> {
    const post = await this.postsService.create(dto, req.user.sub, thumbnail);
    res.location(`/posts/${post.id}`);
    return PostDetailDto.fromRow(post);
  }

  @UseGuards(AuthGuard)
  @Put(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Post liked (idempotent)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  like(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.postsService.like(id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Like removed (idempotent)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  unlike(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.postsService.unlike(id, req.user.sub);
  }
}
