import { DomainError } from '../common/domain.error';

export class Otp {
  constructor(
    readonly value: string,
    readonly userId: string,
    private status: string,
    private attempts: number,
  ) { }

  verify(inputCode: string) {
    // ✅ si déjà bloqué
    if (this.status === 'blocked') {
      throw new DomainError('OTP_BLOCKED', 'Code blocked');
    }

    // ✅ mauvais code
    if (this.value !== inputCode) {
      this.attempts++;

      // ✅ 3e tentative = warning (DERNIER ESSAI)
      if (this.attempts === 3) {
        throw new DomainError(
          'OTP_MAX_ATTEMPTS',
          'Last attempt before block'
        );
      }

      // ✅ 4e tentative = blocage
      if (this.attempts >= 4) {
        this.status = 'blocked';

        throw new DomainError(
          'OTP_BLOCKED',
          'Too many attempts. Code blocked'
        );
      }

      // ✅ tentative 1 & 2
      throw new DomainError('OTP_INVALID', 'Invalid OTP');
    }

    // ✅ succès
    this.status = 'used';
  }
}