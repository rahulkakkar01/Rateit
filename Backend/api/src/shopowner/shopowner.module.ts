
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopEntity } from '../entities/shop.entity';
import { ShopOwnerEntity } from '../entities/shopowner.entity';
import { RatingEntity } from '../entities/rating.entity';
import { ShopOwnerService } from './shopowner.service';
import { ShopOwnerController } from './shopowner.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([ShopEntity, ShopOwnerEntity, RatingEntity]),
  ],
  controllers: [ShopOwnerController],
  providers: [ShopOwnerService],
})
export class ShopOwnerModule {}
