import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants.js';
import type { Database } from '../database/database.types.js';
import { users } from '../database/schema.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { User } from './entities/user.entity.js';
import { hashPassword } from './password.js';

// Postgres error code for a unique constraint violation.
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException('Email already registered');
    }
    try {
      const [user] = await this.db
        .insert(users)
        .values({
          name: dto.name,
          email: dto.email,
          passwordHash: await hashPassword(dto.password),
        })
        .returning();
      return user;
    } catch (error) {
      // Two concurrent requests can both pass the check above.
      if (isUniqueViolation(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }
}

// Drizzle wraps driver errors, so the Postgres code can sit on `cause`.
function isUniqueViolation(error: unknown): boolean {
  for (let current = error; current instanceof Error; current = current.cause) {
    if ((current as { code?: unknown }).code === UNIQUE_VIOLATION) {
      return true;
    }
  }
  return false;
}
