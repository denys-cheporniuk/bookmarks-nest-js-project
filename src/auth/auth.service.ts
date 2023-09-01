import {
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthSignIn, AuthSignUp } from './auth.typedef';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(data: AuthSignUp) {
    try {
      const generatedHash = await argon.hash(data.password);

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          hash: generatedHash,
        },
      });

      return this.signInToken(user.id, user.email);
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
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const passwordMatch = await argon.verify(user.hash, data.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Password incorrect');
    }

    return this.signInToken(user.id, user.email);
  }

  async signInToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      id: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret,
    });

    return {
      access_token: accessToken,
    };
  }
}
