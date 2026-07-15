import { EmailService } from '../../infrastructure/email/email.service';
import { DomainError } from '../../domain/common/domain.error';

export class RequestOtpUseCase {
  constructor(
    private readonly userRepository: any,
    private readonly otpRepository: any,
    private readonly tokenRepository: any,
    private readonly emailService: EmailService,
  ) { }

  async execute(input: { email: string }) {

    input.email = input.email
      .trim()
      .toLowerCase();

    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new DomainError(
        'USER_NOT_FOUND',
        input.email,
      );
    }

    if (user.getStatus() === 'pending') {

      const activeToken =
        await this.tokenRepository
          .getActiveByUserId(user.id);

      if (activeToken) {

        throw new DomainError(
          'ACCOUNT_NOT_CONFIRMED',
          'Account not confirmed',
        );
      }

      await this.tokenRepository
        .invalidateByUserId(user.id);

      const token =
        await this.tokenRepository.create(
          user.id,
        );

      await this.emailService
        .sendConfirmationEmail(
          user.getEmail(),
          token.value,
        );

      throw new DomainError(
        'CONFIRMATION_LINK_RESENT',
        'Confirmation link resent',
      );
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
