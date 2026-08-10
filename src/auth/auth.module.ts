import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { getJwtConfig } from 'src/config/jwt.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { YandexStrategy } from './strategies/yandex.strategy';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    PrismaService, 
    UserService, 
    JwtStrategy, 
    GoogleStrategy, 
    YandexStrategy,
    ConfigService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
