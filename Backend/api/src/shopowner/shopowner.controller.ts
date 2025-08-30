import { Controller, Post, Body, Request, Patch, UseGuards } from '@nestjs/common';
import { ShopOwnerService } from './shopowner.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('shopowner')
@UseGuards(AuthGuard('jwt'))
export class ShopOwnerController {
  constructor(private readonly shopOwnerService: ShopOwnerService) {}

  @Post('logout')
  async logout(@Request() req) {
    const ownerId = req.user.id;
    return await this.shopOwnerService.logout(ownerId);
  }

  @Patch('update-password')
  async updatePassword(@Request() req, @Body() body) {
    const ownerId = req.user.id;
    return await this.shopOwnerService.updatePassword(ownerId, body.oldPassword, body.newPassword);
  }

  @Post('dashboard')
  async getDashboard(@Request() req) {
    const ownerId = req.user.id;
    return await this.shopOwnerService.getDashboard(ownerId);
  }
}
