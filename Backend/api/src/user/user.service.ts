import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from '../entities/user.entity';
import { refreshTokenEntity } from 'src/entities/refresh.entity';
import { RatingEntity } from '../entities/rating.entity';
import { ShopEntity } from '../entities/shop.entity';
import { In } from 'typeorm';
const saltRounds = 10;

@Injectable()

export class UserService {

    [x: string]: any;
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(refreshTokenEntity) private readonly refreshTokenRepository: Repository<refreshTokenEntity>,
    @InjectRepository(RatingEntity) private readonly ratingRepository: Repository<RatingEntity>,
    @InjectRepository(ShopEntity) private readonly shopRepository: Repository<ShopEntity>,
    private readonly dataSource: DataSource,
  ) {}
 

  async createUser(body) {
    if (!body.email || !body.password) {
      return { status: 'fail', message: 'Email and password are required' };
    }
    let user = new UserEntity();
  user.email = body.email;
  user.password = await bcrypt.hash(body.password, saltRounds);
  user.name = body.name;
  user.role = body.role ? body.role : 'user';
  user = await this.userRepository.save(user);
  user.password = '';
  return user;
  }

  async getUser(email: string) {
    console.log('usercontrollergetuser', email);
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
      select: ['id', 'email', 'password', 'role'],
    });
    console.log(user);
    return user;
    }
async saveUser(body) {
    if (!body.email || !body.password) {
      return { status: 'fail', message: 'Email and password are required' };
    }
    let user = new UserEntity();
  user.email = body.email;
  user.password = await bcrypt.hash(body.password, saltRounds);
  user.name = body.name;
  user.role = body.role ? body.role : 'user';
  user = await this.userRepository.save(user);
  user.password = '';
  return user;
  }

  async resetPass(email, body) {
    let user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return { status: 'fail', message: 'User not found' };
    }
    if (!body.npassword || !body.opassword) {
      return {
        status: 'fail',
        message: 'New password and old password are required',
      };
    }

    const match = await bcrypt.compare(body.opassword, user.password);
    console.log('match', match);
    if (match) {
      user.password = await bcrypt.hash(body.npassword, saltRounds);
      user = await this.userRepository.save(user);
      user.password = '';
      return user ? { status: 'success' } : BadRequestException;
    }
    return { status: 'fail', message: 'Old password is incorrect' };
  }

  async saveRefreshToken(user: UserEntity, token: string) {
    const userobj = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
    });
    if (!userobj) {
      return { status: 'fail', message: 'User not found' };
    }
    console.log('generate refresh token');
    const newRefreshToken = new refreshTokenEntity();
    console.log('newRefreshToken', newRefreshToken);
    newRefreshToken.token = token;
    newRefreshToken.active = true;
    newRefreshToken.user = userobj;
    await this.refreshTokenRepository.save(newRefreshToken);

    return newRefreshToken;
  }

  async getNewToken(refreshToken: string) {
    const today = new Date();
    console.log('today', today);
    const refreshTokenObj = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
        active: true,
        expires: MoreThan(today),
      },
      relations: ['user'],
    });
    if (!refreshTokenObj) {
      return { status: 'fail', message: 'Refresh token not found' };
    }

  // delete user.password;
  refreshTokenObj.user.password = '';

    const authToken = await this.authService.generateToken(
      refreshTokenObj.user,
    );

    // delete old refresh token and save new one
    const newRefreshToken = new refreshTokenEntity();
    const newuuid = uuidv4();
    newRefreshToken.token = newuuid;
    newRefreshToken.active = true;
    const foundUser = await this.userRepository.findOne({
      where: {
        id: refreshTokenObj.user.id,
      },
    });
    if (!foundUser) {
      return { status: 'fail', message: 'User not found' };
    }
    newRefreshToken.user = foundUser;
    await this.refreshTokenRepository.save(newRefreshToken);
    await this.refreshTokenRepository.delete(refreshTokenObj.id);

    return {
      accessToken: authToken,
      expiresIn: 3600,
      role: refreshTokenObj.user.role,
      refreshToken: newuuid,
      userId: newRefreshToken.user.id,
    };
  }
   // Submit a rating for a store
  async submitRating(userId: number, storeId: number, value: number, comment?: string) {
    if (!value || value < 1 || value > 5) {
      return { status: 'fail', message: 'Rating value must be between 1 and 5' };
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const shop = await this.shopRepository.findOne({ where: { id: storeId } });
    if (!user || !shop) {
      return { status: 'fail', message: 'User or store not found' };
    }
    // Check if user already rated this store
    const existing = await this.ratingRepository.findOne({ where: { user: { id: userId }, shop: { id: storeId } } });
    if (existing) {
      return { status: 'fail', message: 'You have already rated this store. Use update instead.' };
    }
    const rating = this.ratingRepository.create({ value, comment, user, shop });
    await this.ratingRepository.save(rating);
    return { status: 'success', rating };
  }

  // Update submitted rating
  async updateRating(userId: number, storeId: number, value: number, comment?: string) {
    if (!value || value < 1 || value > 5) {
      return { status: 'fail', message: 'Rating value must be between 1 and 5' };
    }
    const rating = await this.ratingRepository.findOne({ where: { user: { id: userId }, shop: { id: storeId } } });
    if (!rating) {
      return { status: 'fail', message: 'No existing rating found for this store by this user.' };
    }
    rating.value = value;
    rating.comment = comment;
    await this.ratingRepository.save(rating);
    return { status: 'success', rating };
  }

  async listStores(query: { name?: string; address?: string }) {
    const qb = this.shopRepository.createQueryBuilder('shop');
    if (query.name) qb.andWhere('shop.name LIKE :name', { name: `%${query.name}%` });
    if (query.address) qb.andWhere('shop.address LIKE :address', { address: `%${query.address}%` });
    const stores = await qb.getMany();

    // Optionally, fetch ratings for each store
    const result: { id: number; name: string; address?: string; avgRating: number | null }[] = [];
    for (const store of stores) {
      const ratings = await this.ratingRepository.find({ where: { shop: { id: store.id } } });
      const avgRating = ratings.length ? (ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length) : null;
      result.push({
        id: store.id,
        name: store.name,
        address: store.address,
        avgRating,
      });
    }
    return result;
  }
  }


