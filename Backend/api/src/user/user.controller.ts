import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  BadRequestException,
  Param,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}



  // Signup
  @Post('signup')
  async signup(@Body() body) {
    return await this.userService.createUser(body);
  }


  // Logout
  @Post('logout')
  async logout(@Request() req) {
    const userId = req.user.id;
    return await this.userService.logout(userId);
  }

  // Update password
  @Post('resetpassword')
  async updateUser(@Request() req, @Body() body) {
    if (!body.npassword || !body.opassword) {
      throw new BadRequestException('New and old password are required');
    }
    const result = await this.userService.resetPass(req.user.email, body);
    return result;
  }

  // View all stores
  @Get('stores')
  async getStores(@Query('name') name?: string, @Query('address') address?: string) {
    return await this.userService.listStores({ name, address });
  }

  // View store details with ratings
  @Get('stores/:storeId')
  async getStoreDetails(@Request() req, @Param('storeId') storeId: number) {
    const userId = req.user.id;
    return await this.userService.getStoreDetails(userId, storeId);
  }

  // Submit a rating
  @Post('stores/:storeId/rate')
  async submitRating(@Request() req, @Param('storeId') storeId: number, @Body() body) {
    const userId = req.user.id;
    const value = body.value;
    const comment = body.comment;
    return await this.userService.submitRating(userId, storeId, value, comment);
  }

  // Modify submitted rating
  @Post('stores/:storeId/rate/update')
  async updateRating(@Request() req, @Param('storeId') storeId: number, @Body() body) {
    const userId = req.user.id;
    const value = body.value;
    const comment = body.comment;
    return await this.userService.updateRating(userId, storeId, value, comment);
  }


}