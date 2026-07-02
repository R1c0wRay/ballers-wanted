import { DomainError } from '../common/domain.error';

export type OtpStatus =
  | 'active'
  | 'used'
  | 'expired'
  | 'blocked';

export class Otp {
  constructor(
    readonly value: string,
    readonly userId: string,
    private status: OtpStatus,
    private attempts: number,
    readonly expiresAt: Date,
    private blockedUntil?: Date,
  ) {}

  isActive(): boolean {
    return this.status === 'active';
  }

  getStatus(): OtpStatus {
    return this.status;
  }

  verify(inputCode: string): void {
    const now = new Date();

    // OTP bloqué
    if (this.status === 'blocked') {
      if (this.blockedUntil && now < this.blockedUntil) {
        throw new DomainError(
          'OTP_BLOCKED',
          'OTP blocked'
        );
      }

      // Fin du blocage => OTP périmé définitivement
      this.status = 'expired';

      throw new DomainError(
        'OTP_EXPIRED',
        'Blocked OTP expired. Request a new OTP.'
      );
    }

    // OTP expiré
    if (now > this.expiresAt) {
      this.status = 'expired';

      throw new DomainError(
        'OTP_EXPIRED',
        'OTP expired'
      );
    }

    // OTP non utilisable
    if (this.status !== 'active') {
      throw new DomainError(
        'OTP_INVALID',
        'OTP not usable'
      );
    }

    // Mauvais code
    if (this.value !== inputCode) {
      this.attempts++;

      if (this.attempts === 3) {
        throw new DomainError(
          'OTP_MAX_ATTEMPTS',
          'Last attempt before block'
        );
      }

      if (this.attempts >= 4) {
        this.status = 'blocked';

        this.blockedUntil = new Date(
          now.getTime() + 20 * 1000
        );

        throw new DomainError(
          'OTP_BLOCKED',
          'OTP blocked for 20 seconds'
        );
      }

      throw new DomainError(
        'OTP_INVALID',
        'Invalid OTP'
      );
    }

    // Succès
    this.status = 'used';
  }
}