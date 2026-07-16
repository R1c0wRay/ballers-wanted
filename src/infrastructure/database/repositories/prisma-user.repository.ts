import { User } from '../../../domain/user/user.entity';
import { prisma } from '../../prisma/prisma.service';

export class PrismaUserRepository {

  private toDomain(data: any): User | null {

    if (!data) {
      return null;
    }

    return new User(
      data.id,
      data.pseudo,
      data.email,
      data.pictoId,
      data.status,
      data.consentVersion,
      data.consentAcceptedAt,
      data.createdAt,
      data.secondConfirmationSentAt
    );
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return this.toDomain(user);
  }

  async findByPseudo(pseudo: string) {
    const user = await prisma.user.findUnique({
      where: { pseudo },
    });

    return this.toDomain(user);
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return this.toDomain(user);
  }

  async save(user: User) {

    const consent = user.getConsentInfo();

    await prisma.user.upsert({
      where: {
        id: user.id,
      },

      update: {
        status: user.getStatus(),

        secondConfirmationSentAt:
          user.getSecondConfirmationSentAt(),
      },

      create: {
        id: user.id,
        pseudo: user.getPseudo(),
        email: user.getEmail(),

        pictoId: user.getPictoId(),

        status: user.getStatus(),

        consentVersion: consent.version,
        consentAcceptedAt: consent.acceptedAt,

        createdAt: user.createdAt,

        secondConfirmationSentAt:
          user.getSecondConfirmationSentAt(),
      },
    });
  }

  async findPendingOlderThan(
    durationMs: number,
  ) {

    const limitDate =
      new Date(
        Date.now() - durationMs,
      );

    const users =
      await prisma.user.findMany({

        where: {
          status: 'pending',

          createdAt: {
            lt: limitDate,
          },
        },
      });

    return users
      .map((user) =>
        this.toDomain(user),
      )
      .filter(Boolean);
  }
}
