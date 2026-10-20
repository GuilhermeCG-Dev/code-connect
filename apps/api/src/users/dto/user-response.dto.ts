import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../entities/user.entity.js';

export class UserResponseDto {
  @ApiProperty({ example: '3f2b8c1e-6a4d-4c8e-9b1a-2d7e5f0c9a11' })
  id: string;

  @ApiProperty({ example: 'Ana Souza' })
  name: string;

  @ApiProperty({ example: 'ana@codeconnect.dev' })
  email: string;

  @ApiProperty({ example: '2026-10-19T12:00:00.000Z' })
  createdAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
