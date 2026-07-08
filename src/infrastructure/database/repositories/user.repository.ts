import { User } from '../../../domain/user/user.entity';
import { prisma } from '../../prisma/prisma.service';

export class UserRepository {

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
      },
    });
  }
}