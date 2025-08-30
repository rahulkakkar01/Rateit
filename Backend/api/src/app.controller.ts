import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
// import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
// import { RoleGuard } from './roles.guard';
import { UserService } from './user/user.service';
import { v4 as uuidv4 } from 'uuid';
// import { UserEntity } from './entities/user.entity';

import * as fs from 'fs';
import { Response } from 'express';
@Controller('')
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('')
  async check() {
    return {
      status: 'success',
      message: 'Hello 😊',
    };
  }

  @Get('/health')
  async health() {
    return 'healthy';
  }

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() req) {
    console.log('appcontrollerlogin', req.user);
    const user = req.user;

    const uuid = uuidv4();
    const rtrobj = await this.userService.saveRefreshToken(user, uuid);

    if (!rtrobj || !('token' in rtrobj)) {
      return { status: 'fail', message: 'Refresh token not found' };
    }
    const refreshToken = rtrobj.token;

    // remove user.password;
    delete user.password;

    // const user = "dbhfgijdebgjhd";
    console.log('login user for token', user);
    const tokken = await this.authService.generateToken(user);

    console.log('appcontrollerlogintoken', tokken);
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return {
      accessToken: tokken,
      expiresIn: date,
      role: user.role,
      refreshToken: refreshToken,
      userId: user.id,
    };
  }

  @Post('/register')
  async register(@Body() body) {
    console.log('appcontrollerregister', body);
    const user = await this.userService.getUser(body.email);
    console.log('appcontrollerregisteruser', user);
    if (user == null) {
      const newUser = await this.userService.saveUser(body);
      console.log('appcontrollerregisternewuser', newUser);

      // check if new user created successfully
      if (!newUser || !('id' in newUser) || !newUser.id) {
        return { status: 'fail', message: 'User cannot be created' };
      }

      const uuid = uuidv4();
      const rtrobj = await this.userService.saveRefreshToken(newUser, uuid);
      if (!rtrobj || !('token' in rtrobj)) {
        return { status: 'fail', message: 'Refresh token not found' };
      }
      const refreshToken = rtrobj.token;
      const date = new Date();
      date.setHours(date.getHours() + 1);

      newUser.password = '';

      const token = await this.authService.generateToken(newUser);
      return {
        accessToken: token,
        expiresIn: date,
        role: newUser.role,
        refreshToken: refreshToken,
        userId: newUser.id,
      };
    } else {
      return 'User already exists';
    }
  }

  @Get('/refresh/:refreshToken')
  async refreshToken(@Param('refreshToken') refreshToken: string) {
    return await this.userService.getNewToken(refreshToken);
  }
}
