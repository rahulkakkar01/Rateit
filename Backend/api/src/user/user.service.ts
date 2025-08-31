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
    try {
      if (!value || value < 1 || value > 5) {
        throw new BadRequestException('Rating value must be between 1 and 5');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      const shop = await this.shopRepository.findOne({ 
        where: { id: storeId },
        relations: ['ratings', 'owner']
      });

      if (!user || !shop) {
        throw new NotFoundException('User or store not found');
      }

      // Check if user already rated this store
      const existing = await this.ratingRepository.findOne({ 
        where: { 
          user: { id: userId }, 
          shop: { id: storeId } 
        } 
      });

      if (existing) {
        throw new BadRequestException('You have already rated this store. Use update instead.');
      }

      // Create and save the new rating
      const rating = this.ratingRepository.create({ 
        value, 
        comment, 
        user, 
        shop 
      });
      
      await this.ratingRepository.save(rating);

      // Get updated ratings
      const allRatings = await this.ratingRepository.find({
        where: { shop: { id: storeId } },
        relations: ['user']
      });

      const avgRating = parseFloat(
        (allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length).toFixed(1)
      );

      return {
        status: 'success',
        rating: {
          id: rating.id,
          value: rating.value,
          comment: rating.comment,
          userId: user.id,
          userName: user.name,
          storeId: shop.id,
          storeName: shop.name,
          createdAt: rating.createdAt
        },
        avgRating,
        totalRatings: allRatings.length
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to submit rating: ' + error.message);
    }
  }

  // Get all ratings submitted by a user
  async getUserRatings(userId: number) {
    try {
      const ratings = await this.ratingRepository.createQueryBuilder('rating')
        .leftJoinAndSelect('rating.shop', 'shop')
        .leftJoinAndSelect('shop.owner', 'owner')
        .leftJoinAndSelect('shop.ratings', 'shopRatings')
        .where('rating.user.id = :userId', { userId })
        .orderBy('rating.createdAt', 'DESC')
        .getMany();

      return ratings.map(rating => {
        const shop = rating.shop;
        const shopRatings = shop?.ratings || [];
        const avgShopRating = shopRatings.length ? 
          parseFloat((shopRatings.reduce((sum, r) => sum + r.value, 0) / shopRatings.length).toFixed(1)) : 0;

        return {
          id: rating.id,
          value: rating.value,
          comment: rating.comment || '',
          createdAt: rating.createdAt,
          store: {
            id: shop?.id,
            name: shop?.name || '',
            address: shop?.address || '',
            rating: avgShopRating,
            totalRatings: shopRatings.length,
            owner: shop?.owner ? {
              id: shop.owner.id,
              name: shop.owner.name || '',
              email: shop.owner.email || ''
            } : null
          }
        };
      });
    } catch (error) {
      console.error('Failed to get user ratings:', error);
      throw new Error('Failed to get user ratings: ' + error.message);
    }
  }

  async updateRating(userId: number, storeId: number, value: number, comment?: string) {
    if (!value || value < 1 || value > 5) {
      return { status: 'fail', message: 'Rating value must be between 1 and 5' };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rating = await this.ratingRepository.findOne({ 
        where: { 
          user: { id: userId }, 
          shop: { id: storeId } 
        },
        relations: ['shop']
      });

      if (!rating) {
        return { status: 'fail', message: 'No existing rating found for this store by this user.' };
      }

      // Update the rating
      rating.value = value;
      rating.comment = comment;
      await this.ratingRepository.save(rating);

      // Recalculate average rating
      const allRatings = await this.ratingRepository.find({
        where: { shop: { id: storeId } }
      });

      const avgRating = allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length;

      await queryRunner.commitTransaction();

      return { 
        status: 'success', 
        rating,
        avgRating,
        totalRatings: allRatings.length
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error('Failed to update rating');
    } finally {
      await queryRunner.release();
    }
  }

  async listStores(query: { name?: string; address?: string }) {
    try {
      // Use find with relations instead of query builder for simpler query
      const stores = await this.shopRepository.find({
        relations: {
          owner: true,
          ratings: {
            user: true
          }
        },
        order: {
          id: 'ASC'
        }
      });

      // Filter stores if query parameters are provided
      let filteredStores = stores;
      if (query?.name || query?.address) {
        filteredStores = stores.filter(store => {
          const nameMatch = !query.name || (store.name && store.name.toLowerCase().includes(query.name.toLowerCase()));
          const addressMatch = !query.address || (store.address && store.address.toLowerCase().includes(query.address.toLowerCase()));
          return nameMatch && addressMatch;
        });
      }

      // Map and format the response
      return filteredStores.map(store => {
        const ratings = store.ratings || [];
        const avgRating = ratings.length ? 
          parseFloat((ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(1)) : 0;

        return {
          id: store.id,
          name: store.name,
          address: store.address,
          owner: {
            id: store.owner?.id,
            name: store.owner?.name,
            email: store.owner?.email
          },
          rating: avgRating,
          totalRatings: ratings.length,
          ratings: ratings.map(r => ({
            id: r.id,
            value: r.value,
            userId: r.user?.id,
            userName: r.user?.name,
            comment: r.comment,
            createdAt: r.createdAt
          }))
        };
      });
    } catch (error) {
      console.error('Error in listStores:', error);
      throw new Error(`Failed to list stores: ${error.message}`);
    }
  }
  }


