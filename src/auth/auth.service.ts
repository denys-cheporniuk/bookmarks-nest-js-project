import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthSignIn, AuthSignUp } from './auth.typedef';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(data: AuthSignUp) {
    try {
      const generatedHash = await argon.hash(data.password);

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          hash: generatedHash,
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

  async signin(data: AuthSignIn) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
      // TODO: rewrite select in a more convenient format
      select: {
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        hash: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const passwordMatch = await argon.verify(user.hash, data.password);

    if (!passwordMatch) {
      throw new ForbiddenException('Password incorrect');
    }

    return user;
  }
}
