
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { In } from 'typeorm';
import { ShopEntity } from '../entities/shop.entity';
import { ShopOwnerEntity } from '../entities/shopowner.entity';
import { RatingEntity } from '../entities/rating.entity';
import * as bcrypt from 'bcrypt';


@Injectable()
export class ShopOwnerService {
	constructor(
		@InjectRepository(ShopEntity)
		private readonly shopRepository: Repository<ShopEntity>,
		@InjectRepository(ShopOwnerEntity)
		private readonly shopOwnerRepository: Repository<ShopOwnerEntity>,
		@InjectRepository(RatingEntity)
		private readonly ratingRepository: Repository<RatingEntity>,
	) {}
	// Update password for shopowner
	async updatePassword(ownerId: number, oldPassword: string, newPassword: string) {
		try {
			const owner = await this.shopOwnerRepository.findOne({ where: { id: ownerId } });
			if (!owner) {
				return { status: 'fail', message: 'Owner not found' };
			}

			// Verify old password
			const isOldPasswordValid = await bcrypt.compare(oldPassword, owner.password);
			if (!isOldPasswordValid) {
				return { status: 'fail', message: 'Current password is incorrect' };
			}

			// Hash new password
			const hashedNewPassword = await bcrypt.hash(newPassword, 10);
			owner.password = hashedNewPassword;
			await this.shopOwnerRepository.save(owner);

			return { status: 'success', message: 'Password updated successfully' };
		} catch (error) {
			console.error('Password update error:', error);
			return { status: 'fail', message: 'Failed to update password' };
		}
	}


	async getDashboard(ownerId: number) {

		const shops = await this.shopRepository.find({ where: { owner: { id: ownerId } } });
		if (!shops.length) return { status: 'fail', message: 'No shops found' };
		const shopIds = shops.map(s => s.id);
	  const ratings = await this.ratingRepository.find({ where: { shop: { id: In(shopIds) } }, relations: ['user', 'shop'] });
		const users = ratings.map(r => ({ id: r.user.id, name: r.user.name, email: r.user.email, rating: r.value, comment: r.comment }));
		const avgRating = ratings.length ? (ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length) : null;
		return { users, avgRating };
	}


	async logout(ownerId: number) {

		return { status: 'success', message: 'Logged out' };
	}

	async getShop(ownerId: number, shopId: number) {
		const shop = await this.shopRepository.findOne({ where: { id: shopId, owner: { id: ownerId } }, relations: ['owner'] });
		if (!shop) return { status: 'fail', message: 'Shop not found' };
		return shop;
	}

s
	async updateShop(ownerId: number, shopId: number, body: any) {
		const shop = await this.shopRepository.findOne({ where: { id: shopId, owner: { id: ownerId } } });
		if (!shop) return { status: 'fail', message: 'Shop not found' };
		shop.name = body.name ?? shop.name;
		shop.address = body.address ?? shop.address;
		await this.shopRepository.save(shop);
		return { status: 'success', shop };
	}

	// Delete a shop
	async deleteShop(ownerId: number, shopId: number) {
		const shop = await this.shopRepository.findOne({ where: { id: shopId, owner: { id: ownerId } } });
		if (!shop) return { status: 'fail', message: 'Shop not found' };
		await this.shopRepository.remove(shop);
		return { status: 'success', deletedShopId: shopId };
	}

	// Get shopowner by id
	async getShopownerById(id: number) {
		const shopowner = await this.shopOwnerRepository.findOne({ where: { id } });
		if (!shopowner) return { status: 'fail', message: 'Shopowner not found' };
		return shopowner;
	}

}
