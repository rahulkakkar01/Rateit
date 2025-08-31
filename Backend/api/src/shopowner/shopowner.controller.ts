import { Controller, Get, Post, Body, Request, Patch, Delete, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
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
  async updatePassword(
    @Request() req,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    const ownerId = req.user.id;
    return await this.shopOwnerService.updatePassword(ownerId, oldPassword, newPassword);
  }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    const ownerId = req.user.id;
    return await this.shopOwnerService.getDashboard(ownerId);
  }

  @Get('shop/:id')
  async getShop(
    @Request() req,
    @Param('id', ParseIntPipe) shopId: number,
  ) {
    const ownerId = req.user.id;
    return await this.shopOwnerService.getShop(ownerId, shopId);
  }


 

  @Delete('shop/:id')
  async deleteShop(
    @Request() req,
    @Param('id', ParseIntPipe) shopId: number,
  ) {
    const ownerId = req.user.id;
    return await this.shopOwnerService.deleteShop(ownerId, shopId);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const ownerId = req.user.id;
    return await this.shopOwnerService.getShopownerById(ownerId);
  }
}
