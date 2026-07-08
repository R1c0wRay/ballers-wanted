import { Otp } from '../../../domain/auth/otp.entity';

export class OtpRepository {
  private otps: Otp[] = [];

  async create(userId: string): Promise<Otp> {

    this.otps = this.otps.filter(
      o => o.userId !== userId
    );

    const expiresAt = new Date(
      Date.now() + 20 * 1000
    );

    const otp = new Otp(
      Math.floor(
        100000 + Math.random() * 900000
      ).toString(),
      userId,
      'active',
      0,
      expiresAt
    );

    this.otps.push(otp);

    console.log(otp);

    return otp;
  }

  async getActiveByUserId(
    userId: string
  ): Promise<Otp | null> {

    const otp =
      this.otps.find(
        o => o.userId === userId
      ) || null;

    if (!otp) {
      return null;
    }

    return otp.isActive()
      ? otp
      : null;
  }
}