import { Controller, Get, Post, Body, Query, Param, UseGuards, Request, UnauthorizedException, Catch, ExceptionFilter, ArgumentsHost, HttpStatus, UseFilters } from '@nestjs/common';
@Catch(UnauthorizedException)
export class UnauthorizedFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response
      .status(HttpStatus.UNAUTHORIZED)
      .json({ status: 'fail', message: 'Unauthorized' });
  }
}
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('admin')
@UseFilters(UnauthorizedFilter)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return await this.adminService.getDashboardStats();
  }

  @Post('add-user')
  async addUser(@Body() body) {
    return await this.adminService.addUser(body);
  }

  @Post('add-shop')
  async addShop(@Body() body) {
    return await this.adminService.addShop(body);
  }

  @Post('add-admin')
  async addAdmin(@Body() body) {
    return await this.adminService.addAdmin(body);
  }

  @Get('stores')
  async listStores(@Query() query) {
    return await this.adminService.listStores(query);
  }

  @Get('users')
  async listUsers(@Query() query) {
    return await this.adminService.listUsers(query);
  }

  @Get('user/:id')
  async getUserDetails(@Param('id') id: number) {
    return await this.adminService.getUserDetails(id);
  }

  @Post('logout')
  async logout(@Request() req) {
    return await this.adminService.logout(req.user.id);
  }
}
