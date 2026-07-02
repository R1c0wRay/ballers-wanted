import { Otp } from '../../../domain/auth/otp.entity';

export class OtpRepository {
  private otps: Otp[] = [];

  async create(userId: string): Promise<Otp> {
    this.otps = this.otps.filter(o => o.userId !== userId);

    const otp = new Otp(
      Math.floor(100000 + Math.random() * 900000).toString(),
      userId,
      'active',
      0
    );

    console.log("OTP generated:", otp.value); //TEMP OTP REQUESTED

    this.otps.push(otp);
    return otp;
  }

  async getActiveByUserId(userId: string): Promise<Otp | null> {
    return this.otps.find(o => o.userId === userId) || null;
  }
}