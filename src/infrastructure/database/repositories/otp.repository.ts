import { randomUUID } from 'crypto';

import { prisma } from '../../prisma/prisma.service';

import {
  Otp,
  OtpStatus,
} from '../../../domain/auth/otp.entity';

export class OtpRepository {

  private toDomain(data: any): Otp | null {

    if (!data) {
      return null;
    }

    return new Otp(
      data.value,
      data.userId,
      data.status as OtpStatus,
      data.attempts,
      data.expiresAt,
      data.blockedUntil,
    );
  }

  async create(userId: string): Promise<Otp> {

    await prisma.otp.deleteMany({
      where: {
        userId,
      },
    });

    const otp = await prisma.otp.create({
      data: {
        id: randomUUID(),

        value: Math.floor(
          100000 + Math.random() * 900000
        ).toString(),

        userId,

        status: 'active',

        attempts: 0,

        expiresAt: new Date(
          Date.now() + 60 * 1000
        ),

        createdAt: new Date(),
      },
    });

    console.log('OTP generated:', otp.value);

    return this.toDomain(otp)!;
  }

  async getActiveByUserId(
    userId: string,
  ): Promise<Otp | null> {

    const otp = await prisma.otp.findFirst({
      where: {
        userId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      return null;
    }

    const domainOtp = this.toDomain(otp);

    return domainOtp?.isActive()
      ? domainOtp
      : null;
  }

  async save(otp: Otp): Promise<void> {

    await prisma.otp.update({
      where: {
        value: otp.value,
      },

      data: {
        status: otp.getStatus(),
        attempts: otp.getAttempts(),
        blockedUntil: otp.getBlockedUntil(),
      },
    });
  }
}