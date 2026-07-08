import { randomUUID } from 'crypto';

import { prisma } from '../../prisma/prisma.service';

import {
  EmailConfirmationToken,
  TokenStatus,
} from '../../../domain/auth/email-confirmation-token.entity';

import { DomainError } from '../../../domain/common/domain.error';

export class TokenRepository {

  private toDomain(data: any): EmailConfirmationToken {

    return new EmailConfirmationToken(
      data.value,
      data.userId,
      data.status as TokenStatus,
      data.expiresAt,
    );
  }

  async create(
    userId: string,
  ): Promise<EmailConfirmationToken> {

    const token = await prisma.confirmationToken.create({
      data: {
        id: randomUUID(),

        value: randomUUID(),

        userId,

        status: 'active',

        expiresAt: new Date(
          Date.now() + 5 * 60 * 1000
        ),

        createdAt: new Date(),
      },
    });

    return this.toDomain(token);
  }

  async getByValue(
    value: string,
  ): Promise<EmailConfirmationToken> {

    const token =
      await prisma.confirmationToken.findUnique({
        where: { value },
      });

    if (!token) {
      throw new DomainError(
        'TOKEN_NOT_FOUND',
        'Token not found',
      );
    }

    return this.toDomain(token);
  }

  async save(
    token: EmailConfirmationToken,
  ): Promise<void> {

    await prisma.confirmationToken.update({
      where: {
        value: token.value,
      },

      data: {
        status: token.getStatus(),
      },
    });
  }
}