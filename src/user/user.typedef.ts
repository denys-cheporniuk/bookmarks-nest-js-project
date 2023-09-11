import { IsOptional, IsString } from 'class-validator';

export class UpdateUser {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
