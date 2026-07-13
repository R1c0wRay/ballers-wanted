import { UserRepository } from '../../infrastructure/database/repositories/user.repository';
import { OtpRepository } from '../../infrastructure/database/repositories/otp.repository';
import { EmailService } from '../../infrastructure/email/email.service';

export class RequestOtpUseCase {
  constructor(
    private readonly userRepository: any,
    private readonly otpRepository: any,
    private readonly emailService: EmailService,
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

    await this.emailService.sendOtpEmail(
      user.getEmail(),
      otp.value,
    );

    return {
      message: 'OTP sent',
    };
  }
}
