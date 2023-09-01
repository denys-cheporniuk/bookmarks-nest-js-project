import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthSignUp {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
