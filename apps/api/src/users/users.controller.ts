import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser, AuthUserPayload } from '../common/decorators/auth.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@CurrentUser() user: AuthUserPayload) {
    return this.usersService.listForOrganization(user.organizationId);
  }
}
