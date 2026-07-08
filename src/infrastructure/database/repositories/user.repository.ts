import { prisma } from '../../prisma/prisma.service';

export class UserRepository {

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPseudo(pseudo: string) {
    return await prisma.user.findUnique({
      where: { pseudo },
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async save(user: any) {

    await prisma.user.upsert({
      where: {
        id: user.id,
      },

      update: {
        status: user.isActive() ? 'active' : 'pending',
      },

      create: {
        id: user.id,
        pseudo: user.getPseudo(),
        email: user.getEmail(),

        pictoId: user.pictoId,

        status: 'pending',

        consentVersion: 'v1',
        consentAcceptedAt: new Date(),

        createdAt: user.createdAt,
      },
    });
  }
}
