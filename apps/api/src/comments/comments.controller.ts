import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/auth.guard.js';
import { PaginationQueryDto } from '../common/pagination.js';
import { CommentsService } from './comments.service.js';
import {
  CommentDto,
  CommentListResponseDto,
} from './dto/comment-response.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOkResponse({ type: CommentListResponseDto })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async findAll(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<CommentListResponseDto> {
    const { items, meta } = await this.commentsService.findAll(postId, query);
    return { items: items.map((row) => CommentDto.fromRow(row)), meta };
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: CommentDto,
    description: 'Comment created. Location header points to the new comment.',
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommentDto> {
    const comment = await this.commentsService.create(
      postId,
      req.user.sub,
      dto,
    );
    res.location(`/posts/${postId}/comments/${comment.id}`);
    return CommentDto.fromRow(comment);
  }
}
