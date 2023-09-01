import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthSignUp } from './auth.typedef';
import { hash } from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(data: AuthSignUp) {
    try {
      const token = await hash(data.password);

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          token,
        },
        // TODO: rewrite select in a more convenient format
        select: {
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  signin() {
    return { msg: 'User signed in' };
  }
}
