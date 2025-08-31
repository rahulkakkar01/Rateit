import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';

@Controller('auth')
export class RegisterController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register-shopowner')
  async registerShopOwner(@Body() body) {
    return await this.adminService.addShop(body);
  }
}
