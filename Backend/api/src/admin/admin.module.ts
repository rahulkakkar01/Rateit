
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { ShopEntity } from '../entities/shop.entity';
import { ShopOwnerEntity } from '../entities/shopowner.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { RatingEntity } from 'src/entities/rating.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([UserEntity, ShopEntity, ShopOwnerEntity, RatingEntity]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
