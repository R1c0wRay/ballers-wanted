import { DomainError } from '../../domain/common/domain.error';
import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { OtpRepository } from '../../infrastructure/database/repositories/otp.repository';
import { JwtService } from '../../infrastructure/auth/jwt.service';

export class VerifyOtpUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: { email: string; code: string }) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new DomainError('OTP_INVALID', 'Invalid OTP');
    }

    const otp = await this.otpRepository.getActiveByUserId(user.id);

    if (!otp) {
      throw new DomainError('OTP_INVALID', 'Invalid OTP');
    }

    // ✅ IMPORTANT : on utilise le Domain (comme avant)
    otp.verify(input.code);

    const token = this.jwtService.generate(user.id);

    return {
      userId: user.id,
      accessToken: token,
    };
  }
}
