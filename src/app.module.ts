import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaUserRepository } from './infrastructure/database/repositories/prisma-user.repository';

import { UserController } from './api/user/user.controller';
import { PictoController } from './api/picto/picto.controller'

import { CreateUserUseCase } from './application/user/create-user.usecase';
import { GetPictosUseCase } from './application/picto/get-pictos.usecase';
import { ConfirmEmailUseCase } from './application/user/confirm-email.usecase';
import { RequestOtpUseCase } from './application/user/request-otp.usecase';
import { VerifyOtpUseCase } from './application/user/verify-otp.usecase';

import { UserRepository } from './infrastructure/database/repositories/user.repository';
import { PictoRepository } from './infrastructure/database/repositories/picto.repository';
import { TokenRepository } from './infrastructure/database/repositories/token.repository';
import { OtpRepository } from './infrastructure/database/repositories/otp.repository';

import { JwtService } from './infrastructure/auth/jwt.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'img'),
      serveRoot: '/img',
    }),
  ],
  controllers: [UserController, PictoController,],
  providers: [
    // ✅ repos
    PrismaUserRepository,
    UserRepository,
    PictoRepository,
    TokenRepository,
    OtpRepository,
    JwtService,

    // ✅ Create User
    {
      provide: CreateUserUseCase,
      useFactory: (
        userRepo: PrismaUserRepository,
        tokenRepo: TokenRepository,
      ) => new CreateUserUseCase(userRepo, tokenRepo),
      inject: [PrismaUserRepository, TokenRepository],
    },

    // ✅ Get Pictos
    {
      provide: GetPictosUseCase,
      useFactory: (
        pictoRepository: PictoRepository,
      ) => new GetPictosUseCase(
        pictoRepository,
      ),
      inject: [PictoRepository],
    },

    // ✅ Confirm Email
    {
      provide: ConfirmEmailUseCase,
      useFactory: (
        userRepo: UserRepository,
        tokenRepo: TokenRepository,
      ) => new ConfirmEmailUseCase(userRepo, tokenRepo),
      inject: [PrismaUserRepository, TokenRepository],
    },

    // ✅ Request OTP
    {
      provide: RequestOtpUseCase,
      useFactory: (
        userRepo: UserRepository,
        otpRepo: OtpRepository,
      ) => new RequestOtpUseCase(userRepo, otpRepo),
      inject: [PrismaUserRepository, OtpRepository],
    },

    // ✅ Verify OTP
    {
      provide: VerifyOtpUseCase,
      useFactory: (
        userRepo: UserRepository,
        otpRepo: OtpRepository,
        jwtService: JwtService
      ) => new VerifyOtpUseCase(userRepo, otpRepo, jwtService),
      inject: [PrismaUserRepository, OtpRepository, JwtService],
    },
  ],
})
export class AppModule { }