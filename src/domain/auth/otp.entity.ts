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
  ) { }

  isActive(): boolean {

    if (
      this.status !== 'active'
    ) {
      return false;
    }

    if (
      new Date() > this.expiresAt
    ) {

      this.status = 'expired';

      return false;
    }

    return true;
  }

  getStatus(): OtpStatus {
    return this.status;
  }

  getAttempts(): number {
    return this.attempts;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getBlockedUntil(): Date | undefined {
    return this.blockedUntil;
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