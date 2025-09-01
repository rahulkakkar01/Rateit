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
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { Public } from './auth/public.decorator';

import * as fs from 'fs';
import { Response } from 'express';
@Controller('auth')
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Get('')
  async check() {
    return {
      status: 'success',
      message: 'Hello 😊',
    };
  }

  @Public()
  @Get('/health')
  async health() {
    return 'healthy';
  }

  @Public()
  @Post('/login')
  async login(@Body() body) {
    const { email, password, role } = body;
    
    // Validate user credentials
    const user = await this.userService.validateUser(email, password, role);
    if (!user) {
      return { status: 'fail', message: 'Invalid credentials' };
    }

    const uuid = uuidv4();
    const rtrobj = await this.userService.saveRefreshToken(user, uuid);

    if (!rtrobj || !('token' in rtrobj)) {
      return { status: 'fail', message: 'Refresh token not found' };
    }
    const refreshToken = rtrobj.token;

    // Remove sensitive data
    delete user.password;

    const token = await this.authService.generateToken(user);
    const date = new Date();
    date.setHours(date.getHours() + 1);

    return {
      status: 'success',
      accessToken: token,
      expiresIn: date,
      role: user.role,
      refreshToken: refreshToken,
      userId: user.id,
      user: user
    };
  }

  @Public()
  @Post('/register')
  async register(@Body() body) {
    const user = await this.userService.getUser(body.email);
    if (user == null) {
      const newUser = await this.userService.saveUser(body);

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
