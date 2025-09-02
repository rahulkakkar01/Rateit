import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { ShopEntity } from '../entities/shop.entity';
import { ShopOwnerEntity } from '../entities/shopowner.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopRepository: Repository<ShopEntity>,
    @InjectRepository(ShopOwnerEntity)
    private readonly shopOwnerRepository: Repository<ShopOwnerEntity>,
    @InjectRepository(require('../entities/rating.entity').RatingEntity)
    private readonly ratingRepository: Repository<any>,
  ) {}

  async getDashboardStats() {
  const totalUsers = await this.userRepository.count();
  const totalStores = await this.shopRepository.count();

  // Fetch all ratings with user and shop info
  const ratings = await this.ratingRepository.find({ relations: ['user', 'shop'] });
  const totalRatings = ratings.length;
  const ratingsDetails = ratings.map(r => ({
    id: r.id,
    value: r.value,
    comment: r.comment,
    user: r.user ? { id: r.user.id, name: r.user.name, email: r.user.email } : null,
    shop: r.shop ? { id: r.shop.id, name: r.shop.name } : null,
    createdAt: r.createdAt
  }));

  return {
    totalUsers,
    totalStores,
    totalRatings,
    ratingsDetails,
  };
}


  async addUser(body: any) {
    // Check for duplicate email
    const existingUser = await this.userRepository.findOne({ where: { email: body.email } });
    if (existingUser) {
      return { status: 'fail', message: 'User with this email already exists' };
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = this.userRepository.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      address: body.address,
      role: body.role || 'user',
    });
    await this.userRepository.save(user);
    return { status: 'success', user };
  }

  async addShop(body: any) {
    // Create shopowner with provided details (plain text password, insecure)
    const existingShopowner = await this.shopOwnerRepository.findOne({ where: { email: body.ownerEmail } });
    if (existingShopowner) {
      return { status: 'fail', message: 'Shopowner with this email already exists' };
    }
    const hashedPassword = await bcrypt.hash(body.ownerPassword, 10);
    const shopowner = this.shopOwnerRepository.create({
      name: body.ownerName,
      email: body.ownerEmail,
      password: hashedPassword,
      address: body.ownerAddress,
      role: 'shopowner',
    });
    await this.shopOwnerRepository.save(shopowner);

    const store = this.shopRepository.create({
      name: body.storeName,
      address: body.storeAddress,
      owner: shopowner,
    });
    await this.shopRepository.save(store);
    return { status: 'success', store, shopowner };
    //write a if statement to check if shopowner with email already exists and return error if so
    
  }

  async addAdmin(body: any) {
    // Check for duplicate email
    const existingAdmin = await this.userRepository.findOne({ where: { email: body.email } });
    if (existingAdmin) {
      return { status: 'fail', message: 'Admin with this email already exists' };
    }
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const admin = this.userRepository.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      address: body.address,
      role: 'admin',
    });
    await this.userRepository.save(admin);
    return { status: 'success', admin };
  }

  async listStores(query: any) {
    const qb = this.shopRepository.createQueryBuilder('shop')
      .leftJoinAndSelect('shop.owner', 'owner')
      .leftJoinAndSelect('shop.ratings', 'ratings')
      .leftJoinAndSelect('ratings.user', 'user');

    // Search functionality
    if (query.search) {
      qb.andWhere(
        'LOWER(shop.name) LIKE LOWER(:search) OR LOWER(shop.address) LIKE LOWER(:search) OR LOWER(owner.name) LIKE LOWER(:search)',
        { search: `%${query.search}%` }
      );
    }

    // Rating filter
    if (query.minRating) {
      qb.andWhere('shop.avgRating >= :minRating', { minRating: Number(query.minRating) });
    }
    if (query.maxRating) {
      qb.andWhere('shop.avgRating <= :maxRating', { maxRating: Number(query.maxRating) });
    }

    // Sorting
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'DESC';
    
    if (sortBy === 'rating') {
      qb.orderBy('shop.avgRating', order);
    } else {
      qb.orderBy(`shop.${sortBy}`, order);
    }

    // Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [stores, total] = await qb.getManyAndCount();

    // Calculate average ratings and map store details
    return stores.map(store => {
      const ratings = store.ratings || [];
      const avgRating = ratings.length ? 
        parseFloat((ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(1)) : 0;

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        ownerEmail: store.owner?.email,
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
  }

  async listUsers(query: any) {
    try {
      const qb = this.userRepository.createQueryBuilder('user');

      // Search functionality
      if (query.search) {
        qb.where(
          'LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(user.address) LIKE LOWER(:search)',
          { search: `%${query.search}%` }
        );
      }

      // Role filter
      if (query.role) {
        qb.andWhere('user.role = :role', { role: query.role });
      }

      // Sorting - only allow safe fields (UserEntity doesn't have createdAt column)
      const validSortFields = ['id', 'name', 'email', 'role'];
      const requestedSort = query.sortBy;
      const sortBy = validSortFields.includes(requestedSort) ? requestedSort : 'id';
      const order = (query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      qb.orderBy(`user.${sortBy}`, order);

      // Pagination
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      qb.skip((page - 1) * limit).take(limit);

      const [users, total] = await qb.getManyAndCount();

      return {
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (err) {
      console.error('admin.listUsers error:', err?.message || err);
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async getUserDetails(id: number) {
    
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return { status: 'fail', message: 'User not found' };
    let rating = null;
    if (user.role === 'shopowner') {
      
      const shopowner = await this.shopOwnerRepository.findOne({ where: { email: user.email } });
      rating = (shopowner as any)?.rating || null;
    }
    return {
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      rating,
    };
  }

  async logout(userId: number) {
  
  return { status: 'success', message: 'User logged out successfully', userId };
  }
}

