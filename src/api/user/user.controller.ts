import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CreateUserUseCase } from '../../application/user/create-user.usecase';
import { ConfirmEmailUseCase } from '../../application/user/confirm-email.usecase';
import { RequestOtpUseCase } from '../../application/user/request-otp.usecase';
import { VerifyOtpUseCase } from '../../application/user/verify-otp.usecase';

import { JwtGuard } from '../auth/jwt.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly confirmEmailUseCase: ConfirmEmailUseCase,
    private readonly requestOtpUseCase: RequestOtpUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
  ) { }

  // ✅ Création utilisateur
  @Post('register')
  create(@Body() body: any) {
    return this.createUserUseCase.execute(body);
  }

  // ✅ Confirmation email
  @Post('confirm/:token')
  confirm(@Param('token') token: string) {
    return this.confirmEmailUseCase.execute({
      tokenValue: token,
    });
  }

  // ✅ Demande OTP
  @Post('otp/request')
  requestOtp(@Body() body: any) {
    return this.requestOtpUseCase.execute({
      email: body.email,
    });
  }

  // ✅ Vérification OTP (login)
  @Post('otp/verify')
  verifyOtp(@Body() body: any) {
    return this.verifyOtpUseCase.execute({
      email: body.email,
      code: body.code,
    });
  }

  // ✅ ✅ ✅ ROUTE PROTÉGÉE JWT (IMPORTANT)
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return {
      message: 'Access granted ✅',
      userId: req.userId,
    };
  }
}
