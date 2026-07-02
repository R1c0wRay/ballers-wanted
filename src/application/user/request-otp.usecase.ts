import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { OtpRepository } from '../../infrastructure/database/repositories/otp.repository';

export class RequestOtpUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
  ) { }

  async execute(input: { email: string }) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      return {
        message: 'If this email is registered, you will receive a code',
      };
    }

    const existingOtp =
      await this.otpRepository.getActiveByUserId(
        user.id
      );

    if (existingOtp) {
      return {
        message: 'OTP already sent',
      };
    }

    const otp = await this.otpRepository.create(user.id);

    return {
      message: 'OTP sent',
      code: otp.value, // TEMP (pas prod)
    };
  }
}
