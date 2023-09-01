import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignIn, AuthSignUp } from './auth.typedef';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() data: AuthSignUp) {
    return this.authService.signup(data);
  }

  @Post('signin')
  signin(@Body() data: AuthSignIn) {
    return this.authService.signin(data);
  }
}
