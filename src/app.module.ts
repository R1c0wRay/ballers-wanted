import { Module } from '@nestjs/common';

import { PrismaUserRepository } from './infrastructure/database/repositories/prisma-user.repository';

import { UserController } from './api/user/user.controller';

import { CreateUserUseCase } from './application/user/create-user.usecase';
import { ConfirmEmailUseCase } from './application/user/confirm-email.usecase';
import { RequestOtpUseCase } from './application/user/request-otp.usecase';
import { VerifyOtpUseCase } from './application/user/verify-otp.usecase';

import { UserRepository } from './infrastructure/database/repositories/user.repository';
import { TokenRepository } from './infrastructure/database/repositories/token.repository';
import { OtpRepository } from './infrastructure/database/repositories/otp.repository';

import { JwtService } from './infrastructure/auth/jwt.service';

@Module({
  controllers: [UserController],
  providers: [
    // ✅ repos
    PrismaUserRepository,
    UserRepository,
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
export class AppModule {}