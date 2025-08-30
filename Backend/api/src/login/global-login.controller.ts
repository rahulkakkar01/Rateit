import { Controller, Post, Body } from '@nestjs/common';
import { GlobalLoginService } from './global-login.service';

@Controller('auth')
export class GlobalLoginController {
  constructor(private readonly globalLoginService: GlobalLoginService) {}

  @Post('login')
  async login(@Body() body) {
    return await this.globalLoginService.login(body);
  }
}
