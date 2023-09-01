import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignUp } from './auth.typedef';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() data: AuthSignUp) {
    return this.authService.signup(data);
  }

  @Post('signin')
  signin() {
    return this.authService.signin();
  }
}
