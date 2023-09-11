import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { UpdateUser } from './user.typedef';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getUser(@GetUser() user: User) {
    return user;
  }

  @Patch('update')
  updateUser(
    @GetUser('id') userId: number,
    @Body() values: UpdateUser,
  ) {
    console.log(userId);

    return this.userService.updateUser(userId, values);
  }
}
