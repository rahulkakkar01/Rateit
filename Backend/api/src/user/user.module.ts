import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserEntity } from '../entities/user.entity';
import { UserService } from './user.service';
import { refreshTokenEntity } from 'src/entities/refresh.entity';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RatingEntity } from 'src/entities/rating.entity';
import { ShopEntity } from 'src/entities/shop.entity';

@Module({
    imports: [
  TypeOrmModule.forFeature([UserEntity, refreshTokenEntity,RatingEntity,ShopEntity]),
      JwtModule.register({
        secret: process.env.SECRET_KEY,
    signOptions: { expiresIn: '3600s' },
      }),
  forwardRef(() => AuthModule),
    ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
