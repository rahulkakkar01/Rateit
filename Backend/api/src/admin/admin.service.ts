import { Injectable } from '@nestjs/common';
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
  ) {}

  async getDashboardStats() {
  const totalUsers = await this.userRepository.count();
  const totalStores = await this.shopRepository.count();

  // Assuming you have a RatingEntity
  // const totalRatings = await this.ratingRepository.count();

  return {
    totalUsers,
    totalStores,
    // totalRatings,
  };
}


  async addUser(body: any) {
    // Create and save a new user
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
    // Create and save a new admin user
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
    // List all stores with optional filtering
    const qb = this.shopRepository.createQueryBuilder('shop')
      .leftJoinAndSelect('shop.owner', 'owner');
    if (query.name) qb.andWhere('shop.name LIKE :name', { name: `%${query.name}%` });
    if (query.address) qb.andWhere('shop.address LIKE :address', { address: `%${query.address}%` });
    // Add more filters as needed
    const stores = await qb.getMany();
    // Add rating if available (assuming shop.rating exists)
    return stores.map(store => ({
      name: store.name,
      address: store.address,
      ownerEmail: store.owner?.email,
      rating: (store as any).rating || null,
    }));
  }

  async listUsers(query: any) {
    const qb = this.userRepository.createQueryBuilder('user');
    if (query.name) qb.andWhere('user.name LIKE :name', { name: `%${query.name}%` });
    if (query.email) qb.andWhere('user.email LIKE :email', { email: `%${query.email}%` });
    if (query.address) qb.andWhere('user.address LIKE :address', { address: `%${query.address}%` });
    if (query.role) qb.andWhere('user.role = :role', { role: query.role });
    const users = await qb.getMany();
    return users.map(user => ({
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    }));
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

