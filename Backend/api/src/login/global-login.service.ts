import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { ShopOwnerEntity } from '../entities/shopowner.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GlobalLoginService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ShopOwnerEntity) private readonly shopOwnerRepository: Repository<ShopOwnerEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(body: { email: string; password: string; role: string }) {
    if (!body.email || !body.password || !body.role) {
      return { status: 'fail', message: 'Email, password, and role are required' };
    }
    let user;
    if (body.role === 'shopowner') {
      user = await this.shopOwnerRepository.findOne({ where: { email: body.email } });
      if (!user) return { status: 'fail', message: 'Shopowner not found' };
      if (!user.password) return { status: 'fail', message: 'Password not set for shopowner' };
      if (!await bcrypt.compare(body.password, user.password)) return { status: 'fail', message: 'Invalid password' };
    } else {
      user = await this.userRepository.findOne({ where: { email: body.email }, select: ['id', 'email', 'password', 'role'] });
      if (!user) return { status: 'fail', message: 'User not found' };
      if (!user.password) return { status: 'fail', message: 'Password not set for user' };
      if (!await bcrypt.compare(body.password, user.password)) return { status: 'fail', message: 'Invalid password' };
    }
    const payload = { sub: user.id, email: user.email, role: body.role };
    const accessToken = this.jwtService.sign(payload);
    return { status: 'success', accessToken, user, role: body.role };
  }
}
