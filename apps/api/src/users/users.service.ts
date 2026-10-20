import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { User } from './entities/user.entity.js';
import { hashPassword } from './password.js';

@Injectable()
export class UsersService {
  // In-memory store. Data is lost when the process restarts.
  private readonly users: User[] = [];

  async create(dto: CreateUserDto): Promise<User> {
    if (this.findByEmail(dto.email)) {
      throw new ConflictException('Email already registered');
    }
    const user: User = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}
