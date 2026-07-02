import { DomainError } from '../common/domain.error';

export type OtpStatus = 'active' | 'used' | 'expired' | 'blocked';

export class OtpCode {
  constructor(
    readonly value: string,
    readonly userId: string,
    private status: OtpStatus,
    readonly expiresAt: Date,
    private attempts: number,
    private blockedUntil?: Date
  ) {}

  verify(input: string): void {
    const now = new Date();

    // ✅ 1. Bloqué
    if (this.status === 'blocked') {
      if (this.blockedUntil && now < this.blockedUntil) {
        throw new DomainError('OTP_BLOCKED', 'Code blocked');
      } else {
        // ✅ débloqué après 5 min
        this.status = 'active';
        this.attempts = 0;
        this.blockedUntil = undefined;
      }
    }

    // ✅ 2. Expiration
    if (now > this.expiresAt) {
      this.status = 'expired';
      throw new DomainError('OTP_EXPIRED', 'OTP expired');
    }

    // ✅ 3. Déjà utilisé
    if (this.status !== 'active') {
      throw new DomainError('OTP_INVALID', 'OTP not usable');
    }

    // ✅ 4. Mauvais code
    if (this.value !== input) {
      this.attempts++;

      if (this.attempts === 3) {
        throw new DomainError(
          'OTP_MAX_ATTEMPTS',
          'Last attempt before block'
        );
      }

      if (this.attempts >= 4) {
        this.status = 'blocked';
        this.blockedUntil = new Date(now.getTime() + 5 * 60 * 1000);

        throw new DomainError(
          'OTP_BLOCKED',
          'Too many attempts. Code blocked for 5 minutes'
        );
      }

      throw new DomainError('OTP_INVALID', 'Invalid OTP');
    }

    // ✅ 5. Succès
    this.status = 'used';
  }
}