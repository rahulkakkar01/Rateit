import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { GlobalLoginController } from './login/global-login.controller';
import { GlobalLoginService } from './login/global-login.service';
import { ShopOwnerModule } from './shopowner/shopowner.module';
import { UserEntity } from './entities/user.entity';
import { ShopOwnerEntity } from './entities/shopowner.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'yourSecretKey',
      signOptions: { expiresIn: '3600s' },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'nestuser',
      password: 'nestpass',
      database: 'fullstack_challenge',
      autoLoadEntities: true,
      synchronize: true,
    }),
  TypeOrmModule.forFeature([UserEntity, ShopOwnerEntity]),
    UserModule,
    AuthModule,
    AdminModule,
    ShopOwnerModule
  ],
  controllers: [AppController, GlobalLoginController],
  providers: [GlobalLoginService],
})
export class AppModule {}
